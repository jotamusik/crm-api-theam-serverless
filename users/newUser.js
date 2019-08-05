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

function callerHasNotAdminAccess( event ) {
  const groups = event.requestContext.authorizer.claims['cognito:groups'].split(',');
  return groups.includes('admins');
}


module.exports.handler = async event => {
  return new Promise(( resolve, reject ) => {
    if ( callerHasNotAdminAccess(event) ) {
      resolve(Utils.setupResponse(401, { message: 'Unauthorized' }));
    }

    checkEventInputData(event, resolve);

    const requestBody = JSON.parse(event.body);
    let params = {
      UserPoolId: 'eu-west-2_TithjXJyJ',
      TemporaryPassword: requestBody.password,
      Username: requestBody.username
    };
    Cognito.adminCreateUser(params).promise()
      .then(data => {

        let addToGroupParams = {
          UserPoolId: 'eu-west-2_TithjXJyJ',
          GroupName: 'users',
          Username: data.User.Username
        };
        Cognito.adminAddUserToGroup(addToGroupParams).promise()
          .then(() => {
            if ( !_.isNil(requestBody.groups) ) {
              if ( requestBody.groups.includes('admins') ) {

                addToGroupParams.GroupName = 'admins';
                Cognito.adminAddUserToGroup(addToGroupParams).promise()
                  .then(() => resolve(Utils.setupResponse(200)))
                  .catch(error => reject(error));
              }
            } else {
              resolve(Utils.setupResponse(200));
            }
          })
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
  });
};
