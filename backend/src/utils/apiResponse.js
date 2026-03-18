export const successResponse = (
  res,
  data = null,
  message = "Success",
  statusCode = 200
) =>
  res.status(statusCode).json({
    success: true,
    message,
    ...(data !== null && data !== undefined ? { data } : {}),
  });

export const errorResponse = (
  res,
  message = "Request failed",
  statusCode = 500,
  errors = null
) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== null && errors !== undefined ? { errors } : {}),
  });