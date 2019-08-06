'use strict';

const Utils = require('../utils/utils');
const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });
const _ = require('lodash/lang');


function requestBodyNotContainsNeededData( requestBody ) {

  return _.isNil(requestBody.customerName) || _.isNil(requestBody.customerSurname);
}

function checkEventInputData( event, resolve ) {
  const requestBody = JSON.parse(event.body);

  if ( requestBodyNotContainsNeededData(requestBody) ) {
    resolve(Utils.BadRequest());
  }
}

module.exports.handler = async event => {

  return new Promise(( resolve, reject ) => {

    checkEventInputData(event, resolve);

    const requestBody = JSON.parse(event.body);

    let generatedCustomerId = uuidv4();

    let params = {
      Item: {
        customerId: generatedCustomerId.toString(),
        customerName: requestBody.customerName,
        customerSurname: requestBody.customerSurname
      },
      TableName: "customers",
      ReturnValues: 'NONE'
    };

    docClient.put(params).promise()
      .then(() => resolve(Utils.Ok()))    // ToDo: Send the created customer ?
      .catch(error => reject(error));
  });
};
