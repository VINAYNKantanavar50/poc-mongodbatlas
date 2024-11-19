# OpenSearch CDK Stack

A CDK TypeScript project that deploys an Amazon OpenSearch Service domain with secure configurations, VPC integration, and fine-grained access control.

## Description

This CDK stack provisions an Amazon OpenSearch domain with the following features:
- VPC deployment with custom subnet selection
- Fine-grained access control with master user credentials in Secrets Manager
- Node-to-node encryption and encryption at rest
- HTTPS enforcement
- Configurable zone awareness
- Dedicated master nodes
- Custom EBS volume configuration

## Prerequisites

- AWS CDK CLI installed (version 2.x)
- Node.js and TypeScript (v20.18.0 or later)
- AWS credentials configured
- VPC and subnets already created

## Stack Outputs

- VPC ID

- Selected Subnet IDs

- OpenSearch Domain ARN

- OpenSearch Domain Endpoint

- Master User Secret ARN

# Security Features
- Master user password stored in AWS Secrets Manager

- VPC isolation with security group controls

- HTTPS enforcement

- Node-to-node encryption

- Encryption at rest

- Fine-grained access control

## Parameters

The following parameters are configurable in the stack:

| Parameter                    | Description                                                                 |
| ---------------------------- | --------------------------------------------------------------------------- |
| `vpcId`                      | The ID of the VPC where OpenSearch will be deployed.                        |
| `subnetIds`                   | A list of subnet IDs within the VPC where the OpenSearch domain will be deployed. |
| `domainName`                  | The name of the OpenSearch domain to be created.                           |
| `engineVersion`               | The version of OpenSearch to deploy (e.g., `opensearch.EngineVersion.V_1_0`). |
| `instanceType`                | The EC2 instance type for data nodes (e.g., `r5.large.search`).            |
| `instanceCount`               | The number of data nodes to deploy.                                         |
| `volumeSize`                  | The size of the EBS volume for each data node (in GiB).                    |
| `zoneAwarenessEnabled`        | Whether zone awareness should be enabled (true/false).                     |
| `dedicatedMasterType`         | The instance type for dedicated master nodes.                              |
| `dedicatedMasterCount`        | The number of dedicated master nodes to deploy.                            |
| `availabilityZoneCount`       | The number of availability zones to deploy across (used with zone awareness). |
| `masterUserName`              | The username for the OpenSearch master user.  
