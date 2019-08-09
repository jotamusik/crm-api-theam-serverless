'use strict';

const AWS = require('aws-sdk');
const Utils = require("../utils/utils");
const Cognito = new AWS.CognitoIdentityServiceProvider();
const _ = require('lodash/lang');

function requestBodyContainsPassword( requestBody ) {
  return !_.isNil(requestBody.password);
}

function requestBodyContainsGroups( requestBody ) {

  if ( _.isNil(requestBody.groups) ) {
    return false;
  }
  else {
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
  return callerUser.Username === event.pathParameters.id || Utils.callerHasAdminAccess(event);
}

function getGroupsToDelete( actualGroups, requestedGroups ) {
  return actualGroups.filter(group => !requestedGroups.includes(group));
}

function getGroupsToAdd( actualGroups, requestedGroups ) {
  return requestedGroups.filter(group => !actualGroups.includes(group));
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
      throw new Error(`[getUserByUsername] ${ exception.message }`);
    }
  });
}

function getUserGroups( username ) {
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
      throw new Error(`[getUserGroups] ${ exception.message }`);
    }
  });
}

function changeUserPassword( username, newPassword ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        UserPoolId: 'eu-west-2_TithjXJyJ',
        Username: username,
        Password: newPassword,
        Permanent: true
      };
      Cognito.adminSetUserPassword(params).promise()
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[changeUserPassword] ${ exception.message }`);
    }
  });
}

function removeUserFromGroup( username, group ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        UserPoolId: 'eu-west-2_TithjXJyJ',
        Username: username,
        GroupName: group
      };
      Cognito.adminRemoveUserFromGroup(params).promise()
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[changeUserPassword] ${ exception.message }`);
    }
  });
}

function addUserToGroup( username, group ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        UserPoolId: 'eu-west-2_TithjXJyJ',
        Username: username,
        GroupName: group
      };
      Cognito.adminAddUserToGroup(params).promise()
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[addUserToGroup] ${ exception.message }`);
    }
  });
}

async function changeUsersGroups( username, groups ) {
  let data = await getUserGroups(username);
  let requestedUserActualGroups = data.map(group => group.GroupName);
  const groupsToDelete = getGroupsToDelete(requestedUserActualGroups, groups);
  const groupsToAdd = getGroupsToAdd(requestedUserActualGroups, groups);

  for ( let group of groupsToAdd ) {
    await addUserToGroup(username, group);
  }
  for ( let group of groupsToDelete ) {
    await removeUserFromGroup(username, group);
  }
}

module.exports.handler = async event => {
  return new Promise(async ( resolve, reject ) => {

    const requestBody = JSON.parse(event.body);

    if ( requestNotContainsUserIdPathParameter(event) || requestBodyIsEmpty(requestBody) ) {
      resolve(Utils.BadRequest());
    }

    const requestedUserUsername = event.pathParameters.id;
    const callerUsername = event.requestContext.authorizer.claims[ 'cognito:username' ];

    try {

      let callerUser = await getUserByUsername(callerUsername);

      if ( callerUserCanChangeThePassword(callerUser, event) && requestBodyContainsPassword(requestBody) ) {
        changeUserPassword(requestedUserUsername, requestBody.password);
      }

      if ( Utils.callerHasAdminAccess(event) && requestBodyContainsGroups(requestBody) ) {
        await changeUsersGroups(requestedUserUsername, requestBody.groups);
      }

      resolve(Utils.Ok());
    }
    catch ( exception ) {
      console.log(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
