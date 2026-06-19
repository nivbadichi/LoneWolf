import { body, param, validationResult } from 'express-validator';

// Inspects the result of the rules above. If any failed, respond 400
// immediately so the request never reaches the controller.
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Rule: :id in the URL must be a valid Mongo ObjectId, otherwise
// Event.findById() in the model would throw a CastError instead of a clean 404.
const validateEventId = [param('id').isMongoId().withMessage('Event id must be a valid id'), handleValidation];

// Rules for submitting feedback: the event id must be valid, rating must be
// a whole number 1-5, and an optional comment is capped at 1000 characters.
const validateFeedbackSubmission = [
  param('id').isMongoId().withMessage('Event id must be a valid id'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must be at most 1000 characters'),
  handleValidation,
];

export { validateEventId, validateFeedbackSubmission };
