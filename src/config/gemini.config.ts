import _env from "./envConfig";
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
const summarySchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "The summary in HTML format",
    },
    keyPoints: {
      type: SchemaType.ARRAY,
      description: "List of key points with titles and descriptions",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description: "The title of the key point in HTML format",
          },
          description: {
            type: SchemaType.STRING,
            description: "The description of the key point in HTML format",
          },
        },
      },
    },
  },
};
const genAI = new GoogleGenerativeAI(_env.GOOGLE_API_KEY as string);
const summaryModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.5,
    responseSchema: summarySchema as Schema,
  },
});

// Define the schema for the answer model
const answerSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    answers: {
      type: SchemaType.ARRAY,
      description: "List of possible answers",
      items: {
        type: SchemaType.STRING,
        description: "A possible answer to the question",
      },
      minItems: 3,
      maxItems: 3,
    },
  },
};
const answerModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.5,
    responseSchema: answerSchema as Schema,
  },
});

export { summaryModel, answerModel };
