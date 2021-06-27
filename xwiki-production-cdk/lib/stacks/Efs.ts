import * as cdk from '@aws-cdk/core';
import { FileSystem, PerformanceMode } from '@aws-cdk/aws-efs';
import {SecurityGroup, SubnetType} from  '@aws-cdk/aws-ec2';
import { efsprops } from '../models/efs-model'

/**
 * XwikiEfs is a class for creating a CDK stack with AWS CDK provissioned 
 * 
 * This class will create an AWS EFS inside the VPC with security group allowing all
 * out bound traffic and using the created encryption key.
 * 
*/
export class XwikiEfs extends cdk.Stack{

  public readonly xwikiEfs: FileSystem;
    constructor(scope: cdk.App, id: string, props: efsprops){
        super(scope, id, props)

        

        const xwikiEfsSg = new SecurityGroup(this, 'trcXWikiEfsSecurityGroup', {
            vpc: props.vpc,
            allowAllOutbound: true,
            description: `Security Group for XWiki EFS`
          });
      
          const xwikiEfs = new FileSystem(this, 'trcXWikiFileSystem', {
            vpc: props.vpc,
            enableAutomaticBackups: true,
            encrypted: true,
            kmsKey: props.encryptionkey,
            performanceMode: PerformanceMode.GENERAL_PURPOSE,
            securityGroup: xwikiEfsSg,
            vpcSubnets: props.vpc.selectSubnets(
              {
                subnetType: SubnetType.PRIVATE
              }
            )
          });

          this.xwikiEfs=xwikiEfs;
      
    }
}