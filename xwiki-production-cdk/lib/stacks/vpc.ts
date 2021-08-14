#!/usr/bin/env node
/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

import { DefaultInstanceTenancy, NatProvider, SubnetType, Vpc } from '@aws-cdk/aws-ec2'
import * as cdk from '@aws-cdk/core'

/**
 * The class XWikiVpx create a stack to provision a new VPC in user's account
 * The VPC will constain 4 subnets, 2 private and 2 public.
 */
export class XWikiVpc extends cdk.Stack {
    public readonly xwikivpc: Vpc;
    constructor (scope: cdk.App, id: string, props?: cdk.StackProps) {
      super(scope, id, props)

      this.xwikivpc = new Vpc(this, 'xwiki-vpc', {
        cidr: '10.42.42.0/24', //this is enough for this installation but not if you want to deploy other services inside this.
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
