import type { StackProps as CdkStackProps } from "aws-cdk-lib";
import { CfnOutput, Stack } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { Cluster, ContainerImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

import type { DeploymentParameters } from "../bin/cdk";

interface StackProps extends CdkStackProps {
  vpc: Vpc;
}

export class TdkApiAppStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps,
    parameters: DeploymentParameters,
  ) {
    super(scope, id, props);

    const { treasureDotLolCertificateId, apiEnvSecretId, apiTasksCount } =
      parameters;

    const apiDockerImage = new DockerImageAsset(this, `${id}-docker-asset`, {
      assetName: `${id}-docker-asset`,
      directory: "../", // context as repo root dir
      file: "./apps/api/Dockerfile",
      cacheDisabled: true,
      exclude: [".env", ".env.example", "cdk*", "cdk-out"], // ignore output to prevent recursion bug
    });

    // Should use shared VPC but getting error:
    // ResourceInitializationError: unable to pull secrets or registry auth: execution resource retrieval failed: unable to retrieve ecr registry auth: service call has been retried 3 time(s):
    // RequestError: send request failed caused by: Post "https://api.ecr.us-west-2.amazonaws.com/": dial tcp 34.223.27.162:443: i/o timeout. Please check your task network configuration.
    const cluster = new Cluster(this, "cluster", {
      vpc: new Vpc(this, "vpc", {
        maxAzs: 2,
      }),
    });

    const service = new ApplicationLoadBalancedFargateService(
      this,
      `${id}-alb-fargate`,
      {
        cluster,
        publicLoadBalancer: true,
        cpu: 512,
        memoryLimitMiB: 2048,
        desiredCount: apiTasksCount,
        taskImageOptions: {
          image: ContainerImage.fromDockerImageAsset(apiDockerImage),
          containerPort: 8080,
          taskRole: new Role(this, `${id}-ecs-task`, {
            assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
            inlinePolicies: {
              GetSecretsPolicy: new PolicyDocument({
                statements: [
                  new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: ["secretsmanager:GetSecretValue"],
                    resources: [
                      `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${apiEnvSecretId}`,
                    ],
                  }),
                ],
              }),
            },
          }),
        },
        certificate: Certificate.fromCertificateArn(
          this,
          `${id}-cert`,
          `arn:aws:acm:${this.region}:${this.account}:certificate/${treasureDotLolCertificateId}`,
        ),
      },
    );

    service.targetGroup.configureHealthCheck({
      path: "/healthcheck",
    });

    // OUTPUTS
    new CfnOutput(this, `${id}-ecr-repo-uri`, {
      exportName: `${id}-ecr-repo-uri`,
      value: apiDockerImage.repository.repositoryUri,
      description: "ECR repo URI",
    });

    new CfnOutput(this, `${id}-ecr-repo-arn`, {
      exportName: `${id}-ecr-repo-arn`,
      value: apiDockerImage.repository.repositoryArn,
      description: "ECR repo ARN",
    });

    new CfnOutput(this, `${id}-ecr-repo-name`, {
      exportName: `${id}-ecr-repo-name`,
      value: apiDockerImage.repository.repositoryName,
      description: "ECR repo name",
    });

    new CfnOutput(this, `${id}-alb-dnsname`, {
      exportName: `${id}-alb-dnsname`,
      value: service.loadBalancer.loadBalancerDnsName,
      description: "ALB's DNS name",
    });
  }
}
