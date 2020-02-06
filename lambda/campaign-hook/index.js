const AWS = require('aws-sdk');
AWS.config.update({
  region: process.env.AWS_REGION
});

const pinpoint = new AWS.Pinpoint();
const lambda = new AWS.Lambda();

exports.handler = async (event) => {

  console.log(JSON.stringify(event));

  return pinpoint.getCampaign({
      ApplicationId: event.ApplicationId,
      CampaignId: event.CampaignId
    }).promise()
    .then((response) => {

      const TemplateName = response.CampaignResponse.TemplateConfiguration.EmailTemplate.Name;
      return pinpoint.getEmailTemplate({ TemplateName }).promise();
    })
    .then((response) => {

      // Parse the BaseTemplate name out of the Pinpoint Template and construct a content-block for it
      const regex = new RegExp('{{! *BaseTemplate=([^ ]*) *}}');
      const found = response.EmailTemplateResponse.HtmlPart.match(regex);

      const h = '{{content-block "' + found[1] + '"}}';
      console.log('Found HTML: ' + h);

      const promises = [];
      Object.keys(event.Endpoints).forEach((endpointId, ind) => {
        const endpoint = event.Endpoints[endpointId];

        const params = {
          ContentString: h,
          DataRoot: endpoint
        };

        // Call our Template-engine Lambda function
        const promise = lambda.invoke({
             FunctionName: process.env.TEMPLATE_ENGINE_LAMBDA,
             InvocationType: "RequestResponse",
             Payload: Buffer.from(JSON.stringify(params))
        }).promise()
         .then((response) => {
             return JSON.parse(response.Payload.toString()).html;
         })
         .then((html) => {
           endpoint.Id = endpointId;
           if (!endpoint.Attributes) {
             endpoint.Attributes = {};
           }

           endpoint.Attributes.html = [html];
           return endpoint;
         });

         promises.push(promise);
      });

      return Promise.all(promises)
        .then((endpoints) => {
          const returnObject = {};
          endpoints.forEach((endpoint) => {
            returnObject[endpoint.Id] = endpoint;
            delete returnObject[endpoint.Id].Id;
          });

          // console.log(JSON.stringify(returnObject));
          return returnObject;
        });

    });
};
