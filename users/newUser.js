'use strict';

const Response = require("../lib/Response");
const Auth = require("../lib/Auth");
const Cognito = require("../lib/Cognito");
const _ = require('lodash/lang');

function requestBodyNotContainsNeededData( requestBody ) {
  return _.isNil(requestBody.username) || _.isNil(requestBody.password);
}

function requestBodyNotContainsGroups( requestBody ) {

  if ( _.isNil(requestBody.groups) ) {
    return true;
  } else {
    return requestBody.groups.length === 0;
  }
}

function defineGroupsFromRequestBody( requestBody ) {
  let groups = [];

  if ( requestBodyNotContainsGroups(requestBody) ) {
    groups.push(Cognito.defaultUserGroup);
  } else {
    groups.push(...requestBody.groups);
  }
  return groups;
}


module.exports.handler = async event => {
  return new Promise(async ( resolve, reject ) => {
    if ( Auth.callerHasNotAdminAccess(event) ) {
      resolve(Response.Unauthorized());
    }

    const requestBody = JSON.parse(event.body);

    if ( requestBodyNotContainsNeededData(requestBody) ) {
      resolve(Response.BadRequest());
    }

    const username = requestBody.username,
      password = requestBody.password;

    try {

      let user = await Cognito.createUser({ username, password });

      let groups = defineGroupsFromRequestBody(requestBody);
      await Cognito.changeUsersGroups(username, groups);

      user.Groups = groups;
      resolve(Response.Ok(user));
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
