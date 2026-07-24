export const sendSuccess = (response, { statusCode = 200, message, data = null }) =>
  response.status(statusCode).json({
    success: true,
    message,
    data,
  });