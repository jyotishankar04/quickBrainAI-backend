import { NextFunction, Request, Response } from "express";
import AiService from "../services/ai.service";
import path from "path";
import { ICustomRequest } from "../../../types/client.types";
import createHttpError from "http-errors";

class AiController {
  public async getPdfSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
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
  ): Promise<any> {
    const noteId = req.body.noteId;
    const question = req.body.question;
    const answer = await AiService.getAnswerFromPdf(noteId, question);
    res.json({
      message: "Answer retrieved successfully!",
      data: answer,
    });
  }
  public async getChatFromPdf(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const noteId = req.params.noteId;
    if (!noteId) {
      return next(createHttpError(400, "Note ID is required"));
    }
    if (!req.body.question) {
      return next(createHttpError(400, "Question is required")); // Error: Question is required
    }

    try {
      const chat = await AiService.getChatFromPdf(noteId, req.body.question);
      return res.json({
        success: true,
        message: "Chat retrieved successfully!",
        data: chat,
      });
    } catch (error) {
      console.error(error);
      return next(createHttpError(400, "Error retrieving chat"));
    }
  }
}

export default new AiController();
