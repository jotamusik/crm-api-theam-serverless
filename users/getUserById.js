'use strict';

const Response = require("../lib/Response");
const Auth = require("../lib/Auth");
const Cognito = require("../lib/Cognito");
const _ = require('lodash/lang');


function requestNotContainsUserIdPathParameter( event ) {
  return _.isNil(event.pathParameters.id);
}


module.exports.handler = async event => {
  return new Promise(async ( resolve, reject ) => {

    if ( Auth.callerHasNotAdminAccess(event) ) {
      resolve(Response.Unauthorized());
    }

    if ( requestNotContainsUserIdPathParameter(event) ) {
      resolve(Response.BadRequest());
    }

    const requestedUserUsername = event.pathParameters.id;

    try {
      const user = await Cognito.getUserByUsername(requestedUserUsername);
      resolve(Response.Ok(user));
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
