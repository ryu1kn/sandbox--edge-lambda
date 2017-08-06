
exports.handler = (event, context, callback) => {
  console.log('TEST');
  console.log('event >>', JSON.stringify(event));
  console.log('context >>', JSON.stringify(context));

  const request = event.Records[0].cf.request;
  const newRequest = Object.assign({}, request, {uri: '/index.html'});
  callback(null, newRequest);
};
