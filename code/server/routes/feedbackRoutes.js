import express from 'express';
const router = express.Router();

import { submitFeedback, getEventFeedback } from '../controllers/feedbackController.js';
import { validateFeedbackSubmission, validateEventId } from '../validators/feedbackValidator.js';
import { requireAuth } from '../middleware/authMiddleware.js';

// Submitting feedback requires a logged-in user (we need req.user.id to
// attribute the rating); reading feedback is public.
router.post('/:id/feedback', requireAuth, validateFeedbackSubmission, submitFeedback);
router.get('/:id/feedback', validateEventId, getEventFeedback);

export default router;
