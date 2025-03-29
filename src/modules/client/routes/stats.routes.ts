import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import StatsController from "../controllers/stats.controller";

const router = Router();
router.use(authMiddleware);
router.get("/", StatsController.getDashboardStats);

export default router;
