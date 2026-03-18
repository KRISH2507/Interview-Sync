import { errorResponse, successResponse } from "./apiResponse.js";

export const sendSuccess = (res, statusCode, message, data = null, extras = {}) => {
  const payload =
    extras && Object.keys(extras).length > 0
      ? { ...(data || {}), ...extras }
      : data;

  return successResponse(res, payload, message, statusCode);
};

export const sendError = (res, statusCode, message, errors = null) =>
  errorResponse(res, message, statusCode, errors);

export { successResponse, errorResponse };