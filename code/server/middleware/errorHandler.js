const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose validation error: a required/min/max/enum rule on the schema failed.
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((fieldError) => fieldError.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Mongoose cast error: a route param (e.g. :id) wasn't a valid ObjectId.
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // MongoDB duplicate-key error: a unique index (e.g. email, or one feedback per user/event) was violated.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already in use` });
  }

  // Anything else is unexpected — don't leak internal details to the client.
  res.status(500).json({ message: "Internal server error" });
};

export default errorHandler;
