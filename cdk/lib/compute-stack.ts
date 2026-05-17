import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { DatabaseStack } from './database-stack';
import { Construct } from 'constructs';

interface ComputeStackProps extends cdk.StackProps {
  projectName: string;
  vpc: ec2.Vpc;
  albSecurityGroup: ec2.SecurityGroup;
  ec2SecurityGroup: ec2.SecurityGroup;
  database: DatabaseStack;
  imagesBucket: s3.Bucket;
  ec2Role: iam.Role;
}

export class ComputeStack extends cdk.Stack {
  public readonly alb: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'set -e',
      '',
      'SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id ' + props.database.secret.secretArn + ' --query SecretString --output text)',
      'DB_USER=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)[\'username\'])")',
      'DB_PASS=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)[\'password\'])")',
      'DB_HOST=' + props.database.dbHost,
      'DB_PORT=5432',
      'DB_NAME=ecommerce_db',
      '',
      'cat > /opt/velox-core/.env << EOF',
      `DATABASE_URL=postgresql://\${DB_USER}:\${DB_PASS}@\${DB_HOST}:\${DB_PORT}/\${DB_NAME}`,
      `S3_BUCKET_NAME=${props.imagesBucket.bucketName}`,
      'AWS_REGION=' + this.region,
      `FRONTEND_URL=https://velox-core.amplifyapp.com`,
      'EOF',
      '',
      'systemctl enable velox-core',
      'systemctl start velox-core',
    );

    const launchTemplate = new ec2.LaunchTemplate(this, 'LaunchTemplate', {
      launchTemplateName: `${props.projectName}-lt`,
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cachedInContext: true,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.SMALL,
      ),
      securityGroup: props.ec2SecurityGroup,
      role: props.ec2Role,
      userData,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(20, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true,
          }),
        },
      ],
      detailedMonitoring: true,
    });

    this.alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      loadBalancerName: `${props.projectName}-alb`,
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.albSecurityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      deletionProtection: true,
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      targetGroupName: `${props.projectName}-tg`,
      vpc: props.vpc,
      port: 8000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.INSTANCE,
      healthCheck: {
        path: '/',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: '200',
      },
    });

    this.alb.addListener('HttpListener', {
      port: 80,
      open: true,
      defaultTargetGroups: [targetGroup],
    });

    const asg = new autoscaling.AutoScalingGroup(this, 'Asg', {
      autoScalingGroupName: `${props.projectName}-asg`,
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      launchTemplate,
      minCapacity: 1,
      maxCapacity: 3,
      desiredCapacity: 1,
      healthCheck: autoscaling.HealthCheck.elb({
        grace: cdk.Duration.seconds(60),
      }),
      groupMetrics: [autoscaling.GroupMetrics.all()],
    });

    asg.attachToApplicationTargetGroup(targetGroup);

    asg.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      cooldown: cdk.Duration.seconds(60),
    });

    asg.scaleOnRequestCount('RequestScaling', {
      targetRequestsPerMinute: 1000,
      cooldown: cdk.Duration.seconds(60),
    });

    new cdk.CfnOutput(this, 'AlbDnsName', { value: this.alb.loadBalancerDnsName });
    new cdk.CfnOutput(this, 'AlbArn', { value: this.alb.loadBalancerArn });
    new cdk.CfnOutput(this, 'AsgName', { value: asg.autoScalingGroupName });
    new cdk.CfnOutput(this, 'LaunchTemplateId', { value: launchTemplate.launchTemplateId! });
  }
}
