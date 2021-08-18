# Welcome to XWiki Demo Installation!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`EC2XWikiDemo`)
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
 First step would be to make a key in AWS console with name test. to do so, follow this guide. make sure to keep the name of your key-pair "test".
  *  Clone the repo https://github.com/xwiki-contrib/aws
    `git clone https://github.com/xwiki-contrib/aws.git`
  *  Navigate into the clone Diretory
    `cd aws`
  *  Navigate into the Demo Diretory
    `cd xwiki-demo-cdk`
  *  Install all needed packages locally
    `npm install`
  *  Execute the deployment, and wait for the process to get complete.
    `cdk deploy`
  * You have an EC2 instance with XWiki demo installed. Now to start the server, SSH into the newly created instance and start XWiki.
  * For starting XWiki, go into the folder. the name of the folder will depend on the version of XWiki you will deploy
    `cd xwikihome && cd xwiki-platform-distribution-flavor-jetty-hsqldb-13.1` 
    run start_xwiki.sh
  * `chmod +x ./start_xwiki.sh && ./start_xwiki.sh`
    Now, to connect to XWiki you need to go to port 8080 of public Ip address. 
