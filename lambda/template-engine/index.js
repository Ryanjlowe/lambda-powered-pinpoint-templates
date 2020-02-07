const AWS = require('aws-sdk');
AWS.config.update({
  region: process.env.AWS_REGION
});
const dateFormat = require('dateformat');
const promisedHandlebars = require('promised-handlebars');
const Q = require('q');
const Handlebars = promisedHandlebars(require('handlebars'), { Promise: Q.Promise });

const lambda = new AWS.Lambda();
const s3 = new AWS.S3();

Handlebars.registerHelper('content-block', function(s3Key, context) {

   const params = {
     ContentBlock: s3Key,
     DataRoot: context.data.root
   };

   return lambda.invoke({
        FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
        InvocationType: "RequestResponse",
        Payload: Buffer.from(JSON.stringify(params))
   }).promise()
    .then((response) => {
        return new Handlebars.SafeString(JSON.parse(response.Payload.toString()).html);
    });
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('currencyFormat', (priceArr, format, currency) => {
    return [].concat(priceArr).map((price) => {
      return new Intl.NumberFormat(format, { style: 'currency', currency: currency }).format(price);
    });
});

Handlebars.registerHelper('dateFormat', (dateArr, format) => {
    return [].concat(dateArr).map((date) => {
      return dateFormat(new Date(date), format);
    });
});

Handlebars.registerHelper('invokeLambda', (lambdaName, context) => {
  const params = {
    Endpoint: context.data.root
  };

  console.log('LambdaName: ' + lambdaName);

  return lambda.invoke({
    FunctionName: lambdaName,
    InvocationType: "RequestResponse",
    Payload: Buffer.from(JSON.stringify(params))
  }).promise()
    .then((response) => {
      const json = JSON.parse(response.Payload.toString());
      console.log('RESPONSE: ' + response.Payload.toString());
      return context.fn(json);
    });
});

Handlebars.registerHelper('upperCase', (strArr) => {
  return [].concat(strArr).map((str) => {
    return str.toUpperCase();
  });
});

Handlebars.registerHelper('lowerCase', (strArr) => {
  return [].concat(strArr).map((str) => {
    return str.toLowerCase();
  });
});

Handlebars.registerHelper('properCase', (strArr) => {

  return [].concat(strArr).map((str) => {
    return str.toLowerCase().split(' ').map(function(word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  });
});

Handlebars.registerHelper('urlencode', (strArr) => {
  return [].concat(strArr).map((str) => {
    return encodeURIComponent(str);
  });
});


exports.handler = async (event) => {

  console.log(JSON.stringify(event));
  if (event.ContentBlock) {
    return processContentBlock(event);
  } else if (event.ContentString) {
    return processString(event);
  }
};

const processContentBlock = function(event) {
  return s3.getObject({
    Bucket: process.env.TEMPLATE_BUCKET,
    Key: event.ContentBlock
  }).promise()
  .then((response) => {
    const h = response.Body.toString();
    return processHandlebars(h, event.DataRoot);
  });
};

const processString = function(event) {
  return processHandlebars(event.ContentString, event.DataRoot);
};

const processHandlebars = function(s, c) {
  const compiled = Handlebars.compile(s);
  return compiled(c).then((html) => {
    return { html };
  });
};
