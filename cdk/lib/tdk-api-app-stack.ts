import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { Cluster, ContainerImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { DeploymentConfig } from "../bin/cdk";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

export class TdkApiAppStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, deploymentConfig: DeploymentConfig) {
    super(scope, id, props);

    const apiDockerImage = new DockerImageAsset(this, `${id}-docker-asset`, {
      assetName: `${id}-docker-asset`,
      directory: "../", // context as repo root dir
      file: "./apps/api/Dockerfile",
      cacheDisabled: true,
      exclude: [ ".env", ".env.example", "cdk*", "cdk-out" ] // ignore output to prevent recursion bug
    });

    const cluster = new Cluster(this, `${id}-cluster`, {
      vpc: new Vpc(this, `${id}-vpc`, {
        maxAzs: 2,
      }),
    });

    const secret = Secret.fromSecretCompleteArn(this, `${id}-secret`, deploymentConfig.TdkApiEnvSecretArn);

    const service = new ApplicationLoadBalancedFargateService(
      this,
      `${id}-alb-fargate`,
      {
        cluster,
        cpu: 512,
        desiredCount: 2,
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
                    resources: [ deploymentConfig.TdkApiEnvSecretArn ],
                  }),
                ],
              }),
            },
          }),
        },
        memoryLimitMiB: 2048,
        publicLoadBalancer: true,
        certificate: Certificate.fromCertificateArn(
          this,
          `${id}-cert`,
          deploymentConfig.TreasureDotLolCertificateArn,
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
      description: "ECR repo Uri"
    });

    new CfnOutput(this, `${id}-ecr-repo-arn`, {
      exportName: `${id}-ecr-repo-arn`,
      value: apiDockerImage.repository.repositoryArn,
      description: "ECR repo ARN"
    });

    new CfnOutput(this, `${id}-ecr-repo-name`, {
      exportName: `${id}-ecr-repo-name`,
      value: apiDockerImage.repository.repositoryName,
      description: "ECR repo name"
    });

    new CfnOutput(this, `${id}-alb-dnsname`, {
      exportName: `${id}-alb-dnsname`,
      value: service.loadBalancer.loadBalancerDnsName,
      description: "ALB's DNS name"
    });
  }
}
