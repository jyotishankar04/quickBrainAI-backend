import { NextFunction, Request, Response } from "express";

export class UserController {
  public async getUserById(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "User retrieved successfully!",
    });
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
