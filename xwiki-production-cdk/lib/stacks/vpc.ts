import { DefaultInstanceTenancy, NatProvider, SubnetType, Vpc } from '@aws-cdk/aws-ec2'
import * as cdk from '@aws-cdk/core'

/**
 * The class XwikiVpx create a stack to provision a new VPC in user's account
 * The VPC will constain 4 subnets, 2 private and 2 public.
 */
export class XwikiVpc extends cdk.Stack {
    public readonly xwikivpc: Vpc;
    constructor (scope: cdk.App, id: string, props?: cdk.StackProps) {
      super(scope, id, props)

      this.xwikivpc = new Vpc(this, 'xwiki-vpc', {
        cidr: '10.42.42.0/24',
        defaultInstanceTenancy: DefaultInstanceTenancy.DEFAULT,
        maxAzs: 2,
        natGatewayProvider: NatProvider.gateway(),
        natGateways: 1,
        subnetConfiguration: [
          {
            name: 'public',
            subnetType: SubnetType.PUBLIC,
            cidrMask: 27
          },
          {
            name: 'private-database',
            subnetType: SubnetType.PRIVATE,
            cidrMask: 26
          }
        ]
      })
    }
}
