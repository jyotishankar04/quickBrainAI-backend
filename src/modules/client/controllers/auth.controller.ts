import { Request, Response, NextFunction } from "express";

class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "User registered successfully!",
    });
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "User logged in successfully!",
    });
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "User logged out successfully!",
    });
  }

  public async session(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "User session retrieved successfully!",
    });
  }
}

export default new AuthController();
