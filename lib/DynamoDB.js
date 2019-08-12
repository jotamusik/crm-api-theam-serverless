'use strict';

const config = require('../config');

const customerTableName = config.customerTableName;
const customerTableRegion = config.customerTableRegion;

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: customerTableRegion });
const uuidv4 = require('uuid/v4');

module.exports = {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};

function createCustomer( { name, surname, createdUser } ) {
  return new Promise(( resolve, reject ) => {
    try {

      let generatedCustomerId = uuidv4();

      let params = {
        Item: {
          customerId: generatedCustomerId.toString(),
          customerName: name,
          customerSurname: surname,
          createdUser: createdUser
        },
        TableName: customerTableName,
        ReturnValues: 'NONE'
      };

      docClient.put(params).promise()
        .then(() => resolve())
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[createCustomer] ${ exception.message }`);
    }
  });
}

function listCustomers() {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        TableName: customerTableName
      };
      docClient.scan(params).promise()
        .then(data => resolve(data))
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[listCustomers] ${ exception.message }`);
    }
  });
}

function getCustomerById( id ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        TableName: customerTableName,
        Key: {
          customerId: id
        }
      };

      docClient.get(params).promise()
        .then(dbData => resolve(dbData))
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[getCustomerById] ${ exception.message }`);
    }
  });
}

function deleteCustomer( id ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        TableName: customerTableName,
        Key: {
          customerId: id
        }
      };

      docClient.delete(params).promise()
        .then(() => resolve())
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[deleteCustomer] ${ exception.message }`);
    }
  });
}

function updateCustomer( { id, name, surname, updatedUser } ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        TableName: customerTableName,
        Key: {
          customerId: id.toString()
        },
        UpdateExpression: 'SET customerName = :customerName, customerSurname = :customerSurname, updatedUser = :updatedUser',
        ConditionExpression: 'customerId = :customerId and (customerName <> :customerName or customerSurname <> :customerSurname)',
        ExpressionAttributeValues: {
          ':customerId': id.toString(),
          ':customerName': name,
          ':customerSurname': surname,
          ':updatedUser': updatedUser
        },
        ReturnValues: "NONE"
      };

      docClient.update(params).promise()
        .then(() => resolve())
        .catch(error => reject(error));
    }
    catch ( exception ) {
      throw new Error(`[updateCustomer] ${ exception.message }`);
    }
  });
}
