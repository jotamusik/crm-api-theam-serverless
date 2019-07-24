'use strict';

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'eu-west-2'});

module.exports.handler = async event => {

  let params = {
    TableName : 'customers'
  };

  return new Promise((resolve, reject) => {
    docClient.scan(params).promise()
      .then((data) => {
        resolve(setupResponse(200, data));
      })
      .catch(error => {
        reject(error);
      });
  });
};

function setupResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { },
    body: JSON.stringify(body)
  }
}
