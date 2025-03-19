import { Request } from "express";

export interface IAuthTokenParams {
  id: string;
  email: string;
}

export interface ICustomRequest extends Request {
  user: {
    id: string;
    email: string;
  };
  files: {
    [key: string]: Express.Multer.File[];
  };
  file: Express.Multer.File;
}
