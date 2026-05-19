import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface DatabaseStackProps extends cdk.StackProps {
  projectName: string;
  vpc: ec2.Vpc;
  rdsSecurityGroup: ec2.SecurityGroup;
}

export class DatabaseStack extends cdk.Stack {
  public readonly instance: rds.DatabaseInstance;
  public readonly secret: secretsmanager.Secret;
  public readonly dbHost: string;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const dbName = 'ecommerce_db';

    this.secret = new secretsmanager.Secret(this, 'DbSecret', {
      secretName: `${props.projectName}-db-secret`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'ecommerce_user',
          dbname: dbName,
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
        passwordLength: 24,
      },
    });

    this.instance = new rds.DatabaseInstance(this, 'PostgresInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_4,
      }),
      credentials: rds.Credentials.fromSecret(this.secret),
      instanceIdentifier: `${props.projectName}-postgres`,
      databaseName: dbName,
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [props.rdsSecurityGroup],
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO,
      ),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      publiclyAccessible: false,
      backupRetention: cdk.Duration.days(1),
      preferredBackupWindow: '03:00-04:00',
      cloudwatchLogsExports: ['postgresql'],
      storageEncrypted: true,
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.dbHost = this.instance.dbInstanceEndpointAddress;

    new cdk.CfnOutput(this, 'DbEndpoint', { value: this.instance.dbInstanceEndpointAddress });
    new cdk.CfnOutput(this, 'DbPort', { value: this.instance.dbInstanceEndpointPort });
    new cdk.CfnOutput(this, 'DbSecretArn', { value: this.secret.secretArn });
  }
}
