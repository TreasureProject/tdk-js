import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

export class TdkEcrStack extends cdk.Stack {
  public readonly repo: ecr.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.repo = new ecr.Repository(this, "api");

    const githubProvider = new iam.OpenIdConnectProvider(
      this,
      "githubProvider",
      {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
      },
    );

    const githubPrincipal = new iam.OpenIdConnectPrincipal(
      githubProvider,
    ).withConditions({
      StringLike: {
        "token.actions.githubusercontent.com:sub":
          "repo:treasureproject/treasure.js:*",
      },
      StringEquals: {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      },
    });

    const githubActionsRole = new iam.Role(this, "githubActionsRole", {
      assumedBy: githubPrincipal,
      description: "Role assumed by GitHub Actions for deploying to stack",
      roleName: "tdk-github-actions-role",
      maxSessionDuration: cdk.Duration.hours(1),
      inlinePolicies: {
        EcrPushPolicy: new iam.PolicyDocument({
          assignSids: true,
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "ecr:CompleteLayerUpload",
                "ecr:GetAuthorizationToken",
                "ecr:UploadLayerPart",
                "ecr:InitiateLayerUpload",
                "ecr:BatchCheckLayerAvailability",
                "ecr:PutImage",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    new cdk.CfnOutput(this, "repositoryUri", {
      value: this.repo.repositoryUri,
    });

    new cdk.CfnOutput(this, "githubActionsRoleArn", {
      value: githubActionsRole.roleArn,
    });
  }
}
