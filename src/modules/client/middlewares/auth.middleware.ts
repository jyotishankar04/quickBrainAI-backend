import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { ICustomRequest } from "../../../types/client.types";
import _env from "../../../config/envConfig";
import { IAuthTokenParams } from "../../../types/client.types";
import AuthService from "../services/auth.service";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return next(createHttpError(400, "Access Denied!, Token is missing"));
  }
  try {
    const { id, email } = jwt.verify(
      token,
      _env.JWT_SECRET as string
    ) as IAuthTokenParams;

    if (!id || !email) {
      res.clearCookie("accressToken", {
        httpOnly: true,
      });
    }

    const _req = req as ICustomRequest;
    _req.user = {
      id: id,
      email: email,
    };
    if (!id || !email) {
      res.clearCookie("accressToken", {
        httpOnly: true,
      });
      return next(createHttpError(400, "Access Denied!, Invalid Token"));
    }
    next();
  } catch (err) {
    return next(createHttpError(400, "Access Denied!, Invalid Token"));
  }
};

export default authMiddleware;
