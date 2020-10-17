import _object from 'lodash/object';
import { compareStringVersion } from './string';

const getAllTable = (dataSource) => {
  return (dataSource.modules || []).reduce((a, b) => {
    return a.concat((b.entities || []));
  }, []);
};

const compareField = (currentField, checkField, table) => {
  const changes = [];
  Object.keys(currentField).forEach((name) => {
    if (checkField[name] !== currentField[name]) {
      changes.push({
        type: 'field',
        name: `${table.title}.${currentField.name}.${name}`,
        opt: 'update',
        changeData: `${checkField[name]}=>${currentField[name]}`,
      });
    }
  });
  return changes;
};
const compareIndex = (currentIndex, checkIndex, table) => {
  const changes = [];
  Object.keys(currentIndex).forEach((name) => {
    if (checkIndex[name] !== currentIndex[name]) {
      changes.push({
        type: 'index',
        name: `${table.title}.${currentIndex.name}.${name}`,
        opt: 'update',
        changeData: `${checkIndex[name]}=>${currentIndex[name]}`,
      });
    }
  });
  return changes;
};
const compareStringArray = (currentFields, checkFields, title, name) => {
  const changes = [];
  currentFields.forEach((f) => {
    if (!checkFields.includes(f)) {
      changes.push({
        type: 'index',
        name: `${title}.${name}.fields.${f}`,
        opt: 'update',
        changeData: `addField=>${f}`,
      });
    }
  });
  checkFields.forEach((f) => {
    if (!currentFields.includes(f)) {
      changes.push({
        type: 'index',
        name: `${title}.${name}.fields.${f}`,
        opt: 'update',
        changeData: `deleteField=>${f}`,
      });
    }
  });
  return changes;
};
const compareIndexs = (currentTable, checkTable) => {
  const changes = [];
  const currentIndexs = currentTable.indexs || [];
  const checkIndexs = checkTable.indexs || [];
  const checkIndexNames = checkIndexs.map(index => index.name);
  const currentIndexNames = currentIndexs.map(index => index.name);
  currentIndexs.forEach((cIndex) => {
    if (!checkIndexNames.includes(cIndex.name)) {
      changes.push({
        type: 'index',
        name: `${currentTable.title}.${cIndex.name}`,
        opt: 'add',
      });
    } else {
      const checkIndex = checkIndexs.filter(c => c.name === cIndex.name)[0] || {};
      changes.push(...compareIndex(_object.omit(cIndex, ['fields']),
        _object.omit(checkIndex, ['fields']), currentTable));
      // 比较索引中的属性
      const checkFields = checkIndex.fields || [];
      const currentFields = cIndex.fields || [];
      changes.push(...compareStringArray(
        currentFields, checkFields, currentTable.title, cIndex.name));
    }
  });
  checkIndexs.forEach((cIndex) => {
    if (!currentIndexNames.includes(cIndex.name)) {
      changes.push({
        type: 'index',
        name: `${currentTable.title}.${cIndex.name}`,
        opt: 'delete',
      });
    }
  });
  return changes;
};
const compareEntity = (currentTable, checkTable) => {
  const changes = [];
  Object.keys(currentTable).forEach((name) => {
    if (checkTable[name] !== currentTable[name]) {
      changes.push({
        type: 'entity',
        name: `${currentTable.title}.${name}`,
        opt: 'update',
        changeData: `${checkTable[name]}=>${currentTable[name]}`,
      });
    }
  });
  return changes;
};

export const checkVersionData = (dataSource1, dataSource2) => {
  // 循环比较每个模块下的每张表以及每一个字段的差异
  const changes = [];
  // 1.获取所有的表
  const currentTables = getAllTable(dataSource1);
  const checkTables = getAllTable(dataSource2);
  const checkTableNames = checkTables.map(e => e.title);
  const currentTableNames = currentTables.map(e => e.title);
  // 2.将当前的表循环
  currentTables.forEach((table) => {
    // 1.1 判断该表是否存在
    if (checkTableNames.includes(table.title)) {
      // 1.2.1 如果该表存在则需要对比字段
      const checkTable = checkTables.filter(t => t.title === table.title)[0] || {};
      // 将两个表的所有的属性循环比较
      const checkFields = (checkTable.fields || []).filter(f => f.name);
      const tableFields = (table.fields || []).filter(f => f.name);
      const checkFieldsName = checkFields.map(f => f.name);
      const tableFieldsName = tableFields.map(f => f.name);
      tableFields.forEach((field) => {
        if (!checkFieldsName.includes(field.name)) {
          changes.push({
            type: 'field',
            name: `${table.title}.${field.name}`,
            opt: 'add',
          });
        } else {
          // 比较属性的详细信息
          const checkField = checkFields.filter(f => f.name === field.name)[0] || {};
          const result = compareField(field, checkField, table);
          changes.push(...result);
        }
      });
      checkFields.forEach((field) => {
        if (!tableFieldsName.includes(field.name)) {
          changes.push({
            type: 'field',
            name: `${table.title}.${field.name}`,
            opt: 'delete',
          });
        }
      });
      // 1.2.2 其他信息
      const entityResult = compareEntity(_object.omit(table, ['fields', 'indexs', 'headers']),
        _object.omit(checkTable, ['fields', 'indexs']));
      changes.push(...entityResult);
      // 1.2.3 对比索引
      const result = compareIndexs(table, checkTable);
      changes.push(...result);
    } else {
      // 1.3 如果该表不存在则说明当前版本新增了该表
      changes.push({
        type: 'entity',
        name: table.title,
        opt: 'add',
      });
    }
  });
  // 3.将比较的表循环，查找删除的表
  checkTables.forEach((table) => {
    // 1.1 判断该表是否存在
    if (!currentTableNames.includes(table.title)) {
      // 1.2 如果该表不存在则说明当前版本删除了该表
      changes.push({
        type: 'entity',
        name: table.title,
        opt: 'delete',
      });
    }
  });
  return changes;
};

export const getCurrentVersionData = (dataSource, versions, cb) => {
  // 保存当前版本信息
  // 1.计算当前版本变化
  let checkVersion = versions.sort((a, b) => compareStringVersion(b.version, a.version))[0];
  // 读取当前版本的内容
  const currentDataSource = {...dataSource};
  // 组装需要比较的版本内容
  const changes = checkVersionData(currentDataSource, checkVersion || currentDataSource);
  cb && cb(changes, checkVersion);
};

