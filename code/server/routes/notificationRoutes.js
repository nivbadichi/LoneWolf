import express from "express";
import { getUserNotifications, markAsRead } from "../controllers/notificationController.js";
import { validateNotificationId } from "../validators/notificationValidator.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Both endpoints are protected — notifications are always scoped to "the
// currently logged-in user", so there is no anonymous use case here.
router.get("/", protect, getUserNotifications);
router.patch("/:id/read", protect, validateNotificationId, markAsRead);

export default router;
