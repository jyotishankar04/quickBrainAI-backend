import { NextFunction, Request, Response } from "express";
import AiService from "../services/ai.service";
import path from "path";
import { ICustomRequest } from "../../../types/client.types";
import createHttpError from "http-errors";

class AiController {
  public async getPdfSummary(req: Request, res: Response, next: NextFunction) {
    const noteId = req.body.noteId;
    const summary = await AiService.getPdfSummary(noteId);
    res.json({
      message: "PDF summary retrieved successfully!",
      data: summary,
    });
  }
  public async getAnswerFromPdf(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const noteId = req.body.noteId;
    const question = req.body.question;
    const answer = await AiService.getAnswerFromPdf(noteId, question);
    res.json({
      message: "Answer retrieved successfully!",
      data: answer,
    });
  }
}

export default new AiController();
