import { body, validationResult } from "express-validator";

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Rules for PATCH /api/users/me: every field is optional (a partial
// update), but whatever is sent must still be well-formed.
const validateUpdateProfile = [
  body("name").optional().isString().trim().notEmpty().withMessage("Name cannot be empty"),
  body("interests").optional().isArray().withMessage("Interests must be a list"),
  body("interests.*")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each interest must be a non-empty string"),
  handleValidation,
];

export { validateUpdateProfile };
