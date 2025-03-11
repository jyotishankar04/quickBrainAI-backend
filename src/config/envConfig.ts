import { config } from "dotenv";

config();

const _config = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  MAILTRAP_TOKEN: process.env.MAILTRAP_TOKEN,
};

const _env = Object.freeze(_config);

export default _env;
