// class ApiError extends Error {
//   constructor(statusCode, message, data = {}) {
//     super(message);
//     this.statusCode = statusCode;
//      this.data = data;
//   }
// }

class ApiError extends Error {
  constructor(statusCode, message, data = {}) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = data; 
  }
}


module.exports = ApiError;