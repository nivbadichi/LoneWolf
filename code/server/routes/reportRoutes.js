import express from "express";
import { createReport, getAdminReports, resolveReport } from "../controllers/reportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/events/:id/report", protect, createReport);
router.get("/reports", protect, adminOnly, getAdminReports);
router.patch("/reports/:id/resolve", protect, adminOnly, resolveReport);

export default router;
