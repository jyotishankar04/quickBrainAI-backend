import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import NotesController from "../controllers/notes.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", NotesController.createNote);

export default router;
