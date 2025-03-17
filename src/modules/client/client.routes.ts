import { Router } from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import noteRoutes from "./routes/notes.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notes", noteRoutes);

export default router;
