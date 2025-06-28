/**
 * Build response object
 * @param {number} status
 * @param {string} message
 * @param {Object} data
 * @returns {Object}
 */
const buildResponse = (status, message, data = {}) => ({
  status,
  message,
  data,
});

module.exports = buildResponse;
