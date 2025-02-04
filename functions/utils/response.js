exports.successResponse = (res, data, message = "Success", status = 200) => {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  };
  
  exports.errorResponse = (res, message = "Error", status = 500) => {
    return res.status(status).json({
      success: false,
      message,
    });
  };
  