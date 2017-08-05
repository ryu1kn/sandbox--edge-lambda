
const AWS = require('aws-sdk');
const merge = require('lodash.merge');
const cloudfront = new AWS.CloudFront();

const DISTRIBUTION_ID = process.env.DISTRIBUTION_ID;
const EDGE_LAMBDA_ARN = process.env.EDGE_LAMBDA_ARN;

Promise.resolve()
    .then(() => {
        const params = {Id: DISTRIBUTION_ID};
        return cloudfront.getDistributionConfig(params).promise();
    })
    .then(data => {
        const overrideConfig = {
            DefaultCacheBehavior: {
                LambdaFunctionAssociations: {
                    Quantity: 1,
                    Items: [{
                        EventType: 'origin-request',
                        LambdaFunctionARN: EDGE_LAMBDA_ARN
                    }]
                }
            }
        };
        const params = {
            DistributionConfig: merge({}, data.DistributionConfig, overrideConfig),
            Id: DISTRIBUTION_ID,
            IfMatch: data.ETag
        };
        return cloudfront.updateDistribution(params).promise();
    })
    .then(() => {
        const params = {Id: DISTRIBUTION_ID};
        return cloudfront.waitFor('distributionDeployed', params).promise();
    })
    .catch(e => {
        setTimeout(() => {
            throw e;
        }, 0)
    });
