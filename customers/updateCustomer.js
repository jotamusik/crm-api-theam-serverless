'use strict';

const Response = require('../lib/Response');
const DynamoDB = require('../lib/DynamoDB');
const Auth = require('../lib/Auth');
const _ = require('lodash/lang');

function requestBodyNotContainsNeededData( requestBody ) {
  return _.isNil(requestBody.customerName) || _.isNil(requestBody.customerSurname);
}

function inputDataIsNotValid( event ) {
  const requestBody = JSON.parse(event.body);
  return _.isNil(requestBody) || _.isNil(event.pathParameters.id) || requestBodyNotContainsNeededData(requestBody);
}

module.exports.handler = async event => {

  return new Promise(async ( resolve, reject ) => {

    if ( inputDataIsNotValid(event) ) {
      resolve(Response.BadRequest());
    }

    const requestBody = JSON.parse(event.body),
      id = event.pathParameters.id,
      name = requestBody.customerName,
      surname = requestBody.customerSurname,
      updatedUser = Auth.getCaller(event);

    try {
      await DynamoDB.updateCustomer({ id, name, surname, updatedUser });
      resolve(Response.Ok());
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
