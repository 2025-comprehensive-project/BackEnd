// utils/errorCreator.js
// 에러 생성기, 에러 메시지와 상태 코드를 설정하는 함수입니다.
module.exports = (status, message, code = null) => {
    const err = new Error(message);
    err.status = status;
    err.code = code;
    return err;
  };
  