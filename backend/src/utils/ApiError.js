export default class ApiError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}