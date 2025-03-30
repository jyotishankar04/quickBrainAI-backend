import { config } from "dotenv";

config();

const _config = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  MAILTRAP_TOKEN: process.env.MAILTRAP_TOKEN,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
};
console.log(_config);

const _env = Object.freeze(_config);

export default _env;
