import { Router } from "express";

import { getActiveShift } from "../controllers/shift.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/shift/active", verifyToken, getActiveShift);

export default router;
