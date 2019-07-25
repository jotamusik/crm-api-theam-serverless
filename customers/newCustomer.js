'use strict';

const Utils = require('../utils/utils');
const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

module.exports.handler = async event => {

  return new Promise(( resolve, reject ) => {

    const requestBody = JSON.parse(event.body);

    let params = {
      Item: {
        customerId: uuidv4().toString(),
        customerName: requestBody.customerName,
        customerSurname: requestBody.customerSurname
      },
      TableName: "customers",
      ReturnValues: 'NONE'
    };

    docClient.put(params).promise()
      .then(() => resolve(Utils.setupResponse(200)))
      .catch(error => reject(error));
  });
};
