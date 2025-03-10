import { config } from "dotenv";

config();

const _config = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  //   JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  //   COOKIE_EXPIRES_IN: process.env.COOKIE_EXPIRES_IN,
};

const _env = Object.freeze(_config);

export default _env;
