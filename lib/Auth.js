'use strict';

module.exports = {
  getCaller,
  callerHasAdminAccess,
  callerHasNotAdminAccess
};

function getCaller( event ) {
  return event.requestContext.authorizer.claims['cognito:username'];
}

function callerHasAdminAccess( event ) {
  const groups = event.requestContext.authorizer.claims['cognito:groups'].split(',');
  return groups.includes('admins');
}

function callerHasNotAdminAccess( event ) {
  return !callerHasAdminAccess(event);
}
