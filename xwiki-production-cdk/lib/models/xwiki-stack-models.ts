import { Vpc } from '@aws-cdk/aws-ec2'
import { StackProps, Environment } from '@aws-cdk/core'

/**
 * An Interface class for extending efs props
 *
 * <p> the additional props that are added to xwiki-stacks are
 * the vpc where all the stacks will provisioned and the cdk enviroment
 * to avoid stacks to be environment-agnostic
 */

export interface xwikistackprops extends StackProps{
    vpc: Vpc;
    env: Environment,
}
