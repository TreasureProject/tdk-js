import type { StackProps as CdkStackProps } from "aws-cdk-lib";
import { CfnOutput, Stack } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import type { Vpc } from "aws-cdk-lib/aws-ec2";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
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

import type { DeploymentConfig } from "../bin/cdk";

interface StackProps extends CdkStackProps {
  vpc: Vpc;
}

export class TdkApiAppStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps,
    config: DeploymentConfig,
  ) {
    super(scope, id, props);

    const {
      treasureDotLolCertificateId,
      dbSecretName,
      apiEnvSecretName,
      apiTasksCount,
    } = config.parameters;

    const apiDockerImage = new DockerImageAsset(this, `${id}-docker-asset`, {
      assetName: `${id}-docker-asset`,
      directory: "../", // context as repo root dir
      file: "./apps/api/Dockerfile",
      cacheDisabled: true,
    });

    const cluster = new Cluster(this, "cluster", {
      vpc: props.vpc,
    });

    const service = new ApplicationLoadBalancedFargateService(
      this,
      `${id}-alb-fargate`,
      {
        cluster,
        publicLoadBalancer: true,
        assignPublicIp: true,
        cpu: 512,
        memoryLimitMiB: 2048,
        desiredCount: apiTasksCount,
        taskSubnets: {
          subnetType: SubnetType.PUBLIC,
        },
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
                      `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${dbSecretName}-??????`,
                      `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${apiEnvSecretName}-??????`,
                    ],
                  }),
                ],
              }),
            },
          }),
          environment: {
            AWS_REGION: config.awsRegion,
            DATABASE_SECRET_NAME: dbSecretName,
            API_ENV_SECRET_NAME: apiEnvSecretName,
          },
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
