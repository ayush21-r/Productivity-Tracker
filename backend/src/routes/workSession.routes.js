import { Router } from "express";

import {
  completeSession,
  getActive,
  getHistory,
  startSession,
} from "../controllers/workSession.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/work-sessions/start", verifyToken, startSession);
router.post("/work-sessions/complete", verifyToken, completeSession);
router.get("/work-sessions/active", verifyToken, getActive);
router.get("/work-sessions/history", verifyToken, getHistory);

export default router;
