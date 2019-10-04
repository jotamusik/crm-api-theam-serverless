'use strict';

const Response = require("../lib/Response");
const Cognito = require("../lib/Cognito");
const _ = require('lodash/lang');

function requestBodyNotContainsNeededData( requestBody ) {

  return _.isNil(requestBody.username) || _.isNil(requestBody.password);
}

module.exports.handler = async event => {
  return new Promise(async ( resolve, reject ) => {
    const requestBody = event.body;

    if ( requestBodyNotContainsNeededData(requestBody) ) {
      resolve(Response.BadRequest());
    }

    const username = requestBody.username,
        password = requestBody.password;

    try {
      let loginData = await Cognito.login({ username, password });
      if ( _.isNil(loginData.Unauthorized) ) {
        resolve(Response.Ok(loginData.body, loginData.headers));
      }
      else {
        resolve(Response.Unauthorized());
      }
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
