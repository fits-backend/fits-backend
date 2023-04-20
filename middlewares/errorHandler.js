import { DEBUG_MODE } from "../config/";
import { ValidationError } from "joi";
import CustomErrorHandler from "../services/CustomErrorHandler";

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  console.log("..........", DEBUG_MODE);
  let data;
  // if (DEBUG_MODE === true) {
  data = {
    message: err.message,
    statusCode: !err.statusCode ? statusCode : err.status,
    success: false,
    data: null,
    stack: err.stack,
  };
  // } else {
  //   data = {
  //     message: "Internal server error",
  //   };
  // }

  if (err instanceof ValidationError) {
    statusCode = 422; // use for validation error
    data = {
      message: err.message,
      statusCode,
      success: false,
    };
  }

  if (err instanceof CustomErrorHandler) {
    statusCode = err.status;
    data = {
      message: err.message,
      statusCode,
      success: false,
    };
  }

  return res.status(statusCode).json(data);
};

export default errorHandler;
