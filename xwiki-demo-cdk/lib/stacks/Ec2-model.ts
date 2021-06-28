import { StackProps } from '@aws-cdk/core'

/**
 * An insterface class for extending the props of EC2XwikiDemo class
 * 
 * <p> This is used for extending the properties of EC2XwikiDemo class
 * here xwiki is added as the proprties that will be used to provide download 
 * link of the xwiki to EC2XwikiDemo Class from the config file.
 */

export interface ec2props extends StackProps{

    xwiki: string

}
