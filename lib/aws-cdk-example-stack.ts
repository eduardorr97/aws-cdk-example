import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import cwlogs = require('@aws-cdk/aws-cloudwatch');
import { App, CfnOutput, Stack, StackProps, RemovalPolicy } from '@aws-cdk/core';

export class AwsCdkExampleStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    const gatewaysTable = new dynamodb.Table(this, 'gateways', {
      partitionKey: {
        name: 'serial',
        type: dynamodb.AttributeType.STRING
      },
      tableName: 'gateways'
    });
    const peripheralsTable = new dynamodb.Table(this, 'peripherals', {
      partitionKey: {
        name: 'uid',
        type: dynamodb.AttributeType.STRING
      },
      tableName: 'peripherals'
    });

    /**
     * Lambdas defined individually, each handler is in individual file
     */
    const gatewayLambda = new lambda.Function(this, 'gatewayLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda-fns/gateway'),
      handler: 'index.handler',
      environment: {
        TABLE_NAME: gatewaysTable.tableName,
        PRIMARY_KEY: 'serial'
      }
    });
    gatewaysTable.grantReadWriteData(gatewayLambda);

    const peripheralLambda = new lambda.Function(this, 'peripheralLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda-fns/peripheral'),
      handler: 'index.handler', 
      environment: {
        TABLE_NAME: peripheralsTable.tableName,
        PRIMARY_KEY: 'uid'
      }
    });
    peripheralsTable.grantReadWriteData(peripheralLambda);

    /**
     * Routes defined individually on API Gateway
     */
    const apiGateway = new apigw.RestApi(this, 'devices-api', {
      deployOptions: {
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        dataTraceEnabled: true
      }
    });

    const gatewayMethod = apiGateway.root.resourceForPath('gateway').addMethod('ANY', new apigw.LambdaIntegration(gatewayLambda), {
      authorizationType: apigw.AuthorizationType.COGNITO,
      authorizationScopes: ['Scope1', 'Scope2'],
      apiKeyRequired: true
    });

    const peripheral = apiGateway.root.resourceForPath('peripheral').addMethod('ANY', new apigw.LambdaIntegration(peripheralLambda), {
      authorizationType: apigw.AuthorizationType.COGNITO,
      authorizationScopes: ['Scope1', 'Scope2'],
      apiKeyRequired: true
    });

    const deployment = new apigw.Deployment(this, 'Deployment', { api: apiGateway });
    deployment.node.addDependency(gatewayMethod)
    deployment.node.addDependency(peripheral)

    // development stage
    const devLogGroup = new cwlogs.LogGroup(this, "DevLogs");
    new apigw.Stage(this, 'dev', {
      deployment,
      accessLogDestination: new apigw.LogGroupLogDestination(devLogGroup),
      accessLogFormat: apigw.AccessLogFormat.jsonWithStandardFields({
        caller: false,
        httpMethod: true,
        ip: true,
        protocol: true,
        requestTime: true,
        resourcePath: true,
        responseLength: true,
        status: true,
        user: true
      })
    });

    new CfnOutput(this, 'GatewaysURL', {
      value: `https://${apiGateway.restApiId}.execute-api.${this.region}.amazonaws.com/dev/gateway`,
    });

    new CfnOutput(this, 'PeripheralsURL', {
      value: `https://${apiGateway.restApiId}.execute-api.${this.region}.amazonaws.com/dev/peripheral`,
    });
  }
}

new AwsCdkExampleStack(new App(), 'AwsCdkExampleStack');
