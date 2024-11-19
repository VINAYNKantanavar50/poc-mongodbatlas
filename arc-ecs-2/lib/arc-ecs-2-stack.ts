import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface OpenSearchStackProps extends cdk.StackProps {
  vpcId: string;
  subnetIds: string[];
  domainName: string;
  engineVersion: opensearch.EngineVersion;
  instanceType: string;
  instanceCount: number;
  volumeSize: number;
  zoneAwarenessEnabled: boolean;
  dedicatedMasterType: string;
  dedicatedMasterCount: number;
  availabilityZoneCount: number;
  masterUserName: string;
}

export class MyOpenSearchCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: OpenSearchStackProps) {
    super(scope, id, props);

    // Create a secret for the master user password
    const masterUserSecret = new secretsmanager.Secret(this, 'OpenSearchMasterUserSecret', {
      secretName: `${props.domainName}-master-user`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: props.masterUserName }),
        generateStringKey: 'password',
        passwordLength: 16,
        excludePunctuation: false,
        requireEachIncludedType: true,
        includeSpace: false,
        excludeCharacters: ' "\'\\', // Exclude problematic characters
        // Ensure we include all required character types
        excludeNumbers: false,
        excludeUppercase: false,
        excludeLowercase: false,
      }
    });

    const vpc = ec2.Vpc.fromLookup(this, 'ImportedVpc', { vpcId: props.vpcId });

    const securityGroup = new ec2.SecurityGroup(this, 'OpenSearchSecurityGroup', {
      vpc,
      allowAllOutbound: true,
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS');

    const selectedSubnets = props.subnetIds.map((subnetId, index) => 
      ec2.Subnet.fromSubnetAttributes(this, `Subnet-${subnetId}`, {
        subnetId: subnetId,
        availabilityZone: `${this.region}${String.fromCharCode(97 + index)}`,
      })
    );

    if (props.zoneAwarenessEnabled && selectedSubnets.length < 2) {
      throw new Error(`You must have at least two subnets for zone awareness. Provided subnets: ${selectedSubnets.length}`);
    }

    const domain = new opensearch.Domain(this, 'OpenSearchDomain', {
      domainName: props.domainName,
      version: props.engineVersion,
      capacity: {
        dataNodeInstanceType: props.instanceType,
        dataNodes: props.instanceCount,
        masterNodeInstanceType: props.dedicatedMasterType,
        masterNodes: props.dedicatedMasterCount,
      },
      ebs: {
        volumeSize: props.volumeSize,
        volumeType: ec2.EbsDeviceVolumeType.GP3,
      },
      vpc,
      vpcSubnets: [{ subnets: selectedSubnets }],
      securityGroups: [securityGroup],
      enforceHttps: true,
      nodeToNodeEncryption: true,
      encryptionAtRest: {
        enabled: true,
      },
      zoneAwareness: {
        enabled: props.zoneAwarenessEnabled,
        availabilityZoneCount: props.availabilityZoneCount,
      },
      fineGrainedAccessControl: {
        masterUserName: props.masterUserName,
        masterUserPassword: masterUserSecret.secretValueFromJson('password'),
      },
      accessPolicies: undefined,
    });

    // Stack Outputs
    new cdk.CfnOutput(this, 'VpcId', { value: vpc.vpcId });
    new cdk.CfnOutput(this, 'SelectedSubnetIds', { value: selectedSubnets.map(subnet => subnet.subnetId).join(', ') });
    new cdk.CfnOutput(this, 'OpenSearchDomainArn', { value: domain.domainArn });
    new cdk.CfnOutput(this, 'OpenSearchDomainEndpoint', { value: domain.domainEndpoint });
    new cdk.CfnOutput(this, 'MasterUserSecretArn', { value: masterUserSecret.secretArn });
  }
}
