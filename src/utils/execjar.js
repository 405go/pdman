import _object from 'lodash/object';
import electron from 'electron';

const { ipcRenderer } = electron;
const { execFile } = require('child_process');

const getJavaConfig = (dataSource) => {
  const dataSourceConfig = _object.get(dataSource, 'profile.javaConfig', {});
  if (!dataSourceConfig.JAVA_HOME) {
    dataSourceConfig.JAVA_HOME = process.env.JAVA_HOME || process.env.JER_HOME || '';
  }
  return dataSourceConfig;
};

const getParam = (params) => {
  const paramArray = [];
  Object.keys(params).forEach((pro) => {
    paramArray.push(params[pro]);
  });
  return paramArray;
};

export const execJar = (dataSource, params = {}, cb) => {
  const configData =  getJavaConfig(dataSource);
  const value = configData.JAVA_HOME;
  const split = process.platform === 'win32' ? '\\' : '/';
  const defaultPath = ipcRenderer.sendSync('jarPath');
  const jar = configData.DB_CONNECTOR || defaultPath;
  const tempValue = value ? `${value}${split}bin${split}java` : 'java';
  execFile(tempValue,
    [
      '-Dfile.encoding=utf-8',
      '-cp', jar, 'group.rober.pdman.doc.App',
      ...getParam(params),
    ],
    (error, stdout, stderr) => {
      cb && cb(error, stdout, stderr);
    });
};
