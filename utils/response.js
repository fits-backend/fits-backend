const {
  default: CustomErrorHandler,
} = require("../services/CustomErrorHandler");
const { HTTP_STATUS } = require("./constants");

const successResponse = (
  expressResponseObject,
  expressNextObject,
  data,
  httpStatusCode,
  successMessage = ""
) => {
  // console.log("data", data);
  // console.log("httpStatusCode", httpStatusCode);
  // console.log("successMessage", successMessage);
  if (!data && !httpStatusCode) {
    return expressNextObject(
      CustomErrorHandler.notFound(
        `Success response has either no data=${data} or httpStatusCode=${httpStatusCode}`,
        httpStatusCode
      )
    );
  }
  return expressResponseObject.status(httpStatusCode).send({
    data: data,
    statusCode: httpStatusCode ? httpStatusCode : HTTP_STATUS.OK,
    message: successMessage,
    success: true,
  });
};
// const successResponse = (data, httpStatusCode, successMessage = "") => {
//   console.log("data", data);
//   console.log("httpStatusCode", httpStatusCode);
//   console.log("successMessage", successMessage);
//   if (!data || !httpStatusCode) {
//     logger.error(
//       LOGGER_TAGS.FOOTPRINT,
//       `Success response has either no data=${data} or httpStatusCode=${httpStatusCode}`
//     );
//   }
//   return {
//     data: data,
//     status: httpStatusCode ? httpStatusCode : HTTP_STATUS.OK,
//     message: successMessage,
//     success: true,
//   };
// };

const errorResponse = (
  expressResponseObject,
  httpStatusCode,
  errorMessage,
  data = data | null
) => {
  if (!httpStatusCode || !errorMessage) {
    // logger.error(
    //   LOGGER_TAGS.FOOTPRINT,
    //   `Error response has either no errorMessage=${errorMessage} or httpStatusCode=${httpStatusCode}`
    // );
  }
  return expressResponseObject.status(httpStatusCode).send({
    statusCode: httpStatusCode
      ? httpStatusCode
      : HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: errorMessage
      ? errorMessage
      : "Internal server error. Please try again later.",
    data: data,
    success: false,
  });
};

const constructResponse = (expressResponseObject, responseData) => {
  if (responseData.success) {
    return expressResponseObject.status(responseData.status).send({
      data: responseData.data,
      message: responseData.message,
      success: true,
    });
  } else {
    if (responseData.data) {
      return expressResponseObject.status(responseData.status).send({
        data: responseData.data,
        message: responseData.message,
        success: false,
      });
    }
    return expressResponseObject.status(responseData.status).send({
      message: responseData.message,
      success: false,
    });
  }
};

module.exports = {
  successResponse,
  errorResponse,
  constructResponse,
};
