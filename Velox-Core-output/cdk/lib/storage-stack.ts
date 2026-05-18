import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface StorageStackProps extends cdk.StackProps {
  projectName: string;
}

export class StorageStack extends cdk.Stack {
  public readonly imagesBucket: s3.Bucket;
  public readonly ec2Role: iam.Role;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    this.imagesBucket = new s3.Bucket(this, 'ImagesBucket', {
      bucketName: `${props.projectName}-images-${this.account}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          id: 'Expire old noncurrent versions',
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

    this.ec2Role = new iam.Role(this, 'Ec2Role', {
      roleName: `${props.projectName}-ec2-role`,
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    this.imagesBucket.grantReadWrite(this.ec2Role);

    new cdk.CfnOutput(this, 'ImagesBucketName', { value: this.imagesBucket.bucketName });
    new cdk.CfnOutput(this, 'ImagesBucketArn', { value: this.imagesBucket.bucketArn });
    new cdk.CfnOutput(this, 'Ec2RoleArn', { value: this.ec2Role.roleArn });
    new cdk.CfnOutput(this, 'Ec2RoleName', { value: this.ec2Role.roleName });
  }
}
