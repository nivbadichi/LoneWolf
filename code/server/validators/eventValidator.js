import { param, validationResult } from "express-validator";

// Rule: :id in the URL must be a valid Mongo ObjectId, otherwise
// Event.findById() in the model would throw a CastError instead of a clean 404.
const validateEventId = [
  param("id").isMongoId().withMessage("Event id must be a valid id"),

  // Inspects the result of the rule above. If it failed, respond 400
  // immediately so the request never reaches the controller.
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export { validateEventId };
