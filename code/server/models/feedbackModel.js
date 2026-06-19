import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true },
);

// One feedback per user per event — a second POST for the same pair throws
// a duplicate-key error (code 11000) instead of creating a second row.
feedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Pure data-access: creates one feedback document for a (event, user) pair.
// Knows nothing about HTTP — duplicate-key handling belongs to the caller.
async function createFeedback({ eventId, userId, rating, comment }) {
  return Feedback.create({ eventId, userId, rating, comment });
}

// Pure data-access: returns every feedback document for a given event,
// newest first, with the author's name populated in place of a raw userId.
async function getFeedbackByEvent(eventId) {
  return Feedback.find({ eventId }).sort({ createdAt: -1 }).populate('userId', 'name');
}

export { Feedback, createFeedback, getFeedbackByEvent };
