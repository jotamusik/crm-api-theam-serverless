'use strict';

const Utils = require('../utils/utils');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const _ = require('lodash/lang');

function inputDataIsNotValid( event ) {
  return _.isNil(event.pathParameters.id) || _.isNil(event.queryStringParameters.operation) ||
    ( event.queryStringParameters.operation !== 'getObject' && event.queryStringParameters.operation !== 'putObject' );
}

module.exports.handler = async event => {

  console.log(event);

  return new Promise(( resolve, reject ) => {

    if ( inputDataIsNotValid(event) ) {
      resolve(Utils.setupResponse(400, { message: "Bad Request" }));
    }

    const customerId = event.pathParameters.id;
    const operation = event.queryStringParameters.operation;

    let s3Params = {
      Bucket: 'customerprofileimages',
      Key: 'api/uploads/customerProfiles/' + customerId
    };

    if ( operation === 'getObject' ) {
      s3.headObject(s3Params).promise()
        .then(() => {
          s3Params.Expires = 3600;
          let profileImage = s3.getSignedUrl(operation, s3Params);
          resolve(Utils.setupResponse(200, { profileImageUrl: profileImage }));
        })
        .catch(() => resolve(Utils.setupResponse(404, { message: 'Resource Not Found' })));
    }

    if ( operation === 'putObject' ) {
      s3Params.Expires = 3600;
      let profileImage = s3.getSignedUrl(operation, s3Params);
      resolve(Utils.setupResponse(200, { profileImageUrl: profileImage }));
    }
  });
};
