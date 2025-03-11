import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";

const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message: err.message || "Internal server error",
  });
};

export default globalErrorHandler;
