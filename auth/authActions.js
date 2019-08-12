'use strict';

const Response = require("../lib/Response");
const Cognito = require("../lib/Cognito");
const _ = require('lodash/lang');

function requestBodyNotContainsNeededData( requestBody ) {
  return _.isNil(requestBody.action) || _.isNil(requestBody.session) || _.isNil(requestBody.challengeResponses);
}

module.exports.handler = async event => {
  return new Promise(async ( resolve, reject ) => {
    const requestBody = JSON.parse(event.body);

    if ( requestBodyNotContainsNeededData(requestBody) ) {
      resolve(Response.BadRequest());
    }

    const action = requestBody.action,
      session = requestBody.session,
      challengeResponses = requestBody.challengeResponses;

    try {
      let challengeResponseData = await Cognito.respondToAuthChallenge({ action, session, challengeResponses });
      resolve(Response.Ok(challengeResponseData.body, challengeResponseData.headers));
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
