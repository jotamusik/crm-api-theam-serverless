'use strict';

const Response = require("../lib/Response");
const Cognito = require("../lib/Cognito");
const Auth = require("../lib/Auth");


module.exports.handler = async event => {
  return new Promise(async ( resolve, reject ) => {
    if ( Auth.callerHasNotAdminAccess(event) ) {
      resolve(Response.Unauthorized());
    }

    try {
      let users = await Cognito.listUsers();
      resolve(Response.Ok(users));
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
