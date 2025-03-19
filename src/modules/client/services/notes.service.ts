import { Notes } from "@prisma/client";
import { CLOUDINARY_FOLDER } from "../../../config/constants";
import prisma from "../../../config/prisma.config";
import { uploadOnCloudinary } from "../../../utils/cloudinary.utils";
import fs from "fs";
import aiService from "./ai.service";

interface ICreateNote {
  noteTitle: string;
  noteDescription: string;
  noteCategory: string;
  noteTags: string[];
  isPrivate: boolean;
  fileUrl: string;
  filePath: string;
}
class NotesService {
  private async getNotesByUserId(
    userId: string,
    limit: number,
    offset: number
  ) {
    const notes = await prisma.notes.findMany({
      where: {
        user: {
          id: userId,
        },
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });
    return notes;
  }
  private async getNotesByCategoryId(
    userId: string,
    limit: number,
    offset: number,
    categoryId: string
  ) {
    const notes = await prisma.notes.findMany({
      where: {
        user: {
          id: userId,
        },
        category: {
          id: categoryId,
        },
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });
    return notes;
  }
  public async checkIsCategoryExists(categoryId: string) {
    try {
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });
      if (category) return true;
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async countNotesByUserId(userId: string) {
    try {
      const count = await prisma.notes.count({
        where: {
          user: {
            id: userId,
          },
        },
      });
      return count;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  public async uploadPdf(file: Express.Multer.File) {
    // Upload pdf logic
    if (!file) return false;
    try {
      const result = await uploadOnCloudinary(
        file.path,
        CLOUDINARY_FOLDER.pdfs
      );
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  public async unlinkPdf(fileUrl: string) {
    // Unlink pdf logic
    if (!fileUrl) return false;
    fs.unlinkSync(fileUrl);
  }
  public async createNote(
    userId: string,
    {
      noteTitle,
      noteDescription,
      noteCategory = "General",
      noteTags,
      isPrivate,
      fileUrl,
      filePath,
    }: ICreateNote
  ) {
    try {
      let text;
      if (filePath) {
        text = await aiService.extractPdfText(filePath);
      } else {
        text = "";
      }
      const result = await prisma.notes.create({
        data: {
          noteTitle,
          noteDescription,
          tags: {
            set: noteTags,
          },
          extractedText: text as string,
          noteContent: "",
          category: {
            connectOrCreate: {
              where: {
                name_userId: {
                  name: noteCategory,
                  userId,
                },
              },
              create: {
                name: noteCategory.toLowerCase(),
                userId,
              },
            },
          },
          isPrivate: isPrivate || false,
          files: [fileUrl],
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  public async getNotes(
    userId: string,
    limit: number,
    offset: number,
    category?: string,
    tag?: string
  ): Promise<Notes[]> {
    try {
      if (category) {
        return this.getNotesByCategoryId(userId, limit, offset, category);
      }

      return this.getNotesByUserId(userId, limit, offset);
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  public async getNoteByNoteId(noteId: string) {
    try {
      const note = await prisma.notes.findUnique({
        where: {
          id: noteId,
        },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          chat: {
            include: {
              messages: true,
            },
          },
        },
      });
      return note;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  public async noteSearch(query: string, userId: string) {
    try {
      console.log(query);
      const notes = await prisma.notes.findMany({
        where: {
          AND: [
            {
              noteTitle: {
                contains: query,
              },
            },
            {
              user: {
                id: userId,
              },
            },
          ],
        },
      });
      return notes;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  public async getNoteCategories(userId: string) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          userId,
        },
      });
      return categories;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  public async createCategory(userId: string, name: string) {
    try {
      const category = await prisma.category.create({
        data: {
          name,
          User: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return category;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

export default new NotesService();
