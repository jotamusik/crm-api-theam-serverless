'use strict';

const Utils = require('../utils/utils');
const _ = require('lodash/lang');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });
const s3 = new AWS.S3();

function requestBodyNotContainsNeededData( requestBody ) {

  return _.isNil(requestBody.customerName) || _.isNil(requestBody.customerSurname);
}

function checkEventInputData( event, resolve ) {
  const requestBody = JSON.parse(event.body);

  if ( _.isNil(requestBody) ) {
    resolve(Utils.setupResponse(400, { message: "Bad Request" }));
  }

  if ( _.isNil(event.pathParameters.id) ) {
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
      ReturnValues: "NONE"
    };

    docClient.update(params).promise()
      .then(() => {

        const bucketParams = {
          Bucket: 'customerprofileimages',
          Key: 'api/uploads/customerProfiles/' + generatedCustomerId,
          Expires: 200
        };

        const url = s3.getSignedUrl('putObject', bucketParams);

        resolve(Utils.setupResponse(200, { 'signedUrl': url }));
      })
      .catch(error => {
        reject(error)
      });
  });
};
