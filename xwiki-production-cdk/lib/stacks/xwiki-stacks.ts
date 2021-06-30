
import { Stack, App, Duration, CfnOutput } from '@aws-cdk/core'
import { AwsLogDriver, Cluster, ContainerImage, FargatePlatformVersion, FargateService, FargateTaskDefinition, Secret as EcsSecret } from '@aws-cdk/aws-ecs'
import { AuroraCapacityUnit, AuroraMysqlEngineVersion, DatabaseClusterEngine, ServerlessCluster, SubnetGroup } from '@aws-cdk/aws-rds'
import { FileSystem, PerformanceMode } from '@aws-cdk/aws-efs'
import { Peer, Port, SecurityGroup, SubnetType } from '@aws-cdk/aws-ec2'
import { Key } from '@aws-cdk/aws-kms'
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs'
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Secret } from '@aws-cdk/aws-secretsmanager'
import { ApplicationLoadBalancer, ApplicationProtocol } from '@aws-cdk/aws-elasticloadbalancingv2'
import { xwikistackprops } from '../models/xwiki-stack-models'
import { xwikiVesrion } from '../config'

export class XwikiProductionStacks extends Stack {
    constructor (scope: App, id: string, props: xwikistackprops) {
      super(scope, id, props)

      const xwikiEncryptionKey = new Key(this, 'XWikiEncryptionKey', {
        alias: `xwiki`,
        description: `Encryption Key for XWiki Storage Resources`,
        enableKeyRotation: true,
        enabled: true,
        trustAccountIdentities: true,
      });
  
      const xwikiSecretEncryptionKey = new Key(this, 'XWikiSecretEncryptionKey', {
        alias: `xwiki-secret`,
        description: `Encryption Key for XWiki Secrets`,
        enableKeyRotation: true,
        enabled: true,
        trustAccountIdentities: true,
      });
  
      const xwikiEfsSg = new SecurityGroup(this, 'XWikiEfsSecurityGroup', {
        vpc: props.vpc,
        allowAllOutbound: true,
        description: `Security Group for XWiki EFS`
      });
  
      const xwikiEfs = new FileSystem(this, 'XWikiFileSystem', {
        vpc: props.vpc,
        enableAutomaticBackups: true,
        encrypted: true,
        kmsKey: xwikiEncryptionKey,
        performanceMode: PerformanceMode.GENERAL_PURPOSE,
        securityGroup: xwikiEfsSg,
        vpcSubnets: props.vpc.selectSubnets(
          {
            subnetType: SubnetType.PRIVATE
          }
        )
      });
  
      const xwikiRdsSg = new SecurityGroup(this, 'XWikiRdsSecurityGroup', {
        vpc: props.vpc,
        allowAllOutbound: true,
        description: `Security Group for XWiki RDS`
      });
  
      const xwikiRdsDbSubnetGroup = new SubnetGroup(this, 'XWikiDbSubnetGroup', {
        description: `DB SubnetGroup for XWiki RDS`,
        vpc: props.vpc,
        vpcSubnets: props.vpc.selectSubnets(
          {
            subnetType: SubnetType.PRIVATE
          }
        )
      });
  
      const xwikiRdsPwSecret = new Secret(this, 'XWikiEcsUserPassword', {
        description: `RDS UserSecret for XWiki RDS`,
        encryptionKey: xwikiSecretEncryptionKey,
        generateSecretString: {
          excludePunctuation: true,
          passwordLength: 16
        }
      });
  
      const xwikiRds = new ServerlessCluster(this, 'XWikiDbCluster', {
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
          password: xwikiRdsPwSecret.secretValue,
        },
        backupRetention: Duration.days(7),
        scaling: {
          autoPause: Duration.minutes(0), // AutoPause Disabled
          minCapacity: AuroraCapacityUnit.ACU_1,
          maxCapacity: AuroraCapacityUnit.ACU_8
        },
        securityGroups: [
          xwikiRdsSg
        ],
        defaultDatabaseName: 'xwiki',
        storageEncryptionKey: xwikiEncryptionKey,
        subnetGroup: xwikiRdsDbSubnetGroup
      });
  
      const xwikiFargateCluster = new Cluster(this, 'XWikiCluster', {
        containerInsights: true,
        vpc: props.vpc
      });
  
      const xwikiTaskIamRole = new Role(this, 'XwikiTaskRole', {
        assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
        description: `IAM Task Role for XWiki ECS Fargate`,
      });
  
