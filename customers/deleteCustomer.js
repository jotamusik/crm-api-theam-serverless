'use strict';

const Utils = require('../utils/utils');
const AWS = require('aws-sdk');
const _ = require('lodash/lang');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

function inputDataIsNotValid( event ) {
  return _.isNil(event.pathParameter.id);
}

module.exports.handler = async event => {

  return new Promise(( resolve, reject ) => {

    if ( inputDataIsNotValid(event) ) {
      resolve(Utils.setupResponse(400, { message: "Bad Request" }));
    }

    let params = {
      TableName: 'customers',
      Key: {
        customerId: event.pathParameters.id
      }
    };

    docClient.delete(params).promise()
      .then(() => resolve(Utils.setupResponse(200)))
      .catch(error => reject(error));
  });
};
