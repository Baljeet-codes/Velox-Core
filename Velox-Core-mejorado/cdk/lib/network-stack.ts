import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface NetworkStackProps extends cdk.StackProps {
  projectName: string;
}

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly albSecurityGroup: ec2.SecurityGroup;
  public readonly ec2SecurityGroup: ec2.SecurityGroup;
  public readonly rdsSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      vpcName: `${props.projectName}-vpc`,
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    this.albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSG', {
      vpc: this.vpc,
      securityGroupName: `${props.projectName}-alb-sg`,
      description: 'Security Group for Application Load Balancer',
      allowAllOutbound: true,
    });
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS from internet',
    );
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP redirect to HTTPS',
    );

    this.ec2SecurityGroup = new ec2.SecurityGroup(this, 'Ec2SG', {
      vpc: this.vpc,
      securityGroupName: `${props.projectName}-ec2-sg`,
      description: 'Security Group for EC2 instances (FastAPI)',
      allowAllOutbound: true,
    });
    this.ec2SecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(8000),
      'Allow traffic from ALB to FastAPI port 8000',
    );

    this.rdsSecurityGroup = new ec2.SecurityGroup(this, 'RdsSG', {
      vpc: this.vpc,
      securityGroupName: `${props.projectName}-rds-sg`,
      description: 'Security Group for Aurora PostgreSQL',
      allowAllOutbound: true,
    });
    this.rdsSecurityGroup.addIngressRule(
      this.ec2SecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from EC2',
    );

    new cdk.CfnOutput(this, 'VpcId', { value: this.vpc.vpcId });
    new cdk.CfnOutput(this, 'AlbSecurityGroupId', { value: this.albSecurityGroup.securityGroupId });
    new cdk.CfnOutput(this, 'Ec2SecurityGroupId', { value: this.ec2SecurityGroup.securityGroupId });
    new cdk.CfnOutput(this, 'RdsSecurityGroupId', { value: this.rdsSecurityGroup.securityGroupId });
  }
}
