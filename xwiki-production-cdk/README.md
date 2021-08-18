# Welcome to XWiki Production Installation!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`XWikiProductionStacks`) and (`XWikiVpc`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## instructions to deploy

 * Clone the repo https://github.com/xwiki-contrib/aws
   `git clone https://github.com/xwiki-contrib/aws.git`
 * navigate into the clone Diretory
   `cd aws`
 * Navigate into the Demo Diretory
   `cd xwiki-production-cdk`
 * Install all needed packages locally
   `npm install`
 * Execute the deployment, and wait for the process to get complete.
   `cdk deploy --all`