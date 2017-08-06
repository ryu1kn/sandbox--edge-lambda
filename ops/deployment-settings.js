
const BUILD_NUMBER = process.env.BUILD_NUMBER;

module.exports = {
  moduleName: 'test-edge-lambda',
  outputsStore: {
    type: 's3-bucket',
    region: {$ref: '#/_args/region'},
    bucket: 'test-edge-lambda'
  },
  tasks: [
    {
      id: 'create-package-store',
      type: 'cf-stack',
      regionOverrides: {
        'ap-southeast-2': 'us-east-1'
      },
      stackName: 'test-edge-lambda-package-store',
      stackTemplate: {
        script: 'cp ./templates/package-store.json $TEMPLATE_OUTPUT_FILE',
        envVars: {
          TEMPLATE_OUTPUT_FILE: {$ref: '#/_templateOutputFile'}
        }
      },
      stackParams: {
        BucketName: 'tmp-1234567'
      }
    },
    {
      id: 'upload-lambda',
      type: 'custom',
      run: {
        script: `mkdir -p ../.build \\
            && cd ../lambda && zip -q -r9 ../.build/${BUILD_NUMBER}.zip * \\
            && aws s3 cp ../.build/${BUILD_NUMBER}.zip s3://$BUCKET_NAME/lambdas/${BUILD_NUMBER}.zip`,
        envVars: {
          BUCKET_NAME: {$ref: '#/_deploymentOutputs/Bucket'}
        }
      }
    },
    {
      id: 'create-cloudfront-edge-lambda',
      type: 'cf-stack',
      regionOverrides: {
        'ap-southeast-2': 'us-east-1'
      },
      stackName: 'test-edge-lambda-module',
      stackTemplate: {
        script: 'cp ./templates/main.json $TEMPLATE_OUTPUT_FILE',
        envVars: {
          TEMPLATE_OUTPUT_FILE: {$ref: '#/_templateOutputFile'}
        }
      },
      stackParams: {
        AssetBucketDomain: {'Fn::Join': ['.', [{$ref: '#/_deploymentOutputs/Bucket'}, 's3.amazonaws.com']]},
        EdgeLambdaName: 'test-edgelambda',
        PublicDomain: 'test-edgelambda.ryuichi.io',
        LambdaBucket: {$ref: '#/_deploymentOutputs/Bucket'},
        LambdaKey: `lambdas/${BUILD_NUMBER}.zip`,
      }
    },
    {
      id: 'deploy-edge-lambda',
      type: 'custom',
      run: {
        script: 'node update-cloudfront-distribution.js',
        envVars: {
          DISTRIBUTION_ID: {$ref: '#/_deploymentOutputs/CloudFrontDistributionId'},
          EDGE_LAMBDA_ARN: {$ref: '#/_deploymentOutputs/VersionedEdgeLambdaArn'}
        }
      }
    }
  ]
};
