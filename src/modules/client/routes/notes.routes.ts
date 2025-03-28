import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import NotesController from "../controllers/notes.controller";
import { pdfUpload } from "../../../middlewares/multer.middleware";

const router = Router();

router.use(authMiddleware);

//AI Routes

router.get("/search", NotesController.searchNotes);
router.get("/categories", NotesController.getCategories);
router.post("/categories", NotesController.createCategory);

router.put("/starred/:id", NotesController.toggleStarredNote);
router.delete("/:id", NotesController.deleteNote);

router.post("/", pdfUpload.single("pdfFile"), NotesController.createNote);
router.get("/", NotesController.getNotes);
router.get("/:id", NotesController.getNoteById);
router.put("/:id", NotesController.updateNote);
router.get("/chat/:id", NotesController.getChat);
router.put("/save/:id", NotesController.saveNote);
export default router;
