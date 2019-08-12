'use strict';

const customerProfileImageBucket = process.env.CUSTOMER_PROFILE_IMAGE_BUCKET;
const customerProfileImagePathPrefix = process.env.CUSTOMER_PROFILE_IMAGE_PATH_PREFIX;
const signedUrlExpirationTime = process.env.SIGNED_URL_EXPIRATION_TIME;
const userPoolId = process.env.USER_POOL_ID;
const clientId = process.env.CLIENT_ID;
const authFlow = process.env.AUTH_FLOW;
const defaultUserGroup = process.env.DEFAULT_USER_GROUP;
const customerTableName = process.env.CUSTOMER_TABLE_NAME;
const customerTableRegion = process.env.CUSTOMER_TABLE_REGION;

module.exports = {
  customerProfileImageBucket,
  customerProfileImagePathPrefix,
  signedUrlExpirationTime,
  userPoolId,
  clientId,
  authFlow,
  defaultUserGroup,
  customerTableName,
  customerTableRegion
};
