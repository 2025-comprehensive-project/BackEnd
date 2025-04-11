// utils/errorCreator.js
module.exports = (status, message, code = null) => {
    const err = new Error(message);
    err.status = status;
    err.code = code;
    return err;
  };
  