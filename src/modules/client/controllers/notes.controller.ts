import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { ICustomRequest } from "../../../types/client.types";
import {
  createNotesValidator,
  getErrorMessage,
} from "../../../validator/validator";
import NotesService from "../services/notes.service";
import aiService from "../services/ai.service";

class NotesController {
  public async createNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { noteTitle, noteDescription, noteCategory, noteTags, isPrivate } =
        req.body;
      const validate = createNotesValidator.safeParse({
        noteTitle,
        noteDescription,
        noteCategory,
        noteTags,
        isPrivate,
      });
      if (!validate.success) {
        return next(createHttpError(400, getErrorMessage(validate.error)));
      }

      const _req = req as ICustomRequest;

      let uploadStatus: any = null;
      if (_req.file) {
        uploadStatus = await NotesService.uploadPdf(_req.file);
        if (!uploadStatus) {
          return next(createHttpError(500, "Failed to upload pdf"));
        }
      }
      const note = await NotesService.createNote(_req.user.id, {
        noteTitle,
        noteDescription,
        noteCategory: noteCategory || "general",
        noteTags: noteTags || [],
        isPrivate: isPrivate || false,
        fileUrl: uploadStatus?.result.secure_url || "",
        filePath: _req.file?.path || "",
      });

      if (!note) {
        return next(createHttpError(500, "Error creating note"));
      }
      const status = await aiService.embedPdfFile(
        uploadStatus?.filePath,
        note.id
      );
      if (!status) {
        return next(createHttpError(500, "Error creating note"));
      }

      if (uploadStatus) {
        await NotesService.unlinkPdf(uploadStatus.filePath);
      }

      return res.json({
        message: "Note created successfully",
        data: note,
      });
    } catch (error) {
      return next(createHttpError(500, "Error creating note"));
    }
  }
  public async getNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const _req = req as ICustomRequest;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const category = req.query.category as string;
      const tag = req.query.tag as string;

      if (category && tag) {
        return next(
          createHttpError(
            400,
            "You can't use both category and tag in the same time"
          )
        );
      }
      if (category) {
        const isCategoryExists = await NotesService.checkIsCategoryExists(
          category
        );
        if (!isCategoryExists) {
          return next(createHttpError(404, "Category not found"));
        }
      }

      const notes = await NotesService.getNotes(
        _req.user.id,
        limit,
        offset,
        category,
        tag
      );
      const totalNotes = await NotesService.countNotesByUserId(_req.user.id);
      const totalPages = Math.ceil(totalNotes / limit);

      return res.json({
        message: "Notes retrieved successfully",
        data: notes,
        pagination: {
          currentPage: page,
          pageSize: notes.length,
          totalPages,
          totalNotes,
        },
      });
    } catch (error) {
      return next(createHttpError(500, "Error getting notes"));
    }
  }
  public async getNoteById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    console.log(req.query.q);
    try {
      const noteId = req.params.id;
      if (!noteId) return next(createHttpError(400, "Note id is required"));
      const note = await NotesService.getNoteByNoteId(noteId);
      if (!note) {
        return next(createHttpError(404, "Note not found"));
      }
      return res.json({
        success: true,
        message: "Note retrieved successfully",
        data: note,
      });
    } catch (error) {
      return next(createHttpError(500, "Error getting note"));
    }
  }
  public async searchNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const query = req.query.q as string;
      console.log(query);
      if (!query) return next(createHttpError(400, "Query is required"));
      const _req = req as ICustomRequest;

      if (!query) return next(createHttpError(400, "Query is required"));
      const notes = await NotesService.noteSearch(query, _req.user.id);
      return res.json({
        success: true,
        message: "Notes retrieved successfully",
        data: notes,
      });
    } catch (error) {
      return next(createHttpError(500, "Error getting notes"));
    }
  }
  public async getCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const _req = req as ICustomRequest;
      const categories = await NotesService.getNoteCategories(_req.user.id);
      return res.json({
        success: true,
        message: "Categories retrieved successfully",
        data: categories,
      });
    } catch (error) {
      return next(createHttpError(500, "Error getting categories"));
    }
  }
  public async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const _req = req as ICustomRequest;
      const category = await NotesService.createCategory(
        req.body.name,
        _req.user.id
      );
      return res.json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      return next(createHttpError(500, "Error creating category"));
    }
  }
}

export default new NotesController();
