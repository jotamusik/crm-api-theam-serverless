'use strict';

const Utils = require('../utils/utils');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

function requestBodyNotContainsNeededData( requestBody ) {
  return requestBody.customerName ? !requestBody.customerSurname : true;
}

module.exports.handler = async event => {

  return new Promise(( resolve, reject ) => {

    if ( !event.pathParameters.id ) {
      reject(Utils.setupResponse(400, { message: "Bad Request" }));
    }

    const requestBody = JSON.parse(event.body);

    if ( requestBodyNotContainsNeededData(requestBody) ) {
      reject(Utils.setupResponse(400, { message: 'Bad Request' }));
    }

    let getParams = {
      TableName: 'customers',
      Key: {
        customerId: event.pathParameters.id.toString()
      }
    };

    docClient.get(getParams).promise()
      .then(( data ) => {
        console.log("DATA");
        console.log(data);
        if ( !data.Item ) {
          console.log("THERE IS NO ITEM");
          reject(Utils.setupResponse(400, { message: 'Bad Request' }));
        }
        let putParams = {
          Item: {
            customerId: event.pathParameters.id.toString(),
            customerName: requestBody.customerName,
            customerSurname: requestBody.customerSurname
          },
          TableName: "customers",
          ReturnValues: 'NONE'
        };

        docClient.put(putParams).promise()
          .then(() => resolve(Utils.setupResponse(200)))
          .catch(error => reject(Utils.setupResponse(500, error)));

      })
      .catch(error => reject(Utils.setupResponse(500, error)));
  });
};
