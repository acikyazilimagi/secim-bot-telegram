
// A simple token-based authorizer example to demonstrate how to use an authorization token 
// to allow or deny a request. In this example, the caller named 'user' is allowed to invoke 
// a request if the client-supplied token value is 'allow'. The caller is not allowed to invoke 
// the request if the token value is 'deny'. If the token value is 'unauthorized' or an empty
// string, the authorizer function returns an HTTP 401 status code. For any other token value, 
// the authorizer returns an HTTP 500 status code. 
// Note that token values are case-sensitive.
import {
    SecretsManagerClient,
    GetSecretValueCommand,
  } from "@aws-sdk/client-secrets-manager";
  
  
  export const handler =  async function(event, context, callback) {
    //   console.log({ event });
      var token = event.authorizationToken;
      const expectedToken = await readToken();
    //   console.log({ token })
    //   console.log({ expectedToken })
  
      if (expectedToken == token) { 
              callback(null, generatePolicy('user', 'Allow', event.methodArn));
      } else {
              callback("Unauthorized");   // Return a 401 Unauthorized response
      }
  };
  
  // Help function to generate an IAM policy
  var generatePolicy = function(principalId, effect, resource) {
      var authResponse = {};
      
      authResponse.principalId = principalId;
      if (effect && resource) {
          var policyDocument = {};
          policyDocument.Version = '2012-10-17'; 
          policyDocument.Statement = [];
          var statementOne = {};
          statementOne.Action = 'execute-api:Invoke'; 
          statementOne.Effect = effect;
          statementOne.Resource = resource;
          policyDocument.Statement[0] = statementOne;
          authResponse.policyDocument = policyDocument;
      }
      
      return authResponse;
  }
  
  async function readToken() {
      const secret_name = process.env.TelegramBotApiSecretToken || "TelegramBotApiSecretToken";
      
      const client = new SecretsManagerClient({
        region: process.env.AWS_REGION,
      });
      
      let response;
      
      try {
        response = await client.send(
          new GetSecretValueCommand({
            SecretId: secret_name,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
          })
        );
      } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
      }
      const secret = response.SecretString;
    //   console.log({ secret })
      return JSON.parse(secret).TelegramBotApiSecretToken;
  }
  
  
  
  