import { AuroraCapacityUnit, AuroraMysqlEngineVersion, DatabaseClusterEngine, ServerlessCluster, SubnetGroup } from '@aws-cdk/aws-rds'
import { SecurityGroup, SubnetType } from '@aws-cdk/aws-ec2'
import * as cdk from '@aws-cdk/core'
import { rdsprops } from '../models/rds-model'
import { Secret } from '@aws-cdk/aws-secretsmanager'
/**
 * class xwikiRds provides a stack to create AWS RDS.
 * 
 * The stack is created inside the provissioned VPC by stack XwikiVpc
 * inside a private subnet. This stack creates a security group to be used by
 * the rds. the password for database is imported from stack encryption key
 * 
 */
export class xwikiRds extends cdk.Stack {
    public readonly xwikiRds : ServerlessCluster;
    public readonly xwikiRdsPwSecret: Secret;
    constructor (scope: cdk.App, id: string, props: rdsprops) {
      super(scope, id, props)

      const xwikiRdsSg = new SecurityGroup(this, 'trcXWikiRdsSecurityGroup', {
        vpc: props.vpc,
        allowAllOutbound: true,
        description: 'Security Group for XWiki RDS'
      })

      const xwikiRdsDbSubnetGroup = new SubnetGroup(this, 'trcXWikiDbSubnetGroup', {
        description: 'DB SubnetGroup for XWiki RDS',
        vpc: props.vpc,
        vpcSubnets: props.vpc.selectSubnets(
          {
            subnetType: SubnetType.PRIVATE
          }
        )
      })

      const xwikiRdsPwSecret = new Secret(this, 'trcXWikiEcsUserPassword', {
        description: 'RDS UserSecret for XWiki RDS',
        encryptionKey: props.encryptionkey,
        generateSecretString: {
          excludePunctuation: true,
          passwordLength: 16
        }
      })

      const xwikiRds = new ServerlessCluster(this, 'trcXWikiDbCluster', {
        engine: DatabaseClusterEngine.auroraMysql({
          version: AuroraMysqlEngineVersion.VER_2_07_1
        }),
        vpc: props.vpc,
        vpcSubnets: props.vpc.selectSubnets(
          {
            subnetType: SubnetType.PRIVATE
          }
        ),
        credentials: {
          username: 'xwikimysql',
          password: xwikiRdsPwSecret.secretValue
        },
        backupRetention: cdk.Duration.days(7),
        scaling: {
          autoPause: cdk.Duration.minutes(0), // AutoPause Disabled
          minCapacity: AuroraCapacityUnit.ACU_1,
          maxCapacity: AuroraCapacityUnit.ACU_8
        },
        securityGroups: [
          xwikiRdsSg
        ],
        defaultDatabaseName: 'xwiki',
        storageEncryptionKey: props.encryptionkey,
        subnetGroup: xwikiRdsDbSubnetGroup
      })

      this.xwikiRds = xwikiRds
      this.xwikiRdsPwSecret = xwikiRdsPwSecret
    }
}
