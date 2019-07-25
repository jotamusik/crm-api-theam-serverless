'use strict';

const Utils = require('../utils/utils');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

module.exports.handler = async event => {

  return new Promise(( resolve, reject ) => {

    if ( !event.pathParameters.id ) {
      resolve(Utils.setupResponse(400, { message: "Bad Request" }));
    }

    let params = {
      TableName: 'customers',
      Key: {
        customerId: event.pathParameters.id
      }
    };

    docClient.get(params).promise()
      .then(( data ) => resolve(Utils.setupResponse(200, data.Item)))
      .catch(error => reject(error));
  });
};
