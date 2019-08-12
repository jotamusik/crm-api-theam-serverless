'use strict';

const Response = require('../lib/Response');
const DynamoDB = require("../lib/DynamoDB");
const Auth = require("../lib/Auth");
const _ = require('lodash/lang');


function requestBodyNotContainsNeededData( requestBody ) {
  return _.isNil(requestBody.customerName) || _.isNil(requestBody.customerSurname);
}

module.exports.handler = async event => {

  return new Promise(async ( resolve, reject ) => {

    const requestBody = JSON.parse(event.body);

    if ( requestBodyNotContainsNeededData(requestBody) ) {
      resolve(Response.BadRequest());
    }

    const name = requestBody.customerName,
      surname = requestBody.customerSurname,
      createdUser = Auth.getCaller(event);

    try {
      await DynamoDB.createCustomer({ name, surname, createdUser });
      resolve(Response.Ok());
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
