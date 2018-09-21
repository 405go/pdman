const _http = require('http');

const version = {
  version: '2.0.1',
  date: '2018.8',
};

const defaultUrl = 'http://www.pdman.cn/latest-version.json';
//const defaultUrl = 'http://127.0.0.1/latest-version.json';

export const getCurrentVersion = () => {
  return version;
};

export const getVersion = (callback) => {
  _http.get(defaultUrl, (req) => {
    let result = '';
    req.on('data', (data) => {
      result += data;
    });
    req.on('end', () => {
      let json = {};
      //console.log(result);
      try {
        json = JSON.parse(result) || {};
      } catch (e) {
        json = {};
      }
      callback && callback(json);
    });
    req.on('error', () => {
      callback && callback({});
    });
  });
};
