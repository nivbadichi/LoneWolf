const express = require('express');
const router = express.Router();

const {
  getEventById,
  getAllEvents,
  getNearbyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  exportToCalendar,
} = require('../controllers/eventController');
const { validateEventId } = require('../validators/eventValidator');
const { requireAuth } = require('../middleware/authMiddleware');

// Order matters: validate the id shape before the controller ever runs.
// (No requireAuth here — per func_implement.md, GET /api/events/:id is public.)
router.get('/', getAllEvents);
router.get('/nearby', getNearbyEvents); // New route for nearby events
router.get('/:id', validateEventId, getEventById);
router.get('/:id/calendar', validateEventId, exportToCalendar);
router.post('/', requireAuth, createEvent);
router.patch('/:id', requireAuth, validateEventId, updateEvent);
router.delete('/:id', requireAuth, validateEventId, deleteEvent);
module.exports = router;

