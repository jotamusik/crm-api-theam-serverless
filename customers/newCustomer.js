'use strict';

const Utils = require('../utils/utils');
const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'eu-west-2'});

module.exports.handler = async event => {

  return new Promise((resolve, reject) => {

    let requestBody = JSON.parse(event.body);
    console.log('event');
    console.log(event);

    console.log('requestBody');
    console.log(requestBody);

    let params = {
      Item: {
        id: uuidv4().toString(),
        name: requestBody.name,
        surname: requestBody.surname
      },
      TableName: "customers",
      ReturnValues: 'NONE'
    };

    docClient.put(params).promise()
      .then((data) => {
        console.log('DATA');
        console.log(data);
        resolve(Utils.setupResponse(200));
      })
      .catch(error => {
        console.log('ERROR');
        console.log(error);
        reject(Utils.setupResponse(500, error));
      });
  });
};
