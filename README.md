# CRM REST API with serverless framework
This is a Rest API implemented with [Serverless Framework](https://serverless.com/) using [AWS](https://aws.amazon.com/) as a cloud computing service provider

## Requirements for the API:
- The API should be only accessible by a registered user by providing an
authentication mechanism. 
- A user can only:
  - List all customers in the database.
  - Get full customer information, including a photo URL.
  - Create a new customer:
    - A customer should have at least name, surname, id and a photo field.
    - Name, surname and id are required fields.
    - Image uploads should be able to be managed.
    - The customer should have a reference to the user who created it.
    - The customer should hold a reference to the last user who modified it.
  - Update an existing customer.

  - Delete an existing customer.
- An admin can also:
  - Manage users:
  - Create users.
  - Delete users.
  - Update users.
  - List users.
  - Change admin status.
  
## Arquitecture
  
The entry point is Api Gateway. All endpoints are securized using AWS Cognito unless the /login and /auth/requiredAction in order to let the users log in through these endpoints.
  
Once the Cognito Authorizer is passed, a lambda function is called. There is a lambda function per endpoint.

Those lambdas will check the input data and call one or more actions defined under /lib folder in order to avoid duplicated code.
The lambdas will call another services as DynamoDB, S3 or Cognito through this libraries.

Each external service (S3, Cognito and DynamoDB) has it's own library in order to organized the code.

## Documentation

All the things I've used here comes from the links below and probably more (but I don't remember those):
- [Serverless Framework Docs](https://serverless.com/framework/docs/)
- [AWS Javascript SDK Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
- A [reddit question](https://www.reddit.com/r/aws/comments/8ym08a/cognito_separating_users_into_user_pools_or_into/) which let me know how to check the cognito groups of the caller user
- [Blog Post](https://ponyfoo.com/articles/action-pattern-clean-obvious-testable-code) where I found the pattern used in this project. It looks very easy to understand, and for me, this pattern allows to generate readable code
- Of course, there are [StackOverflow](https://stackoverflow.com) questions/answers that guide me (as all human developer in this world)
- Also [Medium](https://stackoverflow.com) posts about serverless and AWS have been helpful (those seniors who post blogs entries just saves me... One day I will save a junior's life)
