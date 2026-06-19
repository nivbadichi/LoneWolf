import express from "express";
import {
  getEventById,
  getAllEvents,
  getNearbyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  exportToCalendar,
} from "../controllers/eventController.js";
import { validateEventId } from "../validators/eventValidator.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Order matters: static paths (/, /nearby) must come before the dynamic
// /:id route, otherwise Express would match "nearby" as an :id value.
router.get("/", getAllEvents);
router.get("/nearby", getNearbyEvents);
router.get("/:id", validateEventId, getEventById);
router.get("/:id/calendar", validateEventId, exportToCalendar);
router.post("/", protect, createEvent);
router.patch("/:id", protect, validateEventId, updateEvent);
router.delete("/:id", protect, validateEventId, deleteEvent);

export default router;
