import * as cdk from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import type * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

interface StackProps extends cdk.StackProps {
  ecrRepo: ecr.Repository;
}

export class TdkApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, "cluster", {
      vpc: new ec2.Vpc(this, "vpc", {
        maxAzs: 2,
      }),
    });

    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "service",
      {
        cluster,
        cpu: 512,
        desiredCount: 2,
        taskImageOptions: {
          image: ecs.ContainerImage.fromEcrRepository(props.ecrRepo),
          containerPort: 8080,
          taskRole: new iam.Role(this, "ecsTaskRole", {
            assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
            inlinePolicies: {
              GetSecretsPolicy: new iam.PolicyDocument({
                statements: [
                  new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ["secretsmanager:GetSecretValue"],
                    resources: [
                      `arn:aws:secretsmanager:${this.region}:${this.account}:secret:tdkApiEnv-M2Lsr7`,
                    ],
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
          "CertificateImported",
          `arn:aws:acm:${this.region}:${this.account}:certificate/48316235-afa5-4ad7-91e1-b429f1da54e2`,
        ),
      },
    );

    service.targetGroup.configureHealthCheck({
      path: "/healthcheck",
    });
  }
}
