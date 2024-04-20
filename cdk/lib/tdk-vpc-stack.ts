import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib";
import { SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import type { Construct } from "constructs";

export class TdkVpcStack extends Stack {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, `${id}-Vpc`, {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 20,
          name: "tdk-public-1",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 28,
          name: "tdk-isolated-1",
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    new CfnOutput(this, `${id}-vpc-id`, {
      exportName: `${id}-vpc-id`,
      value: this.vpc.vpcId,
      description: "VPC id"
    });
  }
}
