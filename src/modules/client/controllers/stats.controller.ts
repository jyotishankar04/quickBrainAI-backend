import { NextFunction, Request, Response } from "express";
import { ICustomRequest } from "../../../types/client.types";
import StatsService from "../services/stats.service";
import createHttpError from "http-errors";

class StatsController {
  public async getDashboardStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const _req = req as ICustomRequest;
    const userId = _req.user.id;

    const stats = await StatsService.getDashboardStats(userId);

    if (stats.success === false) {
      return next(createHttpError(stats.status, stats.message));
    }

    res.json({
      success: true,
      message: "Stats retrieved successfully!",
      data: stats.data,
    });
  }
}

export default new StatsController();
