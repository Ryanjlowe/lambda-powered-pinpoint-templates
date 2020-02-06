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
