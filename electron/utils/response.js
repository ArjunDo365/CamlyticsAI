function successResponse(data = null, message = "Success") {
  return {
    success: true,
    message,
    data,
  };
}

function errorResponse(error, message = "Something went wrong") {
  return {
    success: false,
    message,
    error: typeof error === "string" ? error : error.message || error,
  };
}

module.exports = {
  successResponse,
  errorResponse,
};
