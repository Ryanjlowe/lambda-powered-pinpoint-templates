# Lambda Powered Amazon Pinpoint Templates
Using MustacheJS to render email templates stored in S3


## Examples
```
{{content-block "path/to/s3/key"}}

{{Attributes.FirstName}}

{{dateFormat Attributes.ExpireDate "dddd, mmmm d, yyyy"}}

{{currencyFormat Attributes.Price Attributes.Locale Attributes.Currency}}
```
