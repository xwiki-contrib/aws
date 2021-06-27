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
import { XwikiEfs } from '../lib/stacks/Efs'
import { XwikiVpc } from '../lib/stacks/vpc'
import { XwikiEncryptionKey } from '../lib/stacks/encryptionKey'
import { xwikiRds } from '../lib/stacks/rds'
import { region } from "../lib/config";

const app = new cdk.App()

const env = {
  account: '656019072197',
  region: region
}

const xwikiEncryptionKey = new XwikiEncryptionKey(app, 'xwiki-encryption-key',
  {
    env: env
  })

const xwikivpc = new XwikiVpc(app, 'xwiki-prod-vpc', {
  env: env

})

const xwikiEfs = new XwikiEfs(app, 'xwiki-prod-efs', {
  vpc: xwikivpc.xwikivpc,
  encryptionkey: xwikiEncryptionKey.EncryptionKey,
  env: env
})

const xwikirds = new xwikiRds(app, 'xwiki-rds', {
  vpc: xwikivpc.xwikivpc,
  encryptionkey: xwikiEncryptionKey.SecretEncryptionKey,
  env: env
})
