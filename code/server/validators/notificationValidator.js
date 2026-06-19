import { param, validationResult } from "express-validator";

// Inspects the result of the rule below. If it failed, respond 400
// immediately so the request never reaches the controller.
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Rule: :id in the URL must be a valid Mongo ObjectId, otherwise
// Notification.findById() in the model would throw a CastError instead of a clean 404.
const validateNotificationId = [
  param("id").isMongoId().withMessage("Notification id must be a valid id"),
  handleValidation,
];

export { validateNotificationId };
