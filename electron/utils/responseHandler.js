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
    error: error?.message || error || "Unknown error",
  };
}

module.exports = {
  successResponse,
  errorResponse,
};
