import { Router } from "express";

import { getMe, login } from "../controllers/auth.controller.js";
import { validateLoginInput, verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/auth/login", validateLoginInput, login);
router.get("/me", verifyToken, getMe);

export default router;
