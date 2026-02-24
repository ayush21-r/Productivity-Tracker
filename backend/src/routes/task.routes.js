import { Router } from "express";

import { getMyTasksController } from "../controllers/task.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/tasks/my", verifyToken, getMyTasksController);

export default router;
