import express from "express";
import { getUserProfile, updateMyProfile, getAllUsers, suspendUser } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validateUpdateProfile } from "../validators/userValidator.js";

const router = express.Router();

router.get("/me", protect, getUserProfile);
router.patch("/me", protect, validateUpdateProfile, updateMyProfile);
router.get("/", protect, adminOnly, getAllUsers);
router.patch("/:id/suspend", protect, adminOnly, suspendUser);

export default router;
