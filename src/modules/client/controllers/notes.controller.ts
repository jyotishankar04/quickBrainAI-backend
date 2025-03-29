import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { ICustomRequest } from "../../../types/client.types";
import {
  createNotesValidator,
  getErrorMessage,
  updateNotesValidator,
} from "../../../validator/validator";
import NotesService from "../services/notes.service";
import aiService from "../services/ai.service";
import { TcreateServiceSuccess } from "../../../utils/service.error";

class NotesController {
  public async createNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const _req = req as ICustomRequest;
      const { noteTitle, noteDescription, noteCategory, noteTags, isPrivate } =
        req.body;

      const tags =
        typeof noteTags === "string" ? noteTags.split(",") : noteTags || [];

      const validate = createNotesValidator.safeParse({
        noteTitle,
        noteDescription,
        noteCategory,
        noteTags: tags,
        isPrivate: isPrivate == "true" || isPrivate == true ? true : false,
      });

      if (!validate.success) {
        return next(createHttpError(400, getErrorMessage(validate.error)));
      }

      let uploadStatus: any = null;
      let filePath = "";
      let fileUrl = "";

      if (_req.file) {
        uploadStatus = await NotesService.uploadPdf(_req.file);
        console.log(uploadStatus);
        if (!uploadStatus) {
          return next(createHttpError(500, "Failed to upload PDF"));
        }
        filePath = _req.file.path;
        fileUrl = uploadStatus.result.secure_url;
      }

      const note = await NotesService.createNote(_req.user.id, {
        noteTitle,
        noteDescription,
        noteCategory: noteCategory || "general",
        noteTags: tags,
        isPrivate: isPrivate == "true" || isPrivate == true ? true : false,
        fileUrl,
        filePath,
      });

      if (!note) {
        return next(createHttpError(500, "Error creating note"));
      }

      if (filePath) {
        const status = await aiService.embedPdfFile(filePath, note.id);
        if (!status) {
          return next(createHttpError(500, "Error processing PDF"));
        }
      }

      if (uploadStatus && uploadStatus.filePath) {
        await NotesService.unlinkPdf(uploadStatus.filePath);
      }

      return res.json({
        success: true,
        message: "Note created successfully",
        data: note,
      });
    } catch (error) {
      console.error(error);
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
      let orderBy = req.query.orderBy as string;
      let sortBy = req.query.sortBy as string;
      let filterBy = req.query.filterBy as string;

      if (!sortBy) {
        sortBy = "desc";
      }
      if (sortBy !== "asc" && sortBy !== "desc") {
        sortBy = "desc";
      }
      if (!["newest", "oldest", "modified", "atoz", "ztoa"].includes(orderBy)) {
        orderBy = "updatedAt";
      }
      if (!["asc", "desc"].includes(sortBy)) {
        sortBy = "desc";
      }
      if (orderBy === "newest") {
        orderBy = "createdAt";
        sortBy = "desc";
      }
      if (orderBy === "oldest") {
        orderBy = "createdAt";
        sortBy = "asc";
      }
      if (orderBy === "modified") {
        orderBy = "updatedAt";
      }

      if (!["all", "starred", "recent"].includes(filterBy)) {
        filterBy = "all";
      }
      const { notes, _count } = await NotesService.getNotes(
        _req.user.id,
        limit,
        offset,
        category === "all" ? undefined : category,
        filterBy,
        orderBy,
        sortBy
      );
      const totalPages = Math.ceil(_count.notes / limit);

      return res.json({
        message: "Notes retrieved successfully",
        data: notes,
        pagination: {
          currentPage: page,
          pageSize: notes.length,
          totalPages,
          totalNotes: _count.notes,
        },
      });
    } catch (error) {
      console.error(error);
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
  public async updateNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const _req = req as ICustomRequest;
    try {
      const { noteTitle, noteDescription, noteCategory, noteTags, isPrivate } =
        req.body;
      console.log(req.body);
      const validate = updateNotesValidator.safeParse({
        noteTitle,
        noteDescription,
        noteCategory,
        noteTags,
        isPrivate: isPrivate == "true" || isPrivate == true ? true : false,
      });

      if (!validate.success) {
        return next(createHttpError(400, getErrorMessage(validate.error)));
      }
      const note = await NotesService.updateNote(
        req.params.id,
        {
          noteTitle,
          noteDescription,
          noteCategory,
          noteTags,
          isPrivate: isPrivate == "true" || isPrivate == true ? true : false,
        },
        _req.user.id
      );
      if (!note.success) {
        return next(createHttpError(note.status, note.message));
      }
      return res.json({
        success: true,
        message: "Note updated successfully",
        data: note.data,
      });
    } catch (error) {
      console.error(error);
      return next(createHttpError(500, "Error updating note"));
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
        _req.user.id,
        req.body.name
      );
      if (!category || category.success === false) {
        return next(createHttpError(category.status, category.message));
      }
      return res.json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      return next(createHttpError(500, "Error creating category"));
    }
  }

  // Favorite notes
  public async toggleStarredNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const _req = req as ICustomRequest;
      const noteId = req.params.id;
      if (!noteId) return next(createHttpError(400, "Note id is required"));

      const note = await NotesService.toggleStarredNote(noteId, _req.user.id);
      if (!note.success) {
        return next(createHttpError(404, "Note not found"));
      }

      return res.json({
        success: true,
        message: "Note starred successfully",
        data: note.data,
      });
    } catch (error) {
      return next(createHttpError(500, "Error toggling starred note"));
    }
  }
  public async deleteNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const _req = req as ICustomRequest;
      const noteId = req.params.id;
      if (!noteId) return next(createHttpError(400, "Note id is required"));
      const note = await NotesService.deleteNote(noteId, _req.user.id);
      if (!note.success) {
        return next(createHttpError(note.status, note.message));
      }
      return res.json({
        success: true,
        message: "Note deleted successfully",
        data: note.data,
      });
    } catch (error) {
      return next(createHttpError(500, "Error deleting note"));
    }
  }
  public async getChat(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const _req = req as ICustomRequest;
      const noteId = req.params.id;
      if (!noteId) return next(createHttpError(400, "Note id is required"));
      const chat = await NotesService.getChatsByNoteId(noteId);
      if (!chat.success) {
        return res.json({
          success: false,
          message: "Chat not found",
          data: [],
        });
      }
      return res.json({
        success: true,
        message: "Chat retrieved successfully",
        data: chat.data,
      });
    } catch (error) {
      console.error(error);
      return next(createHttpError(500, "Error getting chat"));
    }
  }
  public async saveNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const _req = req as ICustomRequest;
      const noteId = req.params.id;
      const content = req.body.content;
      if (!noteId) return next(createHttpError(400, "Note id is required"));
      const note = await NotesService.saveNote(noteId, content);
      if (!note.success) {
        return next(createHttpError(note.status, note.message));
      }
      return res.json({
        success: true,
        message: "Note saved successfully",
        data: note.data,
      });
    } catch (error) {
      console.error(error);
      return next(createHttpError(500, "Error saving note"));
    }
  }
}
export default new NotesController();
