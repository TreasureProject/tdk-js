#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";

import { TdkApiStack } from "../lib/tdk-api-stack";
import { TdkEcrStack } from "../lib/tdk-ecr-stack";

const app = new cdk.App();

const ecrStack = new TdkEcrStack(app, "tdk-ecr-stack");

new TdkApiStack(app, "tdk-api-stack", { ecrRepo: ecrStack.repo });
