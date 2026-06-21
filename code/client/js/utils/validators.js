// Each function below answers one yes/no question about a single value -
// e.g. "is this non-empty?", "is this a valid email?". None of them touch
// the DOM or know about forms; a page wires them to its own inputs and
// decides how to show the result (via toast/inline text, never alert()).
//
// This mirrors the same rules the server enforces in
// code/server/validators/*.js (e.g. password min length 6, rating 1-5) -
// the point isn't to replace server validation (the server is still the
// final authority) but to give the user instant feedback before a request
// ever goes out, instead of waiting on a round trip just to learn a field
// was empty.

function isRequired(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value) {
  // Deliberately simple: just "looks like an email" (something@something.something).
  // Real validation (does the address exist) only the server-side
  // existingUser/login check can answer.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function hasMinLength(value, min) {
  return typeof value === "string" && value.trim().length >= min;
}

function hasMaxLength(value, max) {
  return typeof value === "string" && value.trim().length <= max;
}

function isIntInRange(value, min, max) {
  const num = Number(value);
  return Number.isInteger(num) && num >= min && num <= max;
}

// Runs a value through an ordered list of { test, message } rules and
// returns the message for the first one that fails, or null if every rule
// passes. Stopping at the first failure (rather than collecting all of
// them) keeps the UI showing one clear instruction at a time, the same way
// a person reads a form top to bottom and fixes one thing before the next.
//
// Example:
//   const error = getFirstError(passwordInput.value, [
//     { test: (v) => isRequired(v), message: "Password is required" },
//     { test: (v) => hasMinLength(v, 6), message: "Password must be at least 6 characters" },
//   ]);
//   if (error) showToast(error, "error");
function getFirstError(value, rules) {
  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message;
    }
  }
  return null;
}

export { isRequired, isValidEmail, hasMinLength, hasMaxLength, isIntInRange, getFirstError };
