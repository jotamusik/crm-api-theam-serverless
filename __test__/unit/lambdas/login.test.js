const Cognito = require('../../../lib/Cognito');
const login = require('../../../auth/login').handler;
const Response = require('../../../lib/Response');

jest.mock('../../lib/Cognito');

let username = "peter@gmail.com";
let password = "1234@Asd.";

const invalidEventBody = { body: {} };
const validEventBody = { body: { username, password } };

const cognitoLoginHeader = { Authorization: 'Token' };
let cognitoChallengeBody = {
  message: 'Actions needed',
  action: 'ChallengeName',
  session: 'Session'
};

const cognitoLogedResponse = { header: cognitoLoginHeader, body: {} };
const cognitoChallengeResponse = { body: cognitoChallengeBody, header: {} };
const exception = { message: 'Unexpected Error' };

function expectBadRequest( response, done ) {
  expect(response).toStrictEqual(Response.BadRequest());
  done();
}

function expectUnauthorized( response, done ) {
  expect(response).toStrictEqual(Response.Unauthorized());
  done();
}

function expectResponseWithToken( response, done ) {
  expect(response).toStrictEqual(Response.Ok(cognitoLogedResponse.body, cognitoLogedResponse.headers));
  done();
}

function expectResponseWithChallenge( response, done ) {
  expect(response).toStrictEqual(Response.Ok(cognitoChallengeResponse.body, cognitoChallengeResponse.headers));
  done();
}

function expectRejectedError( error, done ) {
  expect(error).toStrictEqual(exception);
  done();
}

describe("Login lambda", function () {
  test("should return a \'BadRequest\' on invalid event body (no username or password)", done => {
    login(invalidEventBody).then(response => expectBadRequest(response, done));
  });
  test("should return an \'Unauthorized\' on bad username or password", done => {
    Cognito.login.mockResolvedValue({ Unauthorized: true });
    login(validEventBody).then(response => expectUnauthorized(response, done));
  });
  test("should return a response with a challenge on \'Body\'", done => {
    Cognito.login.mockResolvedValue(cognitoChallengeResponse);
    login(validEventBody).then(response => expectResponseWithChallenge(response, done));
  });
  test("should return a response with a token on \'Authorization\' header", done => {
    Cognito.login.mockResolvedValue(cognitoLogedResponse);
    login(validEventBody).then(response => expectResponseWithToken(response, done));
  });
  test("should throw an exception on unexpected error", done => {
    Cognito.login.mockImplementation(() => { throw exception });
    login(validEventBody).catch(error => expectRejectedError(error, done));
  });
});
