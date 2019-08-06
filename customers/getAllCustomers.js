'use strict';

const Utils = require('../utils/utils');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

module.exports.handler = async () => {

  let params = {
    TableName: 'customers'
  };

  return new Promise(( resolve, reject ) => {
    docClient.scan(params).promise()
      .then(data => resolve(Utils.Ok(data)))
      .catch(error => reject(error));
  });
};
