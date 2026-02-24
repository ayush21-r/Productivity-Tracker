import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import workSessionRoutes from "./routes/workSession.routes.js";
import masterRoutes from "./routes/master.routes.js";
import shiftRoutes from "./routes/shift.routes.js";
import { notFoundHandler } from "./middlewares/notFound.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", workSessionRoutes);
app.use("/api", masterRoutes);
app.use("/api", shiftRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
