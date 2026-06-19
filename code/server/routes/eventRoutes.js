import express from 'express';
const router = express.Router();

import { getEventById } from '../controllers/eventController.js';
import { validateEventId } from '../validators/eventValidator.js';

// Order matters: validate the id shape before the controller ever runs.
// (No requireAuth here — per func_implement.md, GET /api/events/:id is public.)
router.get('/:id', validateEventId, getEventById);

export default router;
