'use strict';

const Response = require("../lib/Response");
const Auth = require("../lib/Auth");
const Cognito = require("../lib/Cognito");
const _ = require('lodash/lang');

function requestBodyContainsPassword( requestBody ) {
  return !_.isNil(requestBody.password);
}

function requestBodyContainsGroups( requestBody ) {

  if ( _.isNil(requestBody.groups) ) {
    return false;
  } else {
    return groupsIsNotEmpty(requestBody);
  }
}

function groupsIsNotEmpty( requestBody ) {
  return requestBody.groups.length !== 0;
}

function requestBodyIsEmpty( requestBody ) {
  return !requestBodyContainsGroups(requestBody) && !requestBodyContainsPassword(requestBody);
}

function requestNotContainsUserIdPathParameter( event ) {
  return _.isNil(event.pathParameters.id);
}

function callerUserCanChangeThePassword( callerUser, event ) {
  return callerUser.Username === event.pathParameters.id || Auth.callerHasAdminAccess(event);
}


module.exports.handler = async event => {
  return new Promise(async ( resolve, reject ) => {

    const requestBody = JSON.parse(event.body);

    if ( requestNotContainsUserIdPathParameter(event) || requestBodyIsEmpty(requestBody) ) {
      resolve(Response.BadRequest());
    }

    const requestedUserUsername = event.pathParameters.id;
    const callerUsername = Auth.getCaller(event);

    try {

      let callerUser = await Cognito.getUserByUsername(callerUsername);

      if ( callerUserCanChangeThePassword(callerUser, event) && requestBodyContainsPassword(requestBody) ) {
        await Cognito.changeUserPassword(requestedUserUsername, requestBody.password);
      }

      if ( Auth.callerHasAdminAccess(event) && requestBodyContainsGroups(requestBody) ) {
        await Cognito.changeUsersGroups(requestedUserUsername, requestBody.groups);
      }

      resolve(Response.Ok());
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
