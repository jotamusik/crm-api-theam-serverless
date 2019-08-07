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

function Unauthorized() {
  return Response(401, { message: 'Unauthorized' });
}

function BadRequest() {
  return Response(400, { message: 'Bad request' });
}

function ResourceNotFound() {
  return Response(404, { message: 'Resource not found' });
}

function InternalServerError() {
  return Response(500, { message: 'Internal server error' });
}

function Ok( body = {}, headers = {} ) {
  return Response(200, body, headers);
}
