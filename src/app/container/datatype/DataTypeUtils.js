import React from 'react';
import _object from 'lodash/object';
import DataType from './index';
import {Modal, openModal} from '../../../components';

const clipboard = require('electron').clipboard;

const validateDataType = (dataType) => {
  let flag = false;
  if (dataType.code
    && typeof dataType.code === 'string'
    && dataType.name
    && typeof dataType.name === 'string'
  ) {
    flag = !(dataType.apply && typeof dataType.apply !== 'object');
  }
  return flag;
};

const validateDataTypeCodeAndName = (dataTypes, value) => {
  if (dataTypes.some(dataType => dataType === value)) {
    return validateDataTypeCodeAndName(dataTypes, `${value}-副本`);
  }
  return value;
};

export const addDataType = (dataSource, callBack) => {
  let tempDataType = '';
  const onChange = (value) => {
    tempDataType = value;
  };
  let flag = true;
  const validate = (result) => {
    flag = result;
  };
  openModal(<DataType onChange={onChange} dataSource={dataSource} validate={validate}/>, {
    title: 'PDMan-新增数据类型',
    onOk: (modal) => {
      // 1.修改dataSource
      if (!tempDataType || !tempDataType.code ||  !tempDataType.name) {
        Modal.error({title: '新增失败', message: '数据类型名或者数据类型码不能为空'});
      } else {
        flag && modal && modal.close();
        flag && callBack && callBack({
          ...dataSource,
          dataTypeDomains: {
            ...(dataSource.dataTypeDomains || {}),
            datatype: _object.get(dataSource, 'dataTypeDomains.datatype', []).concat(tempDataType),
          },
        });
      }
    },
  });
};

export const deleteDataType = (dataTypeCode, dataSource, callBack) => {
  let tempDataSource = dataSource;
  if (dataTypeCode) {
    tempDataSource = {
      ...tempDataSource,
      dataTypeDomains: {
        ...(tempDataSource.dataTypeDomains || {}),
        datatype: _object.get(tempDataSource, 'dataTypeDomains.datatype', [])
          .filter(dataType => dataType.code !== dataTypeCode),
      },
    };
  } else {
    tempDataSource = {
      ...tempDataSource,
      dataTypeDomains: {
        ...(tempDataSource.dataTypeDomains || {}),
        datatype: [],
      },
    };
  }
  callBack && callBack(tempDataSource);
};

export const renameDataType = (dataTypeCode, dataSource, callBack) => {
  let tempDataType = _object.get(dataSource, 'dataTypeDomains.datatype', [])
    .filter(dataType => dataType.code === dataTypeCode)[0];
  const onChange = (value) => {
    tempDataType = {
      ...tempDataType,
      ..._object.omit(value, ['apply']),
      apply: {
        ...(tempDataType.apply || {}),
        ...(value.apply || {}),
      },
    };
  };
  openModal(<DataType
    onChange={onChange}
    dataSource={dataSource}
    value={tempDataType}
  />, {
    title: 'PDMan-重命名数据类型',
    onOk: (modal) => {
      // 1.修改dataSource
      if (!tempDataType || !tempDataType.code ||  !tempDataType.name) {
        Modal.error({title: '重命名失败', message: '数据类型名或者数据类型码不能为空'});
      } else {
        modal && modal.close();
        callBack && callBack({
          ...dataSource,
          dataTypeDomains: {
            ...(dataSource.dataTypeDomains || {}),
            datatype: _object.get(dataSource, 'dataTypeDomains.datatype', [])
              .map((dataType) => {
                if (dataType.code === dataTypeCode) {
                  return tempDataType;
                }
                return dataType;
              }),
          },
        });
      }
    },
  });
};

export const copyDataType = (dataTypeCode, dataSource) => {
// 复制数据类型
  if (dataTypeCode) {
    clipboard.writeText(JSON.stringify(_object.get(dataSource, 'dataTypeDomains.datatype', [])
      .filter(dataType => dataType.code === dataTypeCode)));
  } else {
    clipboard.writeText(JSON.stringify(_object.get(dataSource, 'dataTypeDomains.datatype', [])));
  }
};

export const cutDataType = (dataTypeCode, dataSource) => {
  // 复制数据类型
  if (dataTypeCode) {
    clipboard.writeText(JSON.stringify(_object.get(dataSource, 'dataTypeDomains.datatype', [])
      .filter(dataType => dataType.code === dataTypeCode).map(dataType => ({...dataType, rightType: 'cut'}))));
  } else {
    clipboard.writeText(JSON.stringify(_object.get(dataSource, 'dataTypeDomains.datatype', [])
      .map(dataType => ({...dataType, rightType: 'cut'}))));
  }
};

export const pasteDataType = (dataSource, callBack) => {
  let data = [];
  try {
    data = JSON.parse(clipboard.readText());
  } catch (err) {
    console.log('数据格式错误，无法粘贴', err);
  }
  if (Array.isArray(data) && data.every(dataType => validateDataType(dataType))) {
    const tempsData = data.filter(d => d.rightType === 'cut').map(d => d.code);
    const hasExistData = _object.get(dataSource, 'dataTypeDomains.datatype', [])
      .filter(dataType => !tempsData.includes(dataType.code));
    const hasExistDataName = hasExistData.map(dataType => dataType.name);
    const hasExistDataCode = hasExistData.map(dataType => dataType.code);
    callBack && callBack({
      ...dataSource,
      dataTypeDomains: {
        ...(dataSource.dataTypeDomains || {}),
        datatype: hasExistData.concat(data.map(dataType => ({
            ..._object.omit(dataType, ['rightType']),
            name: validateDataTypeCodeAndName(hasExistDataName, dataType.name),
            code: validateDataTypeCodeAndName(hasExistDataCode, dataType.code),
          }))),
      },
    });
  }
};
