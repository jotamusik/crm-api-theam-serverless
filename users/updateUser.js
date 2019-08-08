'use strict';

const AWS = require('aws-sdk');
const Utils = require("../utils/utils");
const Cognito = new AWS.CognitoIdentityServiceProvider();
const _ = require('lodash/lang');

function requestBodyContainsPassword( requestBody ) {
  return !_.isNil(requestBody.password);
}

function requestBodyContainsGroups( requestBody ) {
  return !_.isNil(requestBody.groups);
}

function groupsIsNotEmpty( requestBody ) {
  return requestBody.groups.length !== 0;
}

function userHasNotUpdateAccess( event, callerUser ) {
  const requestedUserId = event.pathParameters.id;
  return Utils.callerHasNotAdminAccess(event) && ( callerUser.Username !== requestedUserId );
}

function requestNotContainsCognitoAccessToken( event ) {
  return _.isNil(event.headers.CognitoAccessToken);
}

function requestNotContainsUserIdPathParameters( event ) {
  return _.isNil(event.pathParameters.id);
}

function requestNotHasNecessaryData( event ) {
  return requestNotContainsCognitoAccessToken(event) || requestNotContainsUserIdPathParameters(event);
}

function getUser( AccessToken ) {
  return new Promise(( resolve, reject ) => {
    try {
      Cognito.getUser({ AccessToken }).promise()
        .then(data => resolve(data))
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[getUserInfo] ${exception.message}`);
    }
  });
}

function getUserGroups(username) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        UserPoolId: 'eu-west-2_TithjXJyJ',
        Username: username
      };
      Cognito.adminListGroupsForUser(params).promise()
        .then(data => resolve(data.Groups))
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[getUserGroups] ${exception.message}`);
    }
  });
}

module.exports.handler = async event => {
  return new Promise(async ( resolve, reject ) => {

    if ( requestNotHasNecessaryData(event) ) {
      resolve(Utils.BadRequest());
    }

    try {
      let requestedUser = await getUser(event.headers.CognitoAccessToken);
      requestedUser.Groups = await getUserGroups(event.pathParameters.id);

      resolve(Utils.Ok(requestedUser));
    }
    catch ( exception ) {
      reject(exception)
    }


  });
};
