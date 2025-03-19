import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v4 as uuidv4 } from "uuid";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PineconeEmbeddings } from "@langchain/pinecone";

import {
  EmbeddingsList,
  Index,
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import _env from "../../../config/envConfig";
import notesService from "./notes.service";
import {
  answerModel,
  chatBotModel,
  summaryModel,
} from "../../../config/gemini.config";
import prisma from "../../../config/prisma.config";

class AiService {
  private async loadPDFDocument(pdfPath: string) {
    if (!pdfPath) return null;
    const pdfLoader = new PDFLoader(pdfPath);
    return await pdfLoader.load();
  }

  private async splitPDFText(loadedDocs: any) {
    if (!loadedDocs) return null;
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 200,
    });
    return await textSplitter.splitDocuments(loadedDocs);
  }

  private getIndex(): {
    pc: Pinecone;
    index: Index<RecordMetadata>;
  } {
    const pc = new Pinecone({
      apiKey: _env.PINECONE_API_KEY as string, // Use environment variable
    });

    const index = pc.index("quick-brain-ai");

    return {
      pc,
      index,
    };
  }

  private async pushToPinecone(splittedDocs: any, noteId: string) {
    try {
      const { pc, index } = this.getIndex();
      const embeddings = new PineconeEmbeddings({
        model: "multilingual-e5-large",
      });

      const vectors = await embeddings.embedDocuments(
        splittedDocs.map((doc: any) => doc.pageContent)
      );
      const records = splittedDocs.map((doc: any, index: number) => {
        return {
          id: uuidv4().substring(0, 8), // algo to generate id
          text: doc.pageContent,
          values: vectors[index].values,
        };
      });
      await index.namespace(noteId).upsertRecords(records as any);
      return true;
    } catch (error) {
      console.error("Error in pushToPinecone:", error);
      return null;
    }
  }

  private async embedPdf(pdfPath: string, noteId: string) {
    try {
      if (!pdfPath) return null;
      // Step 1: Load PDF
      const docs = await this.loadPDFDocument(pdfPath);
      if (!docs) return null;
      // Step 2: Split PDF into chunks
      const splittedDocs = await this.splitPDFText(docs);
      if (!splittedDocs) return null;
      // Step 3: Push to Pinecone
      const res = await this.pushToPinecone(splittedDocs, noteId);
      return res;
    } catch (error) {
      console.error("Error in embedPdf:", error);
      throw error;
    }
  }
  private async getEmbeddingsList(topK: number = 1, question: string) {
    const { index } = this.getIndex();
    if (!index) return null;
    const res = await index.searchRecords({
      query: {
        topK,
        inputs: {
          text: question,
        },
      },
    });
    if (
      !res ||
      !res.result ||
      !res.result.hits[0] ||
      !res.result.hits[0].fields
    ) {
      return null;
    }
    return res.result.hits.map((hit: any) => hit.fields);
  }

  public async embedPdfFile(file: string, noteId: string) {
    try {
      const status = await this.embedPdf(file, noteId);
      if (!status) return false;
      return status;
    } catch (error) {
      console.error("Error in embedPdfFile:", error);
      return false;
    }
  }
  public async extractPdfText(pdfPath: string) {
    try {
      const docs = await this.loadPDFDocument(pdfPath);
      if (!docs) return null;
      const splittedDocs = await this.splitPDFText(docs);
      if (!splittedDocs) return null;
      return splittedDocs.map((doc: any) => doc.pageContent).join(" ");
    } catch (error) {
      console.error("Error in extractPdfText:", error);
      return null;
    }
  }
  public async getPdfSummary(noteId: string) {
    const note = await notesService.getNoteByNoteId(noteId); // Assuming notesService is accessible via 'this'
    if (!note) {
      return new Error("Note not found");
    }
    console.log("note", note);
    const content = note.extractedText;

    try {
      if (!content) {
        return { error: "No content found." };
      }

      const result = await summaryModel.generateContent(
        "Give me a summary for :" + content
      );
      if (
        !result ||
        !result.response ||
        !result.response.candidates ||
        !result.response.candidates[0] ||
        !result.response.candidates[0].content ||
        !result.response.candidates[0].content.parts ||
        !result.response.candidates[0].content.parts[0] ||
        !result.response.candidates[0].content.parts[0].text
      ) {
        return new Error("Error generating summary");
      }
      console.log(result.response);
      //parse the resopnse to json
      const summary = JSON.parse(
        result.response.candidates[0].content.parts[0].text
      );
      return {
        summary: summary.summary,
        keyPoints: summary.keyPoints,
      };
    } catch (error) {
      console.error("Error generating summary:", error);
      return new Error("Error generating summary");
    }
  }
  public async getAnswerFromPdf(noteId: string, question: string) {
    const note = await notesService.getNoteByNoteId(noteId); // Assuming notesService is accessible via 'this'
    if (!note) return null;
    const { index } = this.getIndex();
    if (!index) return null;
    const embedPdfFile = await index.namespace(noteId).searchRecords({
      query: {
        topK: 5,
        inputs: {
          text: question,
        },
      },
    });
    if (
      !embedPdfFile ||
      !embedPdfFile.result ||
      !embedPdfFile.result.hits[0] ||
      !embedPdfFile.result.hits[0].fields ||
      !embedPdfFile.result.hits[0].fields
    ) {
      return null;
    }
    const record = embedPdfFile.result.hits.map((hit: any) => hit.fields);
    console.log("record", record);
    const res = await answerModel.generateContent(
      "What is the answer to this question: " +
        question +
        " ?" +
        "from the document in simple understandable language (if not found then return emptystring) : " +
        JSON.stringify(record)
    );
    if (
      !res ||
      !res.response ||
      !res.response.candidates ||
      !res.response.candidates[0] ||
      !res.response.candidates[0].content ||
      !res.response.candidates[0].content.parts ||
      !res.response.candidates[0].content.parts[0] ||
      !res.response.candidates[0].content.parts[0].text
    ) {
      return null;
    }
    const answer = JSON.parse(res.response.candidates[0].content.parts[0].text);
    return answer;
  }

  // Chat from PDF
  public async getChatFromPdf(noteId: string, question: string) {
    const note = await notesService.getNoteByNoteId(noteId); // Assuming notesService is accessible via 'this'
    if (!note) return new Error("Note not found");
    const chatId = note.chatId;
    const record = await this.getEmbeddingsList(1, question);
    console.log("record", record);
    const res = await chatBotModel.generateContent(
      "What is the answer to this question: " +
        question +
        " ?" +
        "from the document in simple understandable language (if not found then return emptystring) : " +
        JSON.stringify(record)
    );
    if (
      !res ||
      !res.response ||
      !res.response.candidates ||
      !res.response.candidates[0] ||
      !res.response.candidates[0].content ||
      !res.response.candidates[0].content.parts ||
      !res.response.candidates[0].content.parts[0] ||
      !res.response.candidates[0].content.parts[0].text
    ) {
      return new Error("Error in getting response");
    }
    const answer = JSON.parse(
      res.response.candidates[0].content.parts[0].text
    ).answer;
    if (!chatId) {
      const createRes = await prisma.chat.create({
        data: {
          Notes: {
            connect: {
              id: note.id,
            },
          },
          user: {
            connect: {
              id: note.userId,
            },
          },
          messages: {
            createMany: {
              data: [
                {
                  content: question,
                  sender: "USER",
                },
                {
                  content: answer,
                  sender: "AI",
                },
              ],
            },
          },
          noteId: note.id,
        },
        include: {
          messages: {
            select: {
              content: true,
              sender: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 2,
          },
        },
      });
      return createRes.messages;
    } else {
      const createRes = await prisma.chat.update({
        where: {
          id: chatId,
        },
        data: {
          messages: {
            createMany: {
              data: [
                {
                  content: question,
                  sender: "USER",
                },
                {
                  content: answer,
                  sender: "AI",
                },
              ],
            },
          },
        },
        include: {
          messages: {
            select: {
              content: true,
              sender: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 2,
          },
        },
      });
      return createRes.messages;
    }
  }
}

export default new AiService();
