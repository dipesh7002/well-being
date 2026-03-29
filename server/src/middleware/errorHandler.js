export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found." });
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (res.headersSent) {
    return next(error);
  }

  return res.status(statusCode).json({
    message: error.message || "Something went wrong.",
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {})
  });
}

