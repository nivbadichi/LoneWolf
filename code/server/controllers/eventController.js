import * as eventModel from '../models/eventModel.js';

// GET /api/events/:id
// Controller never touches the database directly — it delegates to the
// model and focuses only on translating between HTTP and business logic.
async function getEventById(req, res, next) {
  try {
    const event = await eventModel.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (err) {
    // Hand unexpected errors to the centralized error-handling middleware
    // instead of formatting an error response here.
    next(err);
  }
}

export { getEventById };
