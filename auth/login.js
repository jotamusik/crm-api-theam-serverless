'use strict';

const AWS = require('aws-sdk');
const Utils = require("../utils/utils");
const Cognito = new AWS.CognitoIdentityServiceProvider();
const _ = require('lodash/lang');

function requestBodyNotContainsNeededData( requestBody ) {

  return _.isNil(requestBody.username) || _.isNil(requestBody.password);
}

function checkEventInputData( event, resolve ) {
  const requestBody = JSON.parse(event.body);

  if ( requestBodyNotContainsNeededData(requestBody) ) {
    resolve(Utils.setupResponse(400, { message: 'Bad Request' }));
  }
}


module.exports.handler = async event => {
  return new Promise(( resolve, reject ) => {
    checkEventInputData(event, resolve);

    const requestBody = JSON.parse(event.body);

    let params = {
      ClientId: '351sd83rj8pff8nuqbtjc69n3t',
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      UserPoolId: 'eu-west-2_TithjXJyJ',
      AuthParameters: {
        'USERNAME': requestBody.username,
        'PASSWORD': requestBody.password
      }
    };

    Cognito.adminInitiateAuth(params).promise()
      .then(data => {

        if ( _.isNil(data.ChallengeName) ) {
          let headers = {
            Authorization: data.AuthenticationResult.IdToken
          };
          resolve(Utils.setupResponse(200, {}, headers));
        } else {
          let body = {
            message: 'Actions needed',
            action: data.ChallengeName,
            session: data.Session
          };
          resolve(Utils.setupResponse(200, body))
        }
      })
      .catch(() => resolve(Utils.setupResponse(401, { message: 'Unauthorized' })));
  });
};
