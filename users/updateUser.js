'use strict';

const AWS = require('aws-sdk');
const Utils = require("../utils/utils");
const Cognito = new AWS.CognitoIdentityServiceProvider();
const _ = require('lodash/lang');

function requestBodyContainsPassword( requestBody ) {
  return !requestBodyNotContainsPassword(requestBody);
}

function requestBodyContainsGroups( requestBody ) {
  return !requestBodyContainsGroups(requestBody);
}

function requestBodyNotContainsPassword( requestBody ) {
  return _.isNil(requestBody.password);
}

function requestBodyNotContainsGroups( requestBody ) {
  return _.isNil(requestBody.groups);
}

function requestBodyNotContainsNeededData( requestBody ) {
  return requestBodyNotContainsPassword(requestBody) && requestBodyNotContainsGroups(requestBody);
}

function requestBodyDataIsNotValid( requestBody ) {
  return requestBody.groups.length === 0;
}

function checkEventInputData( event, resolve ) {
  const requestBody = JSON.parse(event.body);

  if ( requestBodyNotContainsNeededData(requestBody) ) {
    resolve(Utils.BadRequest());
  }
  if ( requestBodyDataIsNotValid(requestBody) ) {
    resolve(Utils.BadRequest());
  }
}

function getUserInfo( accessToken ) {
  return new Promise(( resolve, reject ) => {
    try {
      Cognito.getUser({ AccessToken: accessToken }).promise()
        .then(data => resolve(data))
        .catch(error => {
          console.log(error);
          reject(error);
        });
    } catch ( exception ) {
      throw new Error(`[getUserInfo] ${ exception.message }`);
    }
  });
}

module.exports.handler = async event => {
  return new Promise(async ( resolve, reject ) => {

    console.log(event);
    let callerUser = await getUserInfo(event.headers.CognitoAccessToken);
    console.log(callerUser);

    if ( Utils.callerHasNotAdminAccess(event) ) {
      resolve(Utils.Unauthorized());
    }

    checkEventInputData(event, resolve);

    const requestBody = JSON.parse(event.body);
    //
    // if ( requestBodyContainsPassword(requestBody) ) {
    //   let params = {
    //     Password: requestBody.password, /* required */
    //     UserPoolId: 'eu-west-2_TithjXJyJ', /* required */
    //     Username: 'STRING_VALUE', /* required */
    //     Permanent: true
    //   };
    //   Cognito.adminSetUserPassword();
    // }
    //
    // if ( requestBodyContainsGroups(requestBody) ) {
    //
    // }
  });
};
