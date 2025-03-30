import { Router } from "express";
import UserController from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { imageUpload } from "../../../middlewares/multer.middleware";

const router = Router();
router.use(authMiddleware);
router.get("/skills", UserController.getSkills);
router.put("/skills", UserController.updateUserSkills);

router.get("/me", UserController.getMyProfile);
router.get("/:id", UserController.getUserById);
router.put("/", imageUpload.single("image"), UserController.updateUser);

export default router;
