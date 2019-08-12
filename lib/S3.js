'use strict';

const config = require('../config');

const customerProfileImagesBucket = config.customerProfileImageBucket;
const customerProfileImagePathPrefix = config.customerProfileImagePathPrefix;
const signedUrlExpirationTime = config.signedUrlExpirationTime;

const AWS = require('aws-sdk');
const S3 = new AWS.S3();

module.exports = {
  generateSignedUrl
};


function generateSignedUrl( customerId, operation ) {
  return new Promise(( resolve, reject ) => {
    try {
      let params = {
        Bucket: customerProfileImagesBucket,
        Key: customerProfileImagePathPrefix + customerId
      };

      if ( operation === 'getObject' ) {
        S3.headObject(params).promise()
          .then(() => {
            params.Expires = signedUrlExpirationTime;
            let profileImageUrl = S3.getSignedUrl(operation, params);
            resolve(profileImageUrl);
          })
          .catch(() => resolve());
      }

      if ( operation === 'putObject' ) {
        params.Expires = signedUrlExpirationTime;
        let profileImageUrl = S3.getSignedUrl(operation, params);
        resolve(profileImageUrl);
      }
    }
    catch ( exception ) {
      throw new Error(`[generateSignedUrl] ${ exception.message }`);
    }
  });
}
