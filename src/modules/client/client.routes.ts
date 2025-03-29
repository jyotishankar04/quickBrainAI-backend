import { Router } from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import noteRoutes from "./routes/notes.routes";
import aiRoutes from "./routes/ai.routes";
import statsRoutes from "./routes/stats.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notes", noteRoutes);
router.use("/qbai", aiRoutes);
router.use("/stats", statsRoutes);
router.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default router;
