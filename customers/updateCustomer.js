'use strict';

const Utils = require('../utils/utils');
const _ = require('lodash/lang');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

function requestBodyNotContainsNeededData( requestBody ) {

  return _.isNil(requestBody.customerName) || _.isNil(requestBody.customerSurname);
}

function inputDataIsNotValid( event ) {
  const requestBody = JSON.parse(event.body);
  return _.isNil(requestBody) || _.isNil(event.pathParameters.id) || requestBodyNotContainsNeededData(requestBody);
}

module.exports.handler = async event => {

  return new Promise(( resolve, reject ) => {

     if ( inputDataIsNotValid(event) ) {
       resolve(Utils.setupResponse(400, { message: 'Bad Request' }));
     }

    const requestBody = JSON.parse(event.body);

    let params = {
      TableName: 'customers',
      Key: {
        customerId: event.pathParameters.id.toString()
      },
      UpdateExpression: 'SET customerName = :customerName, customerSurname = :customerSurname',
      ConditionExpression: 'customerId = :customerId and (customerName <> :customerName or customerSurname <> :customerSurname)',
      ExpressionAttributeValues: {
        ':customerId': event.pathParameters.id.toString(),
        ':customerName' : requestBody.customerName,
        ':customerSurname': requestBody.customerSurname
      },
      ReturnValues: "NONE"
    };

    docClient.update(params).promise()
      .then(() => resolve(Utils.setupResponse(200)))
      .catch(error => {
        reject(error)
      });
  });
};
