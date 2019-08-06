'use strict';

module.exports = {
  Response,
  callerHasNotAdminAccess,
  Unauthorized,
  BadRequest,
  InternalServerError,
  Ok,
  ResourceNotFound
};

function Response( statusCode, body = {}, headers = {} ) {
  return {
    statusCode: statusCode,
    headers: headers,
    body: JSON.stringify(body)
  }
}

function callerHasNotAdminAccess( event ) {
  const groups = event.requestContext.authorizer.claims['cognito:groups'].split(',');
  console.log(groups);
  return !groups.includes('admins');
}

const Unauthorized = () => Response(401, { message: 'Unauthorized' });
const BadRequest = () => Response(400, { message: 'Bad request' });
const ResourceNotFound = () => Response(404, { message: 'Resource not found' });
const InternalServerError = () => Response(500, { message: 'Internal server error' });
const Ok = (body = {}, headers = {}) => Response(200, body, headers);
