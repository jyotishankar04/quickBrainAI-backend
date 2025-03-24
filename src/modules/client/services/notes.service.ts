import { Notes } from "@prisma/client";
import { CLOUDINARY_FOLDER } from "../../../config/constants";
import prisma from "../../../config/prisma.config";
import { uploadOnCloudinary } from "../../../utils/cloudinary.utils";
import fs from "fs";
import aiService from "./ai.service";
import {
  createServiceError,
  TcreateServiceSuccess,
} from "../../../utils/service.error";

interface ICreateNote {
  noteTitle: string;
  noteDescription: string;
  noteCategory: string;
  noteTags: string[];
  isPrivate: boolean;
  fileUrl: string;
  filePath: string;
}
class NotesService {
  private async getNotesByUserId(
    userId: string,
    limit: number,
    offset: number,
    orderBy: string,
    sortBy: string
  ) {
    let orderFilter: any = {};
    switch (orderBy) {
      case "atoz":
        orderFilter.noteTitle = "asc";
        break;
      case "ztoa":
        orderFilter.noteTitle = "desc";
        break;
      case "createdAt":
        orderFilter.createdAt = "asc";
        break;
      case "updatedAt":
        orderFilter.updatedAt = "desc";
        break;
      default:
        orderFilter.createdAt = "desc";
    }

    if (sortBy === "desc" && orderBy === "createdAt") {
      orderFilter.createdAt = "desc";
    }
    if (sortBy === "asc" && orderBy === "createdAt") {
      orderFilter.createdAt = "asc";
    }
    if (sortBy === "desc" && orderBy === "updatedAt") {
      orderFilter.updatedAt = "desc";
    }
    const notes = await prisma.notes.findMany({
      where: {
        user: {
          id: userId,
        },
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: orderFilter,
    });
    const count = await prisma.notes.count({
      where: {
        user: {
          id: userId,
        },
      },
    });
    return {
      notes,
      _count: {
        notes: count,
      },
    };
  }
  private async getStarredNotesByUserId(
    userId: string,
    limit: number,
    offset: number,
    orderBy: string,
    sortBy: string
  ) {
    let orderFilter: any = {};
    switch (orderBy) {
      case "atoz":
        orderFilter.noteTitle = "asc";
        break;
      case "ztoa":
        orderFilter.noteTitle = "desc";
        break;
      case "createdAt":
        orderFilter.createdAt = "asc";
        break;
      case "updatedAt":
        orderFilter.updatedAt = "desc";
        break;
      default:
        orderFilter.createdAt = "desc";
    }
    if (sortBy === "asc" && orderBy === "createdAt") {
      orderFilter.createdAt = "asc";
    }
    if (sortBy === "desc" && orderBy === "createdAt") {
      orderFilter.createdAt = "desc";
    }
    if (sortBy === "desc" && orderBy === "updatedAt") {
      orderFilter.updatedAt = "desc";
    }

    const notes = await prisma.notes.findMany({
      where: {
        user: {
          id: userId,
        },
        isStared: true,
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: orderFilter,
    });
    const count = await prisma.notes.count({
      where: {
        user: {
          id: userId,
        },
        isStared: true,
      },
    });
    return {
      notes,
      _count: {
        notes: count,
      },
    };
  }
  private async getNotesByCategory(
    userId: string,
    limit: number,
    offset: number,
    categoryName: string,
    orderBy: string,
    sortBy: string
  ) {
    let orderFilter: any = {};
    switch (orderBy) {
      case "atoz":
        orderFilter.noteTitle = "asc";
        break;
      case "ztoa":
        orderFilter.noteTitle = "desc";
        break;
      case "createdAt":
        orderFilter.createdAt = "asc";
        break;
      case "updatedAt":
        orderFilter.updatedAt = "desc";
        break;
      default:
        orderFilter.createdAt = "desc";
    }

    if (!categoryName) {
      return {
        notes: [],
        _count: {
          notes: 0,
        },
      };
    }
    if (categoryName === "all") {
      return this.getNotesByUserId(userId, limit, offset, orderBy, sortBy);
    }

    const notes = await prisma.notes.findMany({
      where: {
        user: {
          id: userId,
        },
        category: {
          name: categoryName,
        },
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: orderFilter,
    });
    const count = await prisma.notes.count({
      where: {
        user: {
          id: userId,
        },
        category: {
          name: categoryName,
        },
      },
    });
    return {
      notes,
      _count: {
        notes: count,
      },
    };
  }
  public async checkIsCategoryExists(category: string, userId: string) {
    if (category === "all") return true;
    if (!category) return false;

    try {
      const res = await prisma.category.findUnique({
        where: {
          name_userId: {
            name: category,
            userId,
          },
        },
      });
      if (res) return true;
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async countNotesByUserId(userId: string) {
    try {
      const count = await prisma.notes.count({
        where: {
          user: {
            id: userId,
          },
        },
      });
      return count;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  public async uploadPdf(file: Express.Multer.File) {
    // Upload pdf logic
    if (!file) return false;
    try {
      const result = await uploadOnCloudinary(
        file.path,
        CLOUDINARY_FOLDER.pdfs
      );
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  public async unlinkPdf(fileUrl: string) {
    // Unlink pdf logic
    if (!fileUrl) return false;
    fs.unlinkSync(fileUrl);
  }
  public async createNote(
    userId: string,
    {
      noteTitle,
      noteDescription,
      noteCategory = "General",
      noteTags,
      isPrivate,
      fileUrl,
      filePath,
    }: ICreateNote
  ) {
    try {
      let text;
      if (filePath) {
        text = await aiService.extractPdfText(filePath);
      } else {
        text = "";
      }
      const result = await prisma.notes.create({
        data: {
          noteTitle,
          noteDescription,
          tags: {
            set: noteTags,
          },
          extractedText: text as string,
          noteContent: "",
          category: {
            connectOrCreate: {
              where: {
                id: noteCategory,
              },
              create: {
                name: "general",
                userId,
              },
            },
          },
          isPrivate: isPrivate || false,
          files: (fileUrl && [fileUrl]) || [],
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  public async getNotes(
    userId: string,
    limit: number,
    offset: number,
    category?: string,
    filterBy: string = "all",
    orderBy: string = "createdAt",
    sortBy: string = "desc"
  ): Promise<any> {
    try {
      if (category) {
        return this.getNotesByCategory(
          userId,
          limit,
          offset,
          category,
          orderBy,
          sortBy
        );
      }
      if (filterBy === "starred") {
        return this.getStarredNotesByUserId(
          userId,
          limit,
          offset,
          orderBy,
          sortBy
        );
      }

      return this.getNotesByUserId(userId, limit, offset, orderBy, sortBy);
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  public async getNoteByNoteId(noteId: string) {
    try {
      const note = await prisma.notes.findUnique({
        where: {
          id: noteId,
        },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          chat: {
            include: {
              messages: true,
            },
          },
        },
      });
      return note;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  public async noteSearch(query: string, userId: string) {
    try {
      console.log(query);
      const notes = await prisma.notes.findMany({
        where: {
          AND: [
            {
              noteTitle: {
                contains: query,
              },
            },
            {
              user: {
                id: userId,
              },
            },
          ],
        },
      });
      return notes;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  public async getNoteCategories(userId: string) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          User: {
            id: userId,
          },
        },
        include: {
          _count: true,
        },
      });
      return categories;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  public async createCategory(
    userId: string,
    name: string
  ): Promise<any | TcreateServiceSuccess> {
    if (!name) return createServiceError("Category name is required", 400);
    if (name.length < 3)
      return createServiceError("Category name must be at least 3 characters");
    if (userId === "") return createServiceError("User id is required", 400);

    try {
      const category = await prisma.category.create({
        data: {
          name: name.toLowerCase(),
          User: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          _count: true,
        },
      });
      if (!category) return createServiceError("Category already exist", 400);
      return category;
    } catch (error) {
      return createServiceError("Error creating category");
    }
  }
  public async toggleStarredNote(noteId: string, userId: string): Promise<any> {
    try {
      const note = await prisma.notes.findUnique({
        where: {
          id: noteId,
        },
      });
      if (!note) return createServiceError("Note not found", 404);
      const result = await prisma.notes.update({
        where: {
          id: noteId,
        },
        data: {
          isStared: !note.isStared,
        },
      });
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return createServiceError("Error toggling starred note");
    }
  }
  public async deleteNote(noteId: string, userId: string): Promise<any> {
    try {
      const note = await prisma.notes.findUnique({
        where: {
          id: noteId,
        },
      });
      if (!note) return createServiceError("Note not found", 404);
      const result = await prisma.notes.delete({
        where: {
          id: noteId,
        },
      });
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return createServiceError("Error deleting note");
    }
  }
}

export default new NotesService();