      const xwikiTaskDefinition = new FargateTaskDefinition(this, 'XWikiTaskDefinition', {
        cpu: 2048,
        memoryLimitMiB: 4096,
        volumes: [
          {
            name: 'EfsPersistendVolume',
            efsVolumeConfiguration: {
              fileSystemId: xwikiEfs.fileSystemId,
              rootDirectory: '/',
              transitEncryption: 'ENABLED'
            }
          }
        ],
        executionRole: xwikiTaskIamRole,
        taskRole: xwikiTaskIamRole
      });
  
      const xwikiLogGroup = new LogGroup(this, 'XWikiLogGroup', {
        retention: RetentionDays.ONE_MONTH
      });
  
      xwikiLogGroup.grantWrite(xwikiTaskIamRole);
  
      const xwikiContainer = xwikiTaskDefinition.addContainer('XWikiImage', {
        image: ContainerImage.fromRegistry(xwikiVesrion),
        environment: {
          'DB_HOST': xwikiRds.clusterEndpoint.hostname,
          'DB_DATABASE': 'xwiki',
          'DB_USER': 'xwikimysql'
        },
        logging: new AwsLogDriver({
          logGroup: xwikiLogGroup,
          streamPrefix: `xwiki`
        }),
        secrets: {
          'DB_PASSWORD': EcsSecret.fromSecretsManager(xwikiRdsPwSecret)
        },
        essential: true,
      });
  
      xwikiContainer.addPortMappings({
        containerPort: 8080
      });
  
      xwikiContainer.addMountPoints({
        containerPath: '/usr/local/xwiki/data',
        readOnly: false,
        sourceVolume: 'EfsPersistendVolume'
      });
  
      const xwikiServiceSecurityGroup = new SecurityGroup(this, 'XWikiTaskSecurityGroup', {
        vpc: props.vpc,
        allowAllOutbound: true,
        description: `SecurityGroup for XWiki ECS Fargate Service`
      });
  
      const xwikiLoadBalancerSecurityGroup = new SecurityGroup(this, 'XWikiAlbSecurityGroup', {
        vpc: props.vpc,
        allowAllOutbound: true,
        description: `SecurityGroup for XWiki Application LoadBalancer`
      });
  
      xwikiLoadBalancerSecurityGroup.addIngressRule(
        Peer.anyIpv4(),
        Port.tcp(80),
        `Allow HTTP Connections for the World to Application LoadBalancer`
      );
  
      const xwikiLoadBalancer = new ApplicationLoadBalancer(this, 'XWikiLoadBalancer', {
        vpc: props.vpc,
        internetFacing: true,
        securityGroup: xwikiLoadBalancerSecurityGroup
      });
  
      const xwikiLoadBalancerListener = xwikiLoadBalancer.addListener('XWikiLoadBalancerHttpListener', {
        protocol: ApplicationProtocol.HTTP,
      });
  
      xwikiServiceSecurityGroup.addIngressRule(
        xwikiLoadBalancerSecurityGroup,
        Port.tcp(8080),
        `Allow HTTP Connections for XWiki ECS Application LoadBalancer`
      );
  
      xwikiEfsSg.addIngressRule(
        xwikiServiceSecurityGroup,
        Port.tcp(2049),
        `Allow NFS Connection for XWiki Service`
      );
  
      xwikiRdsSg.addIngressRule(
        xwikiServiceSecurityGroup,
        Port.tcp(xwikiRds.clusterEndpoint.port),
        `Allow DB Connection for XWiki Service`
      );
  
      const xwikiEcsService = new FargateService(this, 'XWikiService', {
        cluster: xwikiFargateCluster,
        taskDefinition: xwikiTaskDefinition,
        desiredCount: 1,
        platformVersion: FargatePlatformVersion.VERSION1_4,
        vpcSubnets: props.vpc.selectSubnets(
          {
            subnetType: SubnetType.PRIVATE
          }
        ),
        securityGroups: [
          xwikiServiceSecurityGroup
        ]
      });
  
      xwikiLoadBalancerListener.addTargets('XWikiTargets', {
        deregistrationDelay: Duration.minutes(1),
        protocol: ApplicationProtocol.HTTP,
        targets: [
          xwikiEcsService
        ],
        healthCheck: {
          healthyHttpCodes: '200,301,302'
        }
      });
  
      new CfnOutput(this, 'XWikiLoadBalancerDns', {
        value: xwikiLoadBalancer.loadBalancerDnsName,
        description: `DNS Endpoint for connecting to the XWiki Installation`
      });
    }
  }

