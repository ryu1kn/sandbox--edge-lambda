
exports.handler = (event, context, callback) => {
  console.log('TEST');
  console.log('event >>', JSON.stringify(event));
  console.log('context >>', JSON.stringify(context));
  callback(null, event.Records[0].cf.request);
};
