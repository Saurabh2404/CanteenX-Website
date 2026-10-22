import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import catalogRoutes from "./routes/catalogRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import { readOnly } from "./middleware/readOnly.js";
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3001",
    methods: ["GET", "HEAD", "OPTIONS"],
  }),
);
app.use("/api", readOnly);
app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", service: "canteenx-website-backend" }),
);
app.use("/api", catalogRoutes, reviewRoutes);
app.use((_req, res) => res.status(404).json({ error: "Not found." }));
app.use(errorHandler);
export default app;
