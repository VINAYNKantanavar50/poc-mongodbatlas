

import * as cdk from 'aws-cdk-lib';
import { MyOpenSearchCdkStack } from '../lib/arc-ecs-2-stack';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';

const app = new cdk.App();

const vpcId = app.node.tryGetContext('vpcId') || 'vpc-0195c9a12062a9207';  // Replace with your VPC ID
const subnetIds = app.node.tryGetContext('subnetIds') || [
  'subnet-0c1f02a936011b818',
  'subnet-06c30bbdf70f3b4ce',
  'subnet-0c3c3cd0a897b0153'
];  // Replace with your subnet IDs

new MyOpenSearchCdkStack(app, 'MyOpenSearchCdkStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  vpcId: vpcId,
  subnetIds: subnetIds,
  domainName: app.node.tryGetContext('domainName') || 'my-opensearch-domain-vnk',
  engineVersion: opensearch.EngineVersion.OPENSEARCH_1_3,
  instanceType: 'm6g.large.search',
  instanceCount: 3,
  volumeSize: 10,
  zoneAwarenessEnabled: true,
  dedicatedMasterType: 'm6g.large.search',
  dedicatedMasterCount: 3,
  availabilityZoneCount: 3,
  masterUserName: 'admin',
});

