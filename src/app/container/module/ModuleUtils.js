import React from 'react';
import _object from 'lodash/object';
// import * as json from '../../../utils/json';
import { openModal, Input, Modal } from '../../../components';

const clipboard = require('electron').clipboard;

const getAllTable = (dataSource) => {
  return (dataSource.modules || []).reduce((a, b) => {
    return a.concat((b.entities || []).map(entity => entity.title));
  }, []);
};
const validateModule = (data) => {
  let flag = false;
  if (data.name && typeof data.name === 'string') {
    if (data.entities && Array.isArray(data.entities)) {
      flag = true;
    } else {
      flag = false;
    }
    if (data.graphCanvas && typeof data.graphCanvas === 'object') {
      flag = true;
    } else {
      flag = false;
    }
  }
  return flag;
};
const validateModuleAndNewName = (modules = [], name) => {
  if (modules.some(module => module === name)) {
    return validateModuleAndNewName(modules, `${name}-副本`);
  }
  return name;
};

export const addModule = (dataSource, cb) => {
  // 新增模块
  // 1.弹窗输入信息
  // 2.保存输入的信息，触发回调
  let tempModuleName = '';
  let flag = true;
  const onChange = (e) => {
    tempModuleName = e.target.value;
  };
  const modules = (dataSource.modules || []).map(module => module.name);
  const validate = () => {
    const resultName = validateModuleAndNewName(modules, tempModuleName);
    flag = true;
    if (resultName !== tempModuleName) {
      flag = false;
      return '模块名已经存在了';
    } else if (!tempModuleName) {
      flag = false;
      return '模块名不能为空';
    }
    return '';
  };
  openModal(<div>
    <Input autoFocus onChange={onChange} style={{width: '100%'}} validate={validate}/>
  </div>, {
    title: 'PDMan-新增模块',
    onOk: (modal) => {
      // 1.修改dataSource
      if (!tempModuleName) {
        Modal.error({title: '新增失败', message: '模块名不能为空'});
      } else if(tempModuleName.includes('/') || tempModuleName.includes('&') || tempModuleName.includes(':')) {
        Modal.error({title: '新增失败', message: '模块名不能包含/或者&或者:'});
      } else {
        tempModuleName && flag && modal && modal.close();
        tempModuleName && flag && cb && cb({
          ...dataSource,
          modules: (dataSource.modules || []).concat({
            name: tempModuleName,
            entities: [],
            graphCanvas: {},
          }),
        });
      }
    },
  });
};

export const renameModule = (oldName, dataSource, cb) => {
  // 模块重命名
  let tempModuleName = oldName;
  const onChange = (e) => {
    tempModuleName = e.target.value;
  };
  const modules = (dataSource.modules || []).map(module => module.name);
  let flag = true;
  const validate = () => {
    const resultName = validateModuleAndNewName(modules, tempModuleName);
    flag = true;
    if (resultName !== tempModuleName) {
      flag = false;
      return '模块名已经存在了';
    } else if (!tempModuleName) {
      flag = false;
      return '模块名不能为空';
    }
    return '';
  };
  openModal(<div>
    <Input autoFocus onChange={onChange} style={{ width:'100%' }} validate={validate} defaultValue={oldName}/>
  </div>, {
    title: 'PDMan-重命名模块',
    onOk: (modal) => {
      // 1.修改dataSource
      if (tempModuleName === oldName) {
        Modal.error({title: '重命名失败', message: '模块名不能与旧名相同'});
      } else if (tempModuleName.includes('/') || tempModuleName.includes('&') || tempModuleName.includes(':')) {
        Modal.error({title: '重命名失败', message: '模块名不能包含/或者&或者:'});
      } else {
        flag && modal && modal.close();
        flag && cb && cb({
          ...dataSource,
          modules: (dataSource.modules || []).map((module) => {
            if (module.name === oldName) {
              return {
                ...module,
                name: tempModuleName,
              };
            }
            return {
              ...module,
            };
          }),
        });
      }
    },
  });
};

export const deleteModule = (name, dataSource, cb) => {
  // 删除模块
  cb && cb({
    ...dataSource,
    modules: (dataSource.modules || []).filter(module => module.name !== name),
  });
};

export const copyModule = (name, dataSource) => {
  // 复制模块
  clipboard.writeText(JSON.stringify((dataSource.modules || [])
    .filter(module => module.name === name)[0]));
};

export const cutModule = (name, dataSource) => {
  // 剪切模块
  clipboard.writeText(JSON.stringify((dataSource.modules || [])
    .filter(module => module.name === name)
    .map(module => ({...module, rightType: 'cut'}))[0]));
};

export const pasteModule = (dataSource, cb) => {
  // 粘贴模块
  let data = {};
  try {
    data = JSON.parse(clipboard.readText());
  } catch (err) {
    console.log('数据格式错误，无法粘贴', err);
  }
  // 判断粘贴板的数据是否符合模块的格式
  if (validateModule(data)) {
    cb && cb({
      ...dataSource,
      modules: (dataSource.modules || [])
        .filter(module => !(data.rightType === 'cut' && module.name === data.name))
        .concat({
        ..._object.omit(data, ['rightType']),
        name: validateModuleAndNewName(
          (dataSource.modules || []).map(module => module.name)
            .filter(module => !(data.rightType === 'cut' && module === data.name)), data.name),
        entities: (data.entities || []).map(entity => ({
          ...entity,
          title: validateModuleAndNewName(getAllTable(dataSource), entity.title),
        })),
      }),
    });
  } else {
    console.log('无效的数据格式');
  }
};
