#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Tags } from "aws-cdk-lib";
import "source-map-support/register";

import { TdkApiAppStack } from "../lib/tdk-api-app-stack";
import { TdkDbStack } from "../lib/tdk-db-stack";
import { TdkGithubOidcStack } from "../lib/tdk-github-oidc-stack";
import { TdkVpcStack } from "../lib/tdk-vpc-stack";

interface DeploymentConfig {
  readonly app: string;
  readonly environment: string;
  readonly awsAccountId: string;
  readonly awsRegion: string;
  readonly parameters: {
    // IAM
    readonly githubOidcProviderId: string | undefined;

    // Domains
    readonly treasureDotLolCertificateId: string;

    // VPC
    readonly vpcMaxAzs: number;

    // DB
    readonly dbSecretName: string;

    // API app
    readonly apiEnvSecretName: string;
    readonly apiTasksCount: number;
  };
}

export interface TdkStackProps extends cdk.StackProps {
  config: DeploymentConfig;
}

export const ensureString = (
  object: { [name: string]: string },
  propName: string,
) => {
  if (!object[propName] || object[propName].trim().length === 0) {
    throw new Error(`${propName} does not exist or is empty`);
  }

  return object[propName];
};

const app = new cdk.App();

export const getConfig = (): DeploymentConfig => {
  const env = app.node.tryGetContext("env");
  if (!env) {
    throw new Error(
      "No env parameter found in context. Please specify the environment using -c env=XXX",
    );
  }

  const rawConfig = app.node.tryGetContext(env);
  console.log(`Using ${env} environment variables:`, rawConfig);
  const rawParameters = rawConfig.parameters;

  return {
    app: ensureString(rawConfig, "app"),
    environment: ensureString(rawConfig, "environment"),
    awsAccountId: ensureString(rawConfig, "awsAccountId"),
    awsRegion: ensureString(rawConfig, "awsRegion"),
    parameters: {
      githubOidcProviderId: rawParameters.githubOidcProviderId,
      treasureDotLolCertificateId: ensureString(
        rawParameters,
        "treasureDotLolCertificateId",
      ),
      vpcMaxAzs: rawParameters.vpcMaxAzs ?? 2,
      dbSecretName: ensureString(rawParameters, "dbSecretName"),
      apiEnvSecretName: ensureString(rawParameters, "apiEnvSecretName"),
      apiTasksCount: rawParameters.apiTasksCount ?? 2,
    },
  };
};

(async () => {
  const config = getConfig();
  const { app: appName, environment, awsAccountId, awsRegion } = config;

  const prefix = `${appName}-${environment}`;
  const awsEnv = {
    account: awsAccountId,
    region: awsRegion,
  };

  Tags.of(app).add("app", appName);
  Tags.of(app).add("environment", environment);

  // GITHUB OIDC
  const tdkGithubOidcStack = new TdkGithubOidcStack(
    app,
    `${prefix}-github-oidc`,
    {
      env: awsEnv,
      description: `${prefix} TDK Github OIDC Stack`,
      config,
    },
  );
  Tags.of(tdkGithubOidcStack).add("stack", "tdk-github-oidc");

  // VPC
  const tdkVpcStack = new TdkVpcStack(app, `${prefix}-tdk-vpc`, {
    env: awsEnv,
    description: `${prefix} TDK VPCs`,
    config,
  });
  Tags.of(tdkVpcStack).add("stack", "tdk-vpc");

  // DB
  const tdkDbStack = new TdkDbStack(app, `${prefix}-tdk-db`, {
    env: awsEnv,
    description: `${prefix} TDK DB`,
    vpc: tdkVpcStack.vpc,
    config,
  });
  Tags.of(tdkDbStack).add("stack", "tdk-db");

  // API APP
  const tdkApiAppStack = new TdkApiAppStack(app, `${prefix}-tdk-api-app`, {
    env: awsEnv,
    description: `${prefix} TDK API app`,
    config,
    vpc: tdkVpcStack.vpc,
  });
  Tags.of(tdkApiAppStack).add("stack", "tdk-api-app");
})();
