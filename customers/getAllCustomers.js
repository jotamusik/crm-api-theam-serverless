'use strict';

const Response = require('../lib/Response');
const DynamoDB = require('../lib/DynamoDB');

module.exports.handler = async () => {
  return new Promise(async ( resolve, reject ) => {
    try {
      let customers = await DynamoDB.listCustomers();
      resolve(Response.Ok(customers));
    }
    catch ( exception ) {
      console.error(`[main] ${ exception.message }`);
      reject(exception)
    }
  });
};
