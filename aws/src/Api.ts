import { Stack, StackProps } from "aws-cdk-lib";
import {
    aws_apigateway as apigw,
    aws_lambda as lambda,
    aws_dynamodb as dynamodb,
    aws_logs as logs,
    aws_ssm as ssm,
    aws_cognito as cognito,
    RemovalPolicy,
    Size,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { ConstantsType, ParamsType } from "../constants";
import { join } from "path";

export interface ApiStackProps extends StackProps {
    constants: ConstantsType;
    params: ParamsType;
}

export class ApiStack extends Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // SSM parameters
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const tableName = ssm.StringParameter.fromStringParameterAttributes(this, `${props.constants.APP_NAME}-TableName`, {
            parameterName: props.params.TABLE_NAME,
        });

        const commonLayerArn = ssm.StringParameter.fromStringParameterAttributes(this, `${props.constants.APP_NAME}-CommonLayerArn`, {
            parameterName: props.params.COMMON_LAYER_ARN,
        });

        const powertoolsLayerArn = ssm.StringParameter.fromStringParameterAttributes(this, `${props.constants.APP_NAME}-PowertoolsLayerArn`, {
            parameterName: props.constants.SSM_POWERTOOLS_LAYER,
        });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // DynamoDB table
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const table = dynamodb.Table.fromTableAttributes(this, "Table", {
            tableName: tableName.stringValue,
            localIndexes: ["byItemHash", "byTop"],
            grantIndexPermissions: true,
        });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Lambda handler
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const commonLayer = lambda.LayerVersion.fromLayerVersionArn(
            this,
            `${props.constants.APP_NAME}-CommonLayer`,
            commonLayerArn.stringValue,
        );

        const powertoolsLayer = lambda.LayerVersion.fromLayerVersionArn(
            this,
            `${props.constants.APP_NAME}-PowertoolsLayer`,
            powertoolsLayerArn.stringValue,
        );

        const apiFn = new lambda.Function(this, `${props.constants.APP_NAME}-ApiHandler`, {
            functionName: `${props.constants.APP_NAME}-ApiHandler`,
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: "app.handler",
            code: lambda.Code.fromAsset(join(__dirname, "fn/api")),
            layers: [commonLayer, powertoolsLayer],
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        table.grantReadWriteData(apiFn);

        new logs.LogGroup(this, `${props.constants.APP_NAME}-ApiHandlerLogGroup`, {
            logGroupName: `/aws/lambda/${apiFn.functionName}`,
            removalPolicy: RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.TWO_WEEKS,
        });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Cognito Authentication
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const userPool = new cognito.UserPool(this, `${props.constants.APP_NAME}-UserPool`, {
            userPoolName: `${props.constants.APP_NAME}-UserPool`,
            signInAliases: { email: true },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: false,
                },
                givenName: {
                    required: true,
                    mutable: true,
                },
                familyName: {
                    required: true,
                    mutable: true,
                },
            },
            mfa: cognito.Mfa.OFF,
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            selfSignUpEnabled: true,
            autoVerify: { email: true },
            email: cognito.UserPoolEmail.withCognito(),
            userVerification: { emailStyle: cognito.VerificationEmailStyle.LINK },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const userPoolClient = new cognito.UserPoolClient(this, `${props.constants.APP_NAME}-AppClient`, {
            userPool: userPool,
            userPoolClientName: `${props.constants.APP_NAME}-AppClient`,
            generateSecret: false, // Auth handled at client side. For secure app, we need to enable this so that we can authenticate in server
            authFlows: {
                userSrp: true, // Includes refresh tokens. No need to define explicitly
                userPassword: true,
                custom: true, // In case we need to add any auth challenge for secure app
            },
        });

        userPool.addDomain(`${props.constants.APP_NAME}-UserPoolDomain`, {
            cognitoDomain: {
                domainPrefix: userPoolClient.userPoolClientId,
            },
        });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // API Gateway
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, `${props.constants.APP_NAME}-Authorizer`, {
            authorizerName: `${props.constants.APP_NAME}-Authorizer`,
            cognitoUserPools: [userPool],
        });

        const api = new apigw.LambdaRestApi(this, `${props.constants.APP_NAME}-Api`, {
            restApiName: `${props.constants.APP_NAME}-Api`,
            handler: apiFn,
            proxy: true,
            deployOptions: {
                stageName: "v1",
            },
            defaultMethodOptions: {
                authorizer: authorizer,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: ["*"], // TODO: Change to the mobile app URL
                allowMethods: apigw.Cors.ALL_METHODS,
                allowHeaders: ["*", "Authorization"],
            },
            endpointTypes: [apigw.EndpointType.REGIONAL],
            minCompressionSize: Size.bytes(0),
        });
    }
}
