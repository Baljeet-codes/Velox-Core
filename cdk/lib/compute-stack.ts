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
      '# ── Setup directories ──',
      'mkdir -p /opt/velox-core/app /opt/velox-core/static /opt/velox-core/alembic',
      '',
      '# ── Download app code ──',
      'curl -sL https://github.com/Baljeet-codes/Velox-Core/archive/main.tar.gz | tar xz --strip=1 -C /opt/velox-core/app app/main.py app/database.py app/models.py app/routers app/seed_admin.py app/schemas.py app/auth.py 2>/dev/null || true',
      'curl -s -o /opt/velox-core/app/main.py https://raw.githubusercontent.com/Baljeet-codes/Velox-Core/main/app/main.py || true',
      'curl -s -o /opt/velox-core/requirements.txt https://raw.githubusercontent.com/Baljeet-codes/Velox-Core/main/requirements.txt || true',
      '',
      '# ── Install Python dependencies ──',
      'pip3.12 install -r /opt/velox-core/requirements.txt -q 2>/dev/null || pip3 install -r /opt/velox-core/requirements.txt -q',
      '',
      '# ── Fetch DB credentials ──',
      'SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id ' + props.database.secret.secretArn + ' --query SecretString --output text)',
      'DB_USER=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)[\'username\'])")',
      'DB_PASS=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)[\'password\'])")',
      'DB_HOST=' + props.database.dbHost,
      'DB_PORT=5432',
      'DB_NAME=ecommerce_db',
      '',
      '# ── Create .env ──',
      'cat > /opt/velox-core/.env << EOF',
      `DATABASE_URL=postgresql://\${DB_USER}:\${DB_PASS}@\${DB_HOST}:\${DB_PORT}/\${DB_NAME}`,
      `S3_BUCKET_NAME=${props.imagesBucket.bucketName}`,
      'AWS_REGION=' + this.region,
      `FRONTEND_URL=https://velox-core.amplifyapp.com`,
      'EOF',
      '',
      '# ── Create systemd service ──',
      'cat > /etc/systemd/system/velox-core.service << SERVICEEOF',
      '[Unit]',
      'Description=Velox-Core FastAPI Backend',
      'After=network-online.target',
      'Wants=network-online.target',
      '',
      '[Service]',
      'Type=simple',
      'User=root',
      'WorkingDirectory=/opt/velox-core',
      'EnvironmentFile=/opt/velox-core/.env',
      'ExecStart=python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4',
      'Restart=always',
      'RestartSec=5',
      '',
      '[Install]',
      'WantedBy=multi-user.target',
      'SERVICEEOF',
      '',
      '# ── Run migrations ──',
      'pip3 show alembic >/dev/null 2>&1 && curl -s -o /opt/velox-core/alembic.ini https://raw.githubusercontent.com/Baljeet-codes/Velox-Core/main/alembic.ini || true',
      'curl -sL https://github.com/Baljeet-codes/Velox-Core/archive/main.tar.gz | tar xz --strip=2 -C /opt/velox-core/alembic Velox-Core-main/alembic/ 2>/dev/null || true',
      'cd /opt/velox-core && alembic upgrade head 2>/dev/null || true',
      '',
      '# ── Start service ──',
      'systemctl daemon-reload',
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
