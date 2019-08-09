'use strict';

const AWS = require('aws-sdk');
const Utils = require("../utils/utils");
const Cognito = new AWS.CognitoIdentityServiceProvider();
const _ = require('lodash/lang');


function requestNotContainsUserIdPathParameter( event ) {
  return _.isNil(event.pathParameters.id);
}

function getUserByUsername( username ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        UserPoolId: 'eu-west-2_TithjXJyJ',
        Username: username
      };
      Cognito.adminGetUser(params).promise()
        .then(data => resolve(data))
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[getUserByUsername] ${exception.message}`);
    }
  });
}

module.exports.handler = async event => {
  return new Promise(async ( resolve, reject ) => {

    if ( Utils.callerHasNotAdminAccess(event) ) {
      resolve(Utils.Unauthorized());
    }

    if ( requestNotContainsUserIdPathParameter(event) ) {
      resolve(Utils.BadRequest());
    }

    const requestedUserUsername = event.pathParameters.id;

    try {
      const user = await getUserByUsername(requestedUserUsername);
      resolve(Utils.Ok(user));
    }
    catch ( exception ) {
      console.log(`[main] ${exception.message}`);
      reject(exception)
    }
  });
};
