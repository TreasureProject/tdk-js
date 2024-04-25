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

interface StackProps extends CdkStackProps {
  vpc: Vpc;
}

export class TdkDbStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const { vpc } = props;
    const port = 5432;

    const dbSecret = new Secret(this, `${id}-DbSecret`, {
      secretName: "noumena-tdk-db",
      description: "TDK DB master user credentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "postgres" }),
        generateStringKey: "password",
        passwordLength: 16,
        excludePunctuation: true,
      },
    });

    // Create security group
    const dbSg = new SecurityGroup(this, `${id}-SecurityGroup`, { vpc });

    // Add inbound rule to security group for VPC
    dbSg.addIngressRule(
      Peer.ipv4(vpc.vpcCidrBlock),
      Port.tcp(port),
      `Allow port ${port} for database connection from only within the VPC (${vpc.vpcId})`,
    );

    const dbCluster = new DatabaseCluster(this, `${id}-DbCluster`, {
      vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_15_5,
      }),
      writer: ClusterInstance.provisioned("noumena-tdk-db-writer", {
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MEDIUM),
      }),
      port,
      securityGroups: [dbSg],
      defaultDatabaseName: "noumenatdkdb",
      credentials: Credentials.fromSecret(dbSecret),
    });

    // OUTPUTS
    new CfnOutput(this, `${id}-DbCluster-Hostname`, {
      exportName: `${id}-DbCluster-Hostname`,
      value: dbCluster.clusterEndpoint.hostname,
      description: "Cluster endpoint",
    });
  }
}
