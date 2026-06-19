import { body, validationResult } from "express-validator";

// Inspects the result of the rules below. If any failed, respond 400
// immediately so the request never reaches the controller.
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Rules for POST /api/auth/register: every field the schema requires must
// be present and well-formed before we ever hash a password or hit the DB.
const validateRegister = [
  body("name").isString().trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isString().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidation,
];

// Rules for POST /api/auth/login: just shape-check the input. We deliberately
// don't say *why* an email/password is invalid beyond "required" — the
// controller's "Invalid credentials" message is what actually protects
// against leaking which emails exist in the system.
const validateLogin = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("Password is required"),
  handleValidation,
];

export { validateRegister, validateLogin };
