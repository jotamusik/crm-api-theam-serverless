'use strict';

const Response = require('../lib/Response');
const S3 = require("../lib/S3");
const _ = require('lodash/lang');

function operationIsNotAllowed( event ) {
  return event.queryStringParameters.operation !== 'getObject' && event.queryStringParameters.operation !== 'putObject';
}

function requestNotContainsCustomerIdPathParameter( event ) {
  return _.isNil(event.pathParameters.id);
}

function requestNotContainsSignedUrlOperation( event ) {
  return _.isNil(event.queryStringParameters.operation);
}

function requestDataIsNotValid( event ) {
  return requestNotContainsCustomerIdPathParameter(event) ||
    requestNotContainsSignedUrlOperation(event) ||
    operationIsNotAllowed(event);
}

module.exports.handler = async event => {

  return new Promise(async ( resolve, reject ) => {

    if ( requestDataIsNotValid(event) ) {
      resolve(Response.BadRequest());
    }

    const customerId = event.pathParameters.id;
    const operation = event.queryStringParameters.operation;

    try {
      let profileImageSignedUrl = await S3.generateSignedUrl(customerId, operation);
      if ( _.isNil(profileImageSignedUrl) ) {
        resolve(Response.ResourceNotFound());
      } else {
        resolve(Response.Ok({ profileImageSignedUrl }));
      }
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
