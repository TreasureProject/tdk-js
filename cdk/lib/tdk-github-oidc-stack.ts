import type { StackProps } from "aws-cdk-lib";
import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import type { IOpenIdConnectProvider } from "aws-cdk-lib/aws-iam";
import {
  Effect,
  OpenIdConnectPrincipal,
  OpenIdConnectProvider,
  PolicyDocument,
  PolicyStatement,
  Role,
} from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

import type { DeploymentParameters } from "../bin/cdk";

export class TdkGithubOidcStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps,
    parameters: DeploymentParameters,
  ) {
    super(scope, id, props);

    let githubProvider: IOpenIdConnectProvider;
    if (parameters.githubOidcProviderId) {
      githubProvider = OpenIdConnectProvider.fromOpenIdConnectProviderArn(
        this,
        `${id}-github-oidc-provider`,
        `arn:aws:iam::${this.account}:oidc-provider/${parameters.githubOidcProviderId}`,
      );
    } else {
      githubProvider = new OpenIdConnectProvider(
        this,
        `${id}-github-oidc-provider`,
        {
          url: "https://token.actions.githubusercontent.com",
          clientIds: ["sts.amazonaws.com"],
        },
      );
    }

    const githubPrincipal = new OpenIdConnectPrincipal(
      githubProvider,
    ).withConditions({
      StringLike: {
        "token.actions.githubusercontent.com:sub":
          "repo:TreasureProject/tdk-js:*",
      },
      StringEquals: {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      },
    });

    const githubActionsRole = new Role(this, `${id}-github-actions`, {
      assumedBy: githubPrincipal,
      description: "Role assumed by GitHub Actions for deploying to stack",
      roleName: `${id}-github-actions`,
      maxSessionDuration: Duration.hours(1),
      inlinePolicies: {
        EcsDeployPolicy: new PolicyDocument({
          assignSids: true,
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                "ecr:CompleteLayerUpload",
                "ecr:GetAuthorizationToken",
                "ecr:UploadLayerPart",
                "ecr:InitiateLayerUpload",
                "ecr:BatchCheckLayerAvailability",
                "ecr:PutImage",
                "ecs:DescribeServices",
                "ecs:RegisterTaskDefinition",
                "ecs:UpdateService",
                "iam:PassRole",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    new CfnOutput(this, `${id}-github-actions-role-arn`, {
      exportName: `${id}-github-actions-role-arn`,
      value: githubActionsRole.roleArn,
      description: "GitHub Actions role ARN",
    });
  }
}
