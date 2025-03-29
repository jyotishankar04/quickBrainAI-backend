import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import UserService from "../services/user.service";

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
  public async getAllUsers(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "Users retrieved successfully!",
    });
  }
  public async updateUserById(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "User updated successfully!",
    });
  }
  public async deleteUserById(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "User deleted successfully!",
    });
  }
}

export default new UserController();
