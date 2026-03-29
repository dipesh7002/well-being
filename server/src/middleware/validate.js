import { validationResult } from "express-validator";

export function handleValidation(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      message: "Please review the highlighted fields.",
      errors: result.array().map((item) => ({
        field: item.path,
        message: item.msg
      }))
    });
  }

  next();
}

