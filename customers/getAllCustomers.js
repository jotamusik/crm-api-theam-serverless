'use strict';

const Utils = require('../utils/utils');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });
const s3 = new AWS.S3();

module.exports.handler = async () => {

  let params = {
    TableName: 'customers'
  };

  return new Promise(( resolve, reject ) => {
    docClient.scan(params).promise()
      .then(data => {

        data.Items.forEach( item => {
          let s3Params = {
            Bucket: 'customerprofileimages',
            Key: 'api/uploads/customerProfiles/' + item.customerId
          };

          s3.headObject(s3Params).promise()
            .then(() => {
              s3Params.Expires = 3600;
              item.profileImage = s3.getSignedUrl('getObject', s3Params);
            });
        });

        resolve(Utils.setupResponse(200, data));
      })
      .catch(error => reject(error));
  });
};
