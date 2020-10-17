var profile = require('../profile');

function getParam() {
  const argv = process.argv;
  var params = argv.splice(2, argv.length);
  return (params || []).reduce((pre, next) => {
    const data = next.split('=');
    return {
      ...pre,
      [data[0]]: data[1] || '',
    };
  }, {});
}

module.exports = function inject () {
  const data = getParam();
  const evn = process.env.NODE_ENV;
  const tempData = {
    request: evn === 'development' ? '' : data.request || profile.request,
  };
  return Object.keys(tempData).map(d => `${d}=>'${tempData[d]}'`).join(',');
};
