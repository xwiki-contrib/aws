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
import { expect as expectCDK, haveResourceLike, countResources } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import '@aws-cdk/assert/jest'
import { EC2XwikiDemo } from '../lib/stacks/ec2-xwiki-demo'

test('Check InstanceType and SSH KeyName', () => {
  const app = new cdk.App()
  // WHEN
  // const stack= new cdk.Stack(app, 'xwiki-cdk-demo-test', )
  const stack = new EC2XwikiDemo(app, 'xwiki-cdk-demo', {
    env: {
      account: '656019072197',
      region: 'us-east-1'
    }
  })

  // expect(stack).toBe(countResources("AWS::EC2::Instance", 1));
  // THEN
  expectCDK(stack).to(
    countResources('AWS::EC2::Instance', 1))
    
  expectCDK(stack).to(
    haveResourceLike('AWS::EC2::Instance', {
      InstanceType: 't2.medium',
      KeyName: 'test'

    })
  )
})
