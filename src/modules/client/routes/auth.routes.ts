import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/register", AuthController.register);
router.post("/register/verify", AuthController.registerVerification);
router.post("/register/completion", AuthController.registerCompletion);

export default router;
