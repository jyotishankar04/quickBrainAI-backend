import { Router } from "express";
import AiController from "../controllers/ai.controller";
import authMiddleware from "../middlewares/auth.middleware";
const router = Router();

router.use(authMiddleware);
router.get("/pdf/summary", AiController.getPdfSummary);
router.get("/pdf/answer", AiController.getAnswerFromPdf);
router.get("/pdf/chat/:noteId", AiController.getChatFromPdf);

export default router;
