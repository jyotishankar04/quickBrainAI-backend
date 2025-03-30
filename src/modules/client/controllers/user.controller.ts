import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import UserService from "../services/user.service";
import { ICustomRequest } from "../../../types/client.types";
import {
  getErrorMessage,
  updateUserValidator,
} from "../../../validator/validator";
import {
  deleteOnCloudinary,
  uploadOnCloudinary,
} from "../../../utils/cloudinary.utils";
import { CLOUDINARY_FOLDER } from "../../../config/constants";

class UserController {
  public async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const userId = req.params.id;
      if (!userId) return next(createHttpError(400, "User id is required"));
      const result = await UserService.getUserById(userId);
      if (!result.success) {
        return next(createHttpError(result.status, result.message));
      }
      return res.json({
        success: true,
        message: "User retrieved successfully",
        data: result.user,
      });
    } catch (error) {
      return next(createHttpError(500, "Error getting user"));
    }
  }
  public async getMyProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const _req = req as ICustomRequest;
      const userId = _req.user.id;
      if (!userId) return next(createHttpError(400, "User id is required"));
      const result = await UserService.getUserById(userId);
      if (!result.success) {
        return next(createHttpError(result.status, result.message));
      }
      return res.json({
        success: true,
        message: "User retrieved successfully",
        data: result.user,
      });
    } catch (error) {
      return next(createHttpError(500, "Error getting user"));
    }
  }
  public async getAllUsers(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "Users retrieved successfully!",
    });
  }
  public async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const _req = req as ICustomRequest;
      const userId = _req.user.id;
      const body = req.body;
      const validate = updateUserValidator.safeParse({
        ...body,
        dob: body.dob ? new Date(body.dob) : undefined,
      });

      if (!validate.success) {
        return next(createHttpError(400, getErrorMessage(validate.error)));
      }

      if (!userId) return next(createHttpError(400, "User id is required"));
      let upload: any = null;

      const existingUser = await UserService.checkUserExists(_req.user.email);
      if (_req.file) {
        const deleted = await deleteOnCloudinary(existingUser.user.avatarId);
        upload = await uploadOnCloudinary(
          _req.file.path,
          CLOUDINARY_FOLDER.images
        );

        if (!upload) {
          return next(createHttpError(400, "Error uploading image"));
        }
      }

      const result = await UserService.updateUser(userId, {
        ...body,
        image: {
          url: upload ? upload.result.secure_url : existingUser.user.avatarUrl,
          publicId: upload
            ? upload.result.public_id
            : existingUser.user.avatarId,
        },
      });

      if (!result.success) {
        return next(createHttpError(result.status, result.message));
      }

      res.json({
        success: true,
        message: "User updated successfully!",
        data: result.user,
      });
    } catch (error) {
      console.log(error);
      return next(createHttpError(500, "Error updating user"));
    }
  }
  public async deleteUserById(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "User deleted successfully!",
    });
  }
  public async getSkills(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const skills = await UserService.getSkills();
    if (!skills.success) {
      return next(createHttpError(skills.status, skills.message));
    }

    res.json({
      success: true,
      message: "Skills retrieved successfully!",
      data: skills.skills,
    });
  }
  public async updateUserSkills(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const skills = req.body.skills;
      const _req = req as ICustomRequest;
      const userId = _req.user.id;
      if (!userId) return next(createHttpError(400, "User id is required"));

      const result = await UserService.updateUserSkills(skills, userId);
      if (!result.success) {
        return next(createHttpError(result.status, result.message));
      }

      res.json({
        success: true,
        message: "User skills updated successfully!",
        data: result.user,
      });
    } catch (error) {
      console.log(error);
      return next(createHttpError(500, "Error updating user"));
    }
  }
}

export default new UserController();
