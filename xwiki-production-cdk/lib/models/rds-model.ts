import * as ec2 from '@aws-cdk/aws-ec2'
import * as cdk from '@aws-cdk/core'
import { Key } from '@aws-cdk/aws-kms'

export interface rdsprops extends cdk.StackProps{
    vpc:ec2.Vpc,
    encryptionkey: Key
    env: cdk.Environment
}
