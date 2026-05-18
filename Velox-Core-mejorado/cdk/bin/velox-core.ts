#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { StorageStack } from '../lib/storage-stack';
import { DatabaseStack } from '../lib/database-stack';
import { ComputeStack } from '../lib/compute-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

const projectName = 'velox-core';

const network = new NetworkStack(app, `${projectName}-network`, {
  env,
  projectName,
});

const storage = new StorageStack(app, `${projectName}-storage`, {
  env,
  projectName,
});

const database = new DatabaseStack(app, `${projectName}-database`, {
  env,
  projectName,
  vpc: network.vpc,
  rdsSecurityGroup: network.rdsSecurityGroup,
});

new ComputeStack(app, `${projectName}-compute`, {
  env,
  projectName,
  vpc: network.vpc,
  albSecurityGroup: network.albSecurityGroup,
  ec2SecurityGroup: network.ec2SecurityGroup,
  database,
  imagesBucket: storage.imagesBucket,
  ec2Role: storage.ec2Role,
});

database.secret.grantRead(storage.ec2Role);

app.synth();
