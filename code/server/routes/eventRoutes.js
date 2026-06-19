const express = require('express');
const router = express.Router();

const { getEventById } = require('../controllers/eventController');
const { validateEventId } = require('../validators/eventValidator');

// Order matters: validate the id shape before the controller ever runs.
// (No requireAuth here — per func_implement.md, GET /api/events/:id is public.)
router.get('/:id', validateEventId, getEventById);

module.exports = router;
