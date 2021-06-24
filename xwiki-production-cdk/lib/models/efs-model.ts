import * as ec2 from '@aws-cdk/aws-ec2'
import * as cdk from '@aws-cdk/core'
import { Key } from '@aws-cdk/aws-kms'

// import { XwikiProductionCdkStack } from '../app';

export interface efsprops extends cdk.StackProps{

    vpc: ec2.Vpc;
    encryptionkey: Key;
    env: cdk.Environment
}
