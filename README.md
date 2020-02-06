# Lambda Powered Amazon Pinpoint Templates
Using MustacheJS to render email templates stored in S3


## Example Email Template
```

{{content-block "common/header.html"}}

<p>Here is my Ice Cream promotion email.  I am so happy you are here {{Attributes.FirstName}}</p>

<p>Your price is {{currencyFormat Attributes.Price Attributes.Locale Attributes.Currency}}

<p>Your Deal expires {{dateFormat Attributes.ExpireDate "dddd, mmmm d, yyyy"}}

<p>
  {{#invokeLambda "example-invoked-lambda"}}
  <table>
    <tr>
      <td>Product Image from Lambda:</td>
      <td><img src="{{{image}}}" width="100" /></td>
    </tr>
    <tr>
      <td>Product Name</td>
      <td><a href="{{{link}}}">{{{name}}}</a></td>
    </tr>
    <tr>
      <td>Price:</td>
      <td>{{{price}}}</td>
    </tr>
  </table>
  {{/invokeLambda}}
</p>

{{content-block "common/footer.html"}}

```

## Repository content
Main files:
```
.
├── README.MD                                           <-- This instructions file
├── templates                                           <-- Folder for email templates, sync to S3
├── lambda                                              <-- Folder for the AWS Lambdas
│   └── campaign-hook
│       └── index.js                                    <-- Function called by Pinpoint, Campaign Filter Lambda Hook
│   └── template-engine
│       └── index.js                                    <-- Function to recursively render templates from S3
│   └── example-invoked-lambda
│       └── index.js                                    <-- Example function that returns values used in blocks
```

## Example Segment
Save the following as a CSV file to test the example templates located in this repository.  It has the necessary attributes to render the ice_cream email.
```
ChannelType,Id,Address,User.UserId,Attributes.FirstName,Attributes.brand,Attributes.Price,Attributes.Locale,Attributes.Currency,Attributes.ExpireDate
EMAIL,1,EMAIL_ADDRESS1_HERE,1,Ryan,mainbrand,125.32,en-US,USD,2020-03-10T10:00:00
EMAIL,2,EMAIL_ADDRESS2_HERE,2,John,subbrand,321.45,zh-CN,JPY,2020-05-10T10:00:00
```

## Set up
1. Deploy the Templates in an S3 bucket
`aws s3 templates/ s3://[BUCKET NAME]`
2. Deploy Lambdas
  * Run `npm run build` in each Lambda folder to build a deployable Zip file
  * Ensure Lambda functions have IAM permissions to call Pinpoint, invoke other Lambda functions, and access files in S3
  * Ensure Lambda functions have environment variables defined

    | Lambda Function | Environment Variable Name | Value |
    | --------------- | --------------- | --------------- |
    | campaign-hook | TEMPLATE_ENGINE_LAMBDA | [ARN of the Template Lambda Function]
    | template-engine | TEMPLATE_BUCKET | [Template S3 Bucket Name] |
    
3. Create a Pinpoint Project
4. Connect the campaign hook Lambda to a Pinpoint Project
[Full Lambda Hook Documentation for](https://docs.aws.amazon.com/pinpoint/latest/developerguide/segments-dynamic.html)
```
aws lambda add-permission \
 --function-name [CAMPAIGN_HOOK LAMBDA ARN] \
 --statement-id lambdaHookStatement1 \
 --action lambda:InvokeFunction \
 --principal pinpoint.[REGION].amazonaws.com \
 --source-arn arn:aws:mobiletargeting:[REGION]:[AWS_ACCOUNT_ID]:/apps/[PINPOINT_PROJECT_ID]/*

 aws lambda add-permission \
 --function-name [CAMPAIGN_HOOK LAMBDA ARN] \
 --statement-id lambdaHookStatement12 \
 --action lambda:InvokeFunction \
 --principal pinpoint.[REGION].amazonaws.com \
 --source-arn arn:aws:mobiletargeting:[REGION]:[AWS_ACCOUNT_ID]:/apps/[PINPOINT_PROJECT_ID]

 aws pinpoint update-application-settings \
 --application-id [PINPOINT_PROJECT_ID] \
 --write-application-settings-request 'CampaignHook={LambdaFunctionName="[CAMPAIGN_HOOK LAMBDA ARN]",Mode="FILTER"}'
```
5. Create a Pinpoint Template with the following Message Body
```
<!DOCTYPE html>
{{! BaseTemplate=emails/ice_cream.html }}
<html>{{Attributes.html}}</html>
```
6. Import segment from above
7. Create a campaign using the segment and the created Pinpoint Template and schedule for immediate send
