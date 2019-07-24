'use strict';

module.exports = {
  setupResponse
};

function setupResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { },
    body: JSON.stringify(body)
  }
}
