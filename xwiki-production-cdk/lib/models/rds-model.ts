import * as ec2 from '@aws-cdk/aws-ec2'
import * as cdk from '@aws-cdk/core'
import { Key } from '@aws-cdk/aws-kms'

/**
 * An Interface class for extending rds props
 * 
 * <p> the additional props that are added to rds are
 * the vpc where rds will provisioned, the encryption key to
 * be used and the cdk enviroment.
 */
export interface rdsprops extends cdk.StackProps{
    vpc:ec2.Vpc,
    encryptionkey: Key
    env: cdk.Environment
}
