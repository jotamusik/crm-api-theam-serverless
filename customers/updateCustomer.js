'use strict';

const Utils = require('../utils/utils');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

function requestBodyNotContainsNeededData( requestBody ) {
  return requestBody.customerName ? !requestBody.customerSurname : true;
}

function checkEventInputData( event, resolve ) {
  const requestBody = JSON.parse(event.body);

  if ( !event.pathParameters.id ) {
    resolve(Utils.setupResponse(400, { message: "Bad Request" }));
  }

  if ( requestBodyNotContainsNeededData(requestBody) ) {
    resolve(Utils.setupResponse(400, { message: 'Bad Request' }));
  }
}

module.exports.handler = async event => {

  return new Promise(( resolve, reject ) => {

    checkEventInputData(event, resolve);

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
      ReturnValues: "ALL_NEW"
    };

    docClient.update(params).promise()
      .then(() => resolve(Utils.setupResponse(200)))
      .catch(error => {
        reject(error)
      });
  });
};
