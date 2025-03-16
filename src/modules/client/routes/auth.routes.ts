import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/register/verify", AuthController.registerVerification);
router.post("/register/completion", AuthController.registerCompletion);
router.post("/login", AuthController.login);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/refresh", AuthController.refresh);
router.get("/session", authMiddleware, AuthController.getSession);
export default router;
