#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as fs from "fs"
import * as path from "path";
import { Tags } from "aws-cdk-lib";
import { TdkVpcStack } from "../lib/tdk-vpc-stack";
import { TdkDbStack } from "../lib/tdk-db-stack";
import { TdkGithubOidcStack } from "../lib/tdk-github-oidc-stack";
import { TdkApiAppStack } from "../lib/tdk-api-app-stack";

const yaml = require("js-yaml");

export interface DeploymentConfig
{
	// project, deployment, etc
	readonly App: string;
	readonly Environment: string;
	readonly Version: string;

	// aws account
	readonly AWSAccountID: string;
	readonly AWSRegion: string;

	// domain
  readonly TreasureDotLolCertificateArn: string;

  // secrets
  readonly TdkApiEnvSecretArn: string;

  //misc
  readonly GithubOIDCProviderArn: string;
  readonly TdkApiAppRepoArn: string;
}

function ensureString(object: { [name: string]: any }, propName: string ): string
{
  if(!object[propName] || object[propName].trim().length === 0)
    throw new Error(`${propName} does not exist or is empty`);
  return object[propName];
}

const app = new cdk.App();

function getConfig()
{
  let env = app.node.tryGetContext("env");
  if (!env) {
    console.log("no -c env=XXX parameter supplied - defaulting to dev enviroment");
    throw new Error("No env parameter found in context. Please specify the environment to deploy to!");
  }
  console.log("Using env:", env);

  let unparsedEnv = yaml.load(fs.readFileSync(path.resolve(`./config/${env}.yaml`), "utf8"));
  console.log("using env config:", unparsedEnv);

  let deploymentConfig: DeploymentConfig = {
    App: ensureString(unparsedEnv, "App"),
    Environment: ensureString(unparsedEnv, "Environment"),
    Version: ensureString(unparsedEnv, "Version"),

    AWSAccountID: ensureString(unparsedEnv, "AWSAccountID"),
    AWSRegion: ensureString(unparsedEnv, "AWSRegion"),

    TreasureDotLolCertificateArn:  ensureString(unparsedEnv, "TreasureDotLolCertificateArn"),

    TdkApiEnvSecretArn: ensureString(unparsedEnv, "TdkApiEnvSecretArn"),

    GithubOIDCProviderArn: ensureString(unparsedEnv, "GithubOIDCProviderArn"),

    TdkApiAppRepoArn: ensureString(unparsedEnv, "TdkApiAppRepoArn"),
  };

  return deploymentConfig;
}

async function Main()
{
  let deploymentConfig: DeploymentConfig = getConfig();

  Tags.of(app).add("app", deploymentConfig.App);
  Tags.of(app).add("environment", deploymentConfig.Environment);

  // GITHUB OIDC
  const tdkGithubOidcStack = new TdkGithubOidcStack(app, `${deploymentConfig.App}-${deploymentConfig.Environment}-githuboidc`, {
    env: {
      account: deploymentConfig.AWSAccountID,
      region: deploymentConfig.AWSRegion
    },
    description: `${deploymentConfig.App}-${deploymentConfig.Environment} TDK Github OIDC Stack`,
  }, deploymentConfig);
  Tags.of(tdkGithubOidcStack).add("stack", "github-oidc");

  // VPC
  const tdkVpcStack = new TdkVpcStack(app, `${deploymentConfig.App}-${deploymentConfig.Environment}-tdkvpc`, {
    env: {
      account: deploymentConfig.AWSAccountID,
      region: deploymentConfig.AWSRegion
    },
    description: `${deploymentConfig.App}-${deploymentConfig.Environment} VPCs for all TDK stacks`,
  });
  Tags.of(tdkVpcStack).add("stack", "tdk-vpc");

  // DB
  const tdkDbStack = new TdkDbStack(app, `${deploymentConfig.App}-${deploymentConfig.Environment}-tdkdb`, {
    env: {
      account: deploymentConfig.AWSAccountID,
      region: deploymentConfig.AWSRegion
    },
    description: `${deploymentConfig.App}-${deploymentConfig.Environment} TDK Db Stack`,
    vpc: tdkVpcStack.vpc
  });
  Tags.of(tdkDbStack).add("stack", "tdk-db");

  // API APP
  const tdkApiAppStack = new TdkApiAppStack(app, `${deploymentConfig.App}-${deploymentConfig.Environment}-apiapp`, {
    env: {
      account: deploymentConfig.AWSAccountID,
      region: deploymentConfig.AWSRegion
    },
    description: `${deploymentConfig.App}-${deploymentConfig.Environment} TDK API App`,
  }, deploymentConfig);
  Tags.of(tdkApiAppStack).add("stack", "tdk-api-app");

  // ==============================================================================
  // OUTPUTS :: exportName should be unique per env and cannot contain underscore
  // ==============================================================================
  // iterate over deploymentConfig and produce outputs
  for (const configKey in deploymentConfig) {
    new cdk.CfnOutput(tdkGithubOidcStack, `${deploymentConfig.App}-${deploymentConfig.Environment}-deploymentConfig-${configKey}`, {
      exportName: `${deploymentConfig.App}-${deploymentConfig.Environment}-deploymentConfig-${configKey}`,
      value: deploymentConfig[configKey as keyof DeploymentConfig] as string,
      description: `Deploymentconfig ${configKey} value`,
    });
  }
}

Main();
