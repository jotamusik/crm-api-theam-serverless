'use strict';

module.exports = {
  Response,
  callerHasNotAdminAccess,
  callerHasAdminAccess,
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

function callerHasAdminAccess( event ) {
  const groups = event.requestContext.authorizer.claims['cognito:groups'].split(',');
  return groups.includes('admins');
}

function callerHasNotAdminAccess( event ) {
  return !callerHasAdminAccess(event);
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
