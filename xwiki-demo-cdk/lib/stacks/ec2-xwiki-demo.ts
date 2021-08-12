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
import { Stack, App, CfnOutput } from '@aws-cdk/core'
import { Vpc, SecurityGroup, Peer, Port, Instance, InstanceType, InstanceClass, InstanceSize, MachineImage, AmazonLinuxGeneration, SubnetType, UserData } from '@aws-cdk/aws-ec2'
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { ec2props } from '../stacks/Ec2-model'

export class EC2XwikiDemo extends Stack {
  constructor (scope: App, id: string, props: ec2props) {
    super(scope, id, props)

    const defaultVpc = new Vpc(this, 'VPC', {
      cidr: '10.0.0.0/16', 
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 27
        }
      ]
    })

    const role = new Role(
      this,
      'ec2-xwiki-demo-instance-role',
      { assumedBy: new ServicePrincipal('ec2.amazonaws.com') }
    )

    const securityGroup = new SecurityGroup(
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
      Peer.anyIpv4(),
      Port.tcp(22),
      'Allows SSH access from Internet'
    )

    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80),
      'Allows HTTP access from Internet'
    )

    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(443),
      'Allows HTTPS access from Internet'
    )

    securityGroup.addIngressRule(
      Peer.anyIpv6(),
      Port.tcp(8080),
      'Allows port 8080 on Ipv6'
    )

    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(8080),
      'Allows port 8080 on Ipv4'

    )

    // provesioning the EC2 instance inside the VPC containg xwiki
    const instance = new Instance(this, 'ec2-xwiki-demo', {
      vpc: defaultVpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: 'ec2-xwiki-demo',
      instanceType: InstanceType.of( 
        InstanceClass.T2,
        InstanceSize.MEDIUM
      ),
      machineImage: MachineImage.latestAmazonLinux({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2
      }),

      keyName: 'xwiki-demo-key', // user will first create this key in console

      userData: UserData.forLinux({
        shebang: `#! /bin/bash \n sudo yum -q -y install java-1.8.0-openjdk \n sudo yum -q -y install unzip \n mkdir xwikihome \n wget -q -O xwiki_packer.zip ${props.xwiki} \n unzip -q xwiki_packer.zip -d /home/ec2-user/xwikihome`
      })

    })

    
    new CfnOutput(this, 'xwiki-demo-instance-output', {
      value: instance.instancePublicIp //ip adress of the instance configured.
    })
  }
}
