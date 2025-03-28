import { Router } from "express";
import AiController from "../controllers/ai.controller";
import authMiddleware from "../middlewares/auth.middleware";
const router = Router();

router.use(authMiddleware);
router.get("/pdf/summary/:noteId", AiController.getPdfSummary);
router.post("/pdf/answer", AiController.getAnswerFromPdf);
router.post("/pdf/chat/:noteId", AiController.getChatFromPdf);
export default router;
