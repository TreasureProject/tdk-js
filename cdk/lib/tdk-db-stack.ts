import {
  type StackProps as CdkStackProps,
  CfnOutput,
  Stack,
} from "aws-cdk-lib";
import type { Vpc } from "aws-cdk-lib/aws-ec2";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
} from "aws-cdk-lib/aws-ec2";
import {
  AuroraPostgresEngineVersion,
  ClusterInstance,
  Credentials,
  DatabaseCluster,
  DatabaseClusterEngine,
} from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";

import type { DeploymentParameters } from "../bin/cdk";

interface StackProps extends CdkStackProps {
  vpc: Vpc;
}

const PORT = 5432;
const IDENTIFIER = "noumena-tdk-db";

export class TdkDbStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps,
    parameters: DeploymentParameters,
  ) {
    super(scope, id, props);

    const { vpc } = props;

    const secret = new Secret(this, `${id}-secret`, {
      secretName: parameters.dbSecretName,
      description: "TDK DB master user credentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "postgres" }),
        generateStringKey: "password",
        passwordLength: 16,
        excludePunctuation: true,
      },
    });

    // Create security group
    const dbSg = new SecurityGroup(this, `${id}-securitygroup`, { vpc });

    // Add inbound rule to security group for VPC
    dbSg.addIngressRule(
      Peer.ipv4(vpc.vpcCidrBlock),
      Port.tcp(PORT),
      `Allow port ${PORT} for database connection from only within the VPC (${vpc.vpcId})`,
    );

    const cluster = new DatabaseCluster(this, `${id}-cluster`, {
      vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_15_5,
      }),
      writer: ClusterInstance.provisioned(`${id}-writer`, {
        instanceIdentifier: `${IDENTIFIER}-writer`,
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE),
      }),
      port: PORT,
      securityGroups: [dbSg],
      defaultDatabaseName: "noumenatdkdb",
      clusterIdentifier: IDENTIFIER,
      credentials: Credentials.fromSecret(secret),
    });

    // OUTPUTS
    new CfnOutput(this, `${id}-DbCluster-Hostname`, {
      exportName: `${id}-DbCluster-Hostname`,
      value: cluster.clusterEndpoint.hostname,
      description: "DB cluster endpoint",
    });
  }
}
