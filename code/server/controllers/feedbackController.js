import * as feedbackModel from '../models/feedbackModel.js';
import { getEventById } from '../models/eventModel.js';

// POST /api/events/:id/feedback  (Protected)
// Lets the authenticated user leave a rating/comment for one event.
// Delegates the "one feedback per user per event" rule to the database's
// unique index rather than checking it manually here.
async function submitFeedback(req, res, next) {
  try {
    const { id: eventId } = req.params;
    const { rating, comment } = req.body;

    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const feedback = await feedbackModel.createFeedback({
      eventId,
      userId: req.user.id,
      rating,
      comment,
    });

    res.status(201).json(feedback);
  } catch (err) {
    // 11000 = Mongo duplicate-key error, thrown by the unique index on
    // (eventId, userId) when this user already left feedback for this event.
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already submitted feedback for this event' });
    }
    // Anything else is unexpected — hand it to the centralized error handler.
    next(err);
  }
}

// GET /api/events/:id/feedback  (Public)
// Returns every feedback entry recorded for one event.
async function getEventFeedback(req, res, next) {
  try {
    const { id: eventId } = req.params;

    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const feedback = await feedbackModel.getFeedbackByEvent(eventId);
    res.status(200).json(feedback);
  } catch (err) {
    next(err);
  }
}

export { submitFeedback, getEventFeedback };
