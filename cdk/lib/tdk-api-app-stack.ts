import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { Cluster, ContainerImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { DeploymentConfig } from "../bin/cdk";

export class TdkApiAppStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, deploymentConfig: DeploymentConfig) {
    super(scope, id, props);
    
    const apiDockerImage = new DockerImageAsset(this, `${id}-docker-asset`, {
      directory: "../apps/api",
      exclude: [ ".env", ".env.example" ]
    });

    const cluster = new Cluster(this, `${id}-cluster`, {
      vpc: new Vpc(this, `${id}-vpc`, {
        maxAzs: 2,
      }),
    });

    const service = new ApplicationLoadBalancedFargateService(
      this,
      `${id}-alb-fargate`,
      {
        cluster,
        cpu: 512,
        desiredCount: 2,
        taskImageOptions: {
          image: ContainerImage.fromEcrRepository(apiDockerImage.repository),
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
          deploymentConfig.TdkApiCertificateArn,
        ),
      },
    );

    service.targetGroup.configureHealthCheck({
      path: "/healthcheck",
    });

    // OUTPUTS
    new CfnOutput(this, `${id}-alb-dnsname`, {
      exportName: `${id}-alb-dnsname`,
      value: service.loadBalancer.loadBalancerDnsName,
      description: "ALB's DNS name"
    });
  }
}
