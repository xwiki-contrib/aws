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
import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as iam from '@aws-cdk/aws-iam'
import * as fs from 'fs'

export class EC2XwikiDemo extends cdk.Stack {
  constructor (scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const defaultVpc = ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true })

    const role = new iam.Role(
      this,
      'ec2-xwiki-demo-instance-role',
      { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') }
    )

    const securityGroup = new ec2.SecurityGroup(
      this,
      'ec2-xwiki-demo-sg',
      {
        vpc: defaultVpc,
        allowAllOutbound: true, // will let xwiki instance send outbound traffic
        securityGroupName: 'ec2-xwiki-demo-sg'
      }
    )

    // configuring the security group to allow inbound traffic at specific ports
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allows SSH access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allows HTTP access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allows HTTPS access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv6(),
      ec2.Port.tcp(8080),
      'Allows port 8080 on Ipv6'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      // ec2.Peer.anyIpv6(),
      ec2.Port.tcp(8080),
      'Allows port 8080 on Ipv4'

    )

    // provesioning the EC2 instance inside the VPC containg xwiki
    const instance = new ec2.Instance(this, 'ec2-xwiki-demo', {
      vpc: defaultVpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: 'ec2-xwiki-demo',
      instanceType: ec2.InstanceType.of( // t2.micro has free tier usage in aws
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MEDIUM
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),

      keyName: 'test'// user will first create this key in console

    })
    // adding the commands that will install xwiki in the instance
    instance.addUserData(
      fs.readFileSync('lib/stacks/user_script.sh', 'utf8')
    )

    // cdk lets us output prperties of the resources we create after they are created
    // we want the ip address of this new instance so we can ssh into it later
    new cdk.CfnOutput(this, 'xwiki-demo-instance-output', {
      value: instance.instancePublicIp
    })
  }
}
