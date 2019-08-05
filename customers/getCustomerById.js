'use strict';

const Utils = require('../utils/utils');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });
const _ = require('lodash/lang');

function inputDataIsNotValid( event ) {
  return _.isNil(event.pathParameters.id);
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

    docClient.get(params).promise()
      .then(( dbData ) => {
        if ( _.isNil(dbData.Item) ) {
          resolve(Utils.setupResponse(404, { message: 'Resource Not Found' }));
        }
        resolve(Utils.setupResponse(200, dbData.Item))
      })
      .catch(error => reject(error));
  });
};
