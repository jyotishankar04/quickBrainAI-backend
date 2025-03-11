import { Router } from "express";

const router = Router();

router.use("/users", (req, res) => {
  res.json({
    message: "Users retrieved successfully!",
  });
});

export default router;
