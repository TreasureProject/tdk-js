import * as cdk from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import type * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
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
        },
        memoryLimitMiB: 2048,
        publicLoadBalancer: true,
        certificate: Certificate.fromCertificateArn(
          this,
          "CertificateImported",
          "arn:aws:acm:us-west-2:665230337498:certificate/48316235-afa5-4ad7-91e1-b429f1da54e2",
        ),
      },
    );

    service.targetGroup.configureHealthCheck({
      path: "/healthcheck",
    });
  }
}
