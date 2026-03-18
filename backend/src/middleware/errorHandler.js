import { errorResponse } from "../utils/apiResponse.js";

const mapKnownError = (err) => {
  if (!err) {
    return { statusCode: 500, message: "Internal server error", errors: null };
  }

  if (String(err.code || "") === "EBADCSRFTOKEN") {
    return {
      statusCode: 403,
      message: "Invalid CSRF token",
      errors: { code: "EBADCSRFTOKEN" },
    };
  }

  if (String(err.name || "") === "ValidationError") {
    return {
      statusCode: 400,
      message: "Validation failed",
      errors: Object.values(err.errors || {}).map((item) => item.message),
    };
  }

  if (String(err.name || "") === "CastError") {
    return {
      statusCode: 400,
      message: "Invalid request data",
      errors: { path: err.path, value: err.value },
    };
  }

  if (String(err.name || "") === "JsonWebTokenError") {
    return {
      statusCode: 401,
      message: "Invalid authentication token",
      errors: null,
    };
  }

  if (String(err.name || "") === "TokenExpiredError") {
    return {
      statusCode: 401,
      message: "Authentication token expired",
      errors: null,
    };
  }

  const statusCode = Number(err.statusCode || err.status || 500);
  const message =
    statusCode >= 500
      ? "Internal server error"
      : String(err.message || "Request failed");

  return {
    statusCode,
    message,
    errors: err.errors || null,
  };
};

export const notFoundHandler = (req, res, next) => {
  if (res.headersSent) {
    return next();
  }
  return errorResponse(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    404
  );
};

export const errorHandler = (err, req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  const mapped = mapKnownError(err);
  return errorResponse(res, mapped.message, mapped.statusCode, mapped.errors);
};