'use strict';

module.exports = {
  setupResponse
};

function setupResponse( statusCode, body = {}, headers = {} ) {
  return {
    statusCode: statusCode,
    headers: headers,
    body: JSON.stringify(body)
  }
}
