import express from "express";
import { getAuditLogs } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/audit", protect, adminOnly, getAuditLogs);

export default router;
