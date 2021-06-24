import { Key } from '@aws-cdk/aws-kms'
import * as cdk from '@aws-cdk/core'

export class XwikiEncryptionKey extends cdk.Stack {
    public readonly EncryptionKey: Key;
    public readonly SecretEncryptionKey: Key;
    constructor (scope: cdk.App, id: string, props?: cdk.StackProps) {
      super(scope, id, props)

      const EncryptionKey = new Key(this, 'xwiki_encryption_key', {
        alias: 'xwiki-key',
        description: 'Encryption Key for XWiki Storage Resources',
        enableKeyRotation: true,
        enabled: true,
        trustAccountIdentities: true
      })

      const SecretEncryptionKey = new Key(this, 'xwiki_secret_encryption key', {
        alias: 'xwiki-secret-key',
        description: 'Encryption Key for XWiki Secrets',
        enableKeyRotation: true,
        enabled: true,
        trustAccountIdentities: true
      })

      this.EncryptionKey = EncryptionKey
      this.SecretEncryptionKey = SecretEncryptionKey
    }
}
