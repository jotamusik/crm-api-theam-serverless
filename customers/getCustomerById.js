'use strict';

const Utils = require('../utils/utils');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });
const s3 = new AWS.S3();
const _ = require('lodash/lang');

module.exports.handler = async event => {

  return new Promise(( resolve, reject ) => {

    if ( _.isNil(event.pathParameters.id) ) {
      resolve(Utils.setupResponse(400, { message: "Bad Request" }));
    }

    let params = {
      TableName: 'customers',
      Key: {
        customerId: event.pathParameters.id
      }
    };

    docClient.get(params).promise()
      .then(( dbData ) => {

        let s3Params = {
          Bucket: 'customerprofileimages',
          Key: 'api/uploads/customerProfiles/' + dbData.Item.customerId
        };

        s3.headObject(s3Params).promise()
          .then(() => {
            s3Params.Expires = 3600;
            dbData.Item.profileImage = s3.getSignedUrl('getObject', s3Params);
            resolve(Utils.setupResponse(200, dbData.Item));
          })
          .catch(() => resolve(Utils.setupResponse(200, dbData.Item)));
      })
      .catch(error => reject(error));
  });
};
