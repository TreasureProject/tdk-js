#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Tags } from "aws-cdk-lib";
import * as fs from "fs";
import yaml from "js-yaml";
import * as path from "path";
import "source-map-support/register";

import { TdkDbStack } from "../lib/tdk-db-stack";
import { TdkVpcStack } from "../lib/tdk-vpc-stack";

export interface DeploymentConfig {
  // project, deployment, etc
  readonly App: string;
  readonly Environment: string;
  readonly Version: string;

  // aws account
  readonly AWSAccountID: string;
  readonly AWSRegion: string;

  // domain
}

function ensureString(
  object: { [name: string]: string },
  propName: string,
): string {
  if (!object[propName] || object[propName].trim().length === 0)
    throw new Error(`${propName} does not exist or is empty`);
  return object[propName];
}

const app = new cdk.App();

function getConfig() {
  const env = app.node.tryGetContext("env");
  if (!env) {
    console.log(
      "no -c env=XXX parameter supplied - defaulting to dev enviroment",
    );
    throw new Error(
      "No env parameter found in context. Please specify the environment to deploy to!",
    );
  }
  console.log("Using env:", env);

  const unparsedEnv = yaml.load(
    fs.readFileSync(path.resolve(`./config/${env}.yaml`), "utf8"),
  );
  console.log("using env config:", unparsedEnv);

  const deploymentConfig: DeploymentConfig = {
    App: ensureString(unparsedEnv, "App"),
    Environment: ensureString(unparsedEnv, "Environment"),
    Version: ensureString(unparsedEnv, "Version"),

    AWSAccountID: ensureString(unparsedEnv, "AWSAccountID"),
    AWSRegion: ensureString(unparsedEnv, "AWSRegion"),
  };

  return deploymentConfig;
}

async function Main() {
  const deploymentConfig: DeploymentConfig = getConfig();

  Tags.of(app).add("app", deploymentConfig.App);
  Tags.of(app).add("environment", deploymentConfig.Environment);

  // VPC
  const vpcStack = new TdkVpcStack(
    app,
    `${deploymentConfig.App}-${deploymentConfig.Environment}-Tdk-Vpc`,
    {
      env: {
        account: deploymentConfig.AWSAccountID,
        region: deploymentConfig.AWSRegion,
      },
      description: `${deploymentConfig.App}-${deploymentConfig.Environment} VPCs for all TDK stacks`,
    },
  );
  Tags.of(vpcStack).add("stack", "tdk-vpc");

  // DB
  const dbStack = new TdkDbStack(
    app,
    `${deploymentConfig.App}-${deploymentConfig.Environment}-Tdk-Db`,
    {
      env: {
        account: deploymentConfig.AWSAccountID,
        region: deploymentConfig.AWSRegion,
      },
      description: `${deploymentConfig.App}-${deploymentConfig.Environment} TDK Db Stack`,
      vpc: vpcStack.vpc,
    },
  );
  Tags.of(dbStack).add("stack", "tdk-db");
}

Main();
