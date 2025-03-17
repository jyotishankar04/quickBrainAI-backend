import { NextFunction, Request, Response } from "express";

class NotesController {
  public async createNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    res.json({
      message: "Note created successfully",
    });
  }
}

export default new NotesController();
