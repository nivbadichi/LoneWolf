import express from "express";
import { getUserProfile, getAllUsers, suspendUser } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getUserProfile);
router.get("/", protect, adminOnly, getAllUsers);
router.patch("/:id/suspend", protect, adminOnly, suspendUser);

export default router;
