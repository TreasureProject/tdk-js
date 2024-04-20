import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";
import { Repository } from "aws-cdk-lib/aws-ecr";
import {
  Effect,
  OpenIdConnectPrincipal,
  OpenIdConnectProvider,
  PolicyDocument,
  PolicyStatement,
  Role
} from "aws-cdk-lib/aws-iam";
import { DeploymentConfig } from "../bin/cdk";

export class TdkGithubOidcStack extends Stack {
  public readonly repo: Repository;

  constructor(scope: Construct, id: string, props: StackProps, deploymentConfig: DeploymentConfig) {
    super(scope, id, props);

    this.repo = new Repository(this, `${id}-repo`);

    const githubProvider = OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      `${id}-github-iodc`,
      deploymentConfig.GithubOIDCProviderArn
    );

    // const githubProvider = new iam.OpenIdConnectProvider(
    //   this,
    //   `${id}-github`,
    //   {
    //     url: "https://token.actions.githubusercontent.com",
    //     clientIds: ["sts.amazonaws.com"],
    //   },
    // );

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

    new CfnOutput(this, `${id}-repository-uri`, {
      exportName: `${id}-repository-uri`,
      value: this.repo.repositoryUri,
      description: "Repository Uri"
    });

    new CfnOutput(this, `${id}-github-actions-role-arn`, {
      exportName: `${id}-github-actions-role-arn`,
      value: githubActionsRole.roleArn,
      description: "Github actions role ARN"
    });
  }
}
