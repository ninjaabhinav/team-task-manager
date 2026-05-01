import cors from "cors";
import crypto from 'crypto';
import { webcrypto } from 'crypto';
globalThis.crypto = webcrypto;
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

// Serve React frontend in production
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// updated 