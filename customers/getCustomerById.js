'use strict';

const Response = require('../lib/Response');
const DynamoDB = require('../lib/DynamoDB');
const _ = require('lodash/lang');

function requestNotContainsCustomerIdPathParameter( event ) {
  return _.isNil(event.pathParameters.id);
}

module.exports.handler = async event => {

  return new Promise(async ( resolve, reject ) => {

    if ( requestNotContainsCustomerIdPathParameter(event) ) {
      resolve(Response.BadRequest());
    }

    const id = event.pathParameters.id;

    try {
      let customer = await DynamoDB.getCustomerById(id);
      if ( _.isNil(customer.Item) ) {
        resolve(Response.ResourceNotFound());
      } else {
        resolve(Response.Ok(customer.Item));
      }
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
