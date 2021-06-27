import { Vpc } from '@aws-cdk/aws-ec2'
import { StackProps, Environment } from '@aws-cdk/core'
import { Key } from '@aws-cdk/aws-kms'

/**
 * An Interface class for extending efs props
 * 
 * <p> the additional props that are added to efs are
 * the vpc where efs will provisioned, the encryption key to
 * be used and the cdk enviroment
 */

export interface efsprops extends StackProps{

    vpc: Vpc;
    encryptionkey: Key;
    env: Environment
}
