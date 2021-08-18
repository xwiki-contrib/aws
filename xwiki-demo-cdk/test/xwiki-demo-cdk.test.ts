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
import { expect as expectCDK, haveResourceLike, countResources, SynthUtils } from '@aws-cdk/assert'
import { App } from '@aws-cdk/core'
import '@aws-cdk/assert/jest'
import { EC2XWikiDemo } from '../lib/stacks/ec2-xwiki-demo'
import { xwikidownload } from '../lib/stacks/config'

const app = new App()


const stack = new EC2XWikiDemo(app, 'xwiki-cdk-demo', {
  xwiki: xwikidownload
})

//testing the number of EC2 instance created
test('check The number of EC2 instance created', () => {
  expectCDK(stack).to(
    countResources('AWS::EC2::Instance', 1))
})

//testing the insatance type and SSH key name
test('Check InstanceType and SSH KeyName', () => {
  expectCDK(stack).to(
    haveResourceLike('AWS::EC2::Instance', {
      InstanceType: 't2.medium',
      KeyName: 'test'
    }))
})


//To check the created VPC
test('Check VPC created', () => {
  expectCDK(stack).to(
    countResources('AWS::EC2::VPC', 1))
})

//to check if EC2 instance launched inside the subnet recived Public IPv4
test('EC2 instance launched inside the subnet recived Public IPv4', () => {
  expectCDK(stack).to(
    haveResourceLike('AWS::EC2::Subnet', {
      MapPublicIpOnLaunch: true
    }))
})

//To test IAM role created
test('Check IAM role', () => {
  expectCDK(stack).to(
    countResources('AWS::IAM::Role', 1))
})

//to test the security group
test('Check Security Group', () => {
  expectCDK(stack).to(
    countResources('AWS::EC2::SecurityGroup', 1))
})

//to test the userdata used to install xwiki instance
test('Check user data in instance', ()=> {
  expectCDK(stack).to(
    haveResourceLike('AWS::EC2::Instance', {
      UserData: {
        "Fn::Base64": "#! /bin/bash \n sudo yum -q -y install java-1.8.0-openjdk \n sudo yum -q -y install unzip \n mkdir xwikihome \n wget -q -O xwiki_packer.zip https://nexus.xwiki.org/nexus/content/groups/public/org/xwiki/platform/xwiki-platform-distribution-flavor-jetty-hsqldb/13.1/xwiki-platform-distribution-flavor-jetty-hsqldb-13.1.zip \n unzip -q xwiki_packer.zip -d /home/ec2-user/xwikihome"
      }
    })
  )
})

//snapshot test
test('demo stack matches the snapshot', () => {
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot()
})
