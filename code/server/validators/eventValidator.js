import { body, param, validationResult } from "express-validator";

// Inspects the result of the rules above. If any failed, respond 400
// immediately so the request never reaches the controller.
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Rule: :id in the URL must be a valid Mongo ObjectId, otherwise
// Event.findById() in the model would throw a CastError instead of a clean 404.
const validateEventId = [param("id").isMongoId().withMessage("Event id must be a valid id"), handleValidation];

// Rules for POST /api/events: every field is required since the schema
// itself requires them — better to fail with a clean 400 here than let
// Mongoose throw a ValidationError caught generically by next(error).
const validateCreateEvent = [
  body("title").isString().trim().notEmpty().withMessage("Title is required"),
  body("category").isString().trim().notEmpty().withMessage("Category is required"),
  body("startTime").isISO8601().withMessage("startTime must be a valid date"),
  body("endTime")
    .isISO8601()
    .withMessage("endTime must be a valid date")
    .custom((endTime, { req }) => new Date(endTime) > new Date(req.body.startTime))
    .withMessage("endTime must be after startTime"),
  body("location.lat").isFloat({ min: -90, max: 90 }).withMessage("location.lat must be between -90 and 90"),
  body("location.lng").isFloat({ min: -180, max: 180 }).withMessage("location.lng must be between -180 and 180"),
  handleValidation,
];

// Rules for PATCH /api/events/:id: every field is optional (a partial
// update), but whatever is sent must still be well-formed.
const validateUpdateEvent = [
  param("id").isMongoId().withMessage("Event id must be a valid id"),
  body("title").optional().isString().trim().notEmpty().withMessage("Title cannot be empty"),
  body("category").optional().isString().trim().notEmpty().withMessage("Category cannot be empty"),
  body("startTime").optional().isISO8601().withMessage("startTime must be a valid date"),
  body("endTime").optional().isISO8601().withMessage("endTime must be a valid date"),
  body("location.lat").optional().isFloat({ min: -90, max: 90 }).withMessage("location.lat must be between -90 and 90"),
  body("location.lng").optional().isFloat({ min: -180, max: 180 }).withMessage("location.lng must be between -180 and 180"),
  // Cross-field check only makes sense once both ends of the range are known.
  body("endTime").custom((endTime, { req }) => {
    if (endTime && req.body.startTime && new Date(endTime) <= new Date(req.body.startTime)) {
      throw new Error("endTime must be after startTime");
    }
    return true;
  }),
  handleValidation,
];

export { validateEventId, validateCreateEvent, validateUpdateEvent };
