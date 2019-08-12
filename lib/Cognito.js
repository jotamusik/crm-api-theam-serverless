'use strict';

const config = require('../config');

const userPoolId = config.userPoolId;
const clientId = config.clientId;
const authFlow = config.authFlow;
const defaultUserGroup = config.defaultUserGroup;

const AWS = require('aws-sdk');
const Cognito = new AWS.CognitoIdentityServiceProvider();
const _ = require('lodash/lang');

module.exports = {
  getUserByUsername,
  changeUserPassword,
  changeUsersGroups,
  createUser,
  deleteUser,
  listUsers,
  login,
  respondToAuthChallenge,
  defaultUserGroup
};

function getGroupsToDelete( actualGroups, requestedGroups ) {
  return actualGroups.filter(group => !requestedGroups.includes(group));
}

function getGroupsToAdd( actualGroups, requestedGroups ) {
  return requestedGroups.filter(group => !actualGroups.includes(group));
}

function createUser( { username, password } ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        UserPoolId: userPoolId,
        TemporaryPassword: password,
        Username: username
      };
      Cognito.adminCreateUser(params).promise()
        .then(data => resolve(data))
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[createUser] ${ exception.message }`);
    }
  });
}

function deleteUser( username ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        UserPoolId: userPoolId,
        Username: username
      };
      Cognito.adminDeleteUser(params).promise()
        .then(data => resolve(data))
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[deleteUser] ${ exception.message }`);
    }
  });
}

function listUsers() {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        UserPoolId: userPoolId
      };
      Cognito.listUsers(params).promise()
        .then(data => resolve(data))
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[listUsers] ${ exception.message }`);
    }
  });
}

function getUserByUsername( username ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        UserPoolId: userPoolId,
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
        UserPoolId: userPoolId,
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
        UserPoolId: userPoolId,
        Username: username,
        Password: newPassword,
        Permanent: true
      };
      Cognito.adminSetUserPassword(params).promise()
        .then(() => resolve())
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
        UserPoolId: userPoolId,
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
        UserPoolId: userPoolId,
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

function login( { username, password } ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        ClientId: clientId,
        AuthFlow: authFlow,
        UserPoolId: userPoolId,
        AuthParameters: {
          'USERNAME': username,
          'PASSWORD': password
        }
      };

      Cognito.adminInitiateAuth(params).promise()
        .then(data => {

          if ( _.isNil(data.ChallengeName) ) {
            let headers = {
              Authorization: data.AuthenticationResult.IdToken
            };
            resolve({ body: {}, headers });
          } else {
            let body = {
              message: 'Actions needed',
              action: data.ChallengeName,
              session: data.Session
            };
            resolve({ body, headers: {} });
          }
        })
        .catch(() => resolve({ Unauthorized: true }));
    }
    catch ( exception ) {
      throw new Error(`[login] ${ exception.message }`);
    }
  });
}

function respondToAuthChallenge( { action, challengeResponses, session } ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        ClientId: clientId,
        ChallengeName: action,
        UserPoolId: userPoolId,
        ChallengeResponses: challengeResponses,
        Session: session
      };

      Cognito.adminRespondToAuthChallenge(params).promise()
        .then(data => {
          if ( _.isNil(data.ChallengeName) ) {
            let headers = {
              Authorization: data.AuthenticationResult.IdToken
            };
            resolve({ body: {}, headers });
          } else {
            let body = {
              message: 'Actions needed',
              action: data.ChallengeName,
              session: data.Session
            };
            resolve({ body, headers: {} });
          }
        })
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[respondToAuthChallenge] ${ exception.message }`);
    }
  });
}
