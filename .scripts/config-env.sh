#!/bin/bash

PROJECT_NAME=$(cat config.json | jq -r '.PROJECT_NAME' | tr -d ' ')
DOMAIN_NAME=$(cat config.json | jq -r '.DOMAIN_NAME' | tr -d ' ')

ACCOUNT_ID=$(aws sts get-caller-identity --query ["Account"] --output text)
REGION=$(aws configure get region)

if [ -z "$ACCOUNT_ID" ]; then
    echo "Error: Failed to get AWS account ID"
    exit 1
fi

if [ -z "$REGION" ]; then
    echo "Error: Failed to get AWS region"
    exit 1
fi

# Compute the MD5 hash of the project name
BUCKET_NAME="$(echo -n $PROJECT_NAME | md5sum | cut -d ' ' -f 1)-$(echo $PROJECT_NAME | tr '[:upper:]' '[:lower:]')"

# Get the API gateway ID for the specific project
apiGwId=$(aws apigateway get-rest-apis --query "items[?name=='${PROJECT_NAME}-Api'].id" --output text)

# Check if custom api domain is configured
customDomain=$(aws apigateway get-domain-names --query "items[?domainName=='api.${DOMAIN_NAME}'].domainName" --output text)

# Determine the API URL
if [ -n "$customDomain" ]; then
    API_URL="https://api.${DOMAIN_NAME}"
    echo "Using custom domain: $API_URL"
elif [ -n "$apiGwId" ]; then
    API_URL="https://$apiGwId.execute-api.$REGION.amazonaws.com/v1"
    echo "Using API Gateway URL: $API_URL"
else
    echo "No API Gateway ID found"
fi


# Get the user pool id
USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 50 --query "UserPools[?Name=='${PROJECT_NAME}-UserPool'].Id" --output text)
APP_CLIENT_ID=$(aws cognito-idp list-user-pool-clients --user-pool-id "$USER_POOL_ID" --query "UserPoolClients[*].[ClientId]" --output text)
# appClientSecret=$(aws cognito-idp describe-user-pool-client --user-pool-id "$userPoolId" --client-id "$appClientId" --query "UserPoolClient.ClientSecret" --output text)



echo "PUBLIC_BUCKET_NAME=$BUCKET_NAME" > .env.aws.local
echo "PUBLIC_API_ENDPOINT=$API_URL" >> .env.aws.local

echo "PUBLIC_USER_POOL_ID=${USER_POOL_ID}" > .env.web.local
echo "PUBLIC_APP_CLIENT_ID=${APP_CLIENT_ID}" >> .env.web.local

echo "SECRET_CDK_AWS_ACCOUNT=$ACCOUNT_ID" > .env.cdk.local
echo "PUBLIC_CDK_AWS_REGION=$REGION" >> .env.cdk.local

echo "Setting environment variables in the mise environment"
mise set

# Set the environment variables in the mobile app
echo "Setting environment variables in the mobile app"

echo "EXPO_PUBLIC_CDK_AWS_REGION=$REGION" > ./mobile/.env
echo "EXPO_PUBLIC_BUCKET_NAME=$BUCKET_NAME" >> ./mobile/.env
echo "EXPO_PUBLIC_API_ENDPOINT=$API_URL" >> ./mobile/.env
echo "EXPO_PUBLIC_APP_CLIENT_ID=$APP_CLIENT_ID" >> ./mobile/.env