import React from 'react';
import ReactDom from 'react-dom';
import _object from 'lodash/object';
import * as Utils from './TableUtils';
import { uuid } from '../../../utils/uuid';
import { moveArrayPosition, moveArrayPositionByFuc } from '../../../utils/array';
import { getCodeByDataTable } from '../../../utils/json2code';
import * as Com from '../../../components';

import './style/index.less';

const { Icon, Input, TextArea, Modal, Message, openModal } = Com;
const clipboard = require('electron').clipboard;
// 数据表详情界面
// 数据在本页面维护，通过保存按钮更新dataSource
class Table extends React.Component{
  static Utils = Utils;
  constructor(props){
    super(props);
    const values = props.value.split('&');
    this.currentTable = values[2];
    this.state = {
      dataTable: this._initTableData(values[1], values[2]),
      module: values[1],
      table: values[2],
      tabShow: 'summary',
      selectedTrs: [],
      height: 'calc(100% - 110px)',
    };
    this.inputInstance = [];
  }
  componentDidMount(){
    this.dom = ReactDom.findDOMNode(this.instance);
    /* eslint-disable */
    this.setState({
      height: this.dom.getBoundingClientRect().height - 140,
    });
  }
  getAllTable = () => {
    const { dataSource } = this.props;
    return (dataSource.modules || []).reduce((a, b) => {
      return a.concat((b.entities || []));
    }, []);
  };
  getName = () => {
    return this.state.table;
  };
  _initTableData = (module, table) => {
    const { copy } = this.props;
    let tempDataTable = {
      title: table,
      fields: [],
    };
    // 查找该表是否存在
    const tableData = this.getAllTable().filter(data => data.title === table)[0];
    if (!tableData) {
      // 不存在，则检查是否带有copy参数
      if (copy) {
        const copyTableData = this.getAllTable().filter(data => data.title === copy)[0];
        if (copyTableData) {
          tempDataTable = {...copyTableData};
        }
      }
    } else {
      tempDataTable = {...tableData};
    }
    return this._initColumnOrder({
      ...tempDataTable,
      fields: (tempDataTable.fields || []).map(field => ({...field, key: `${uuid()}-${field.name}`})),
    });
  };
  _initColumnOrder = (dataTable) => {
    // 初始化列的顺序、列在关系图中的显示
    // 返回原引用，否则会影响后续的引用比较
    const tempDataTable = dataTable;
    const { columnOrder } = this.props;
    const headers = (dataTable.headers || []);
    const headerNames = headers.map(header => header.fieldName);
    // 1.获取当前表的列，检查是否完整并补充
    columnOrder.forEach((column) => {
      if (!headerNames.includes(column.code)) {
        headers.push({
          fieldName: column.code,
          relationNoShow: column.relationNoShow,
        });
      }
    });
    tempDataTable.headers = headers;
    return tempDataTable;
  };
  _saveData = (data, module, table, value) => {
    if (table) {
      this.module = module;
      this.table = table;
      this.value = value;
      this.setState({
        table: value,
      });
    }
    this.setState({
      dataTable: data,
    });
  };
  _deleteKey = (dataTable) => {
    return {
      ...dataTable,
      fields: (dataTable.fields || []).map(field => _object.omit(field, ['key'])),
    };
  };
  // 执行保存的时候，清除节点的copy属性
  save = (cb) => {
    const { dataSource } = this.props;
    const { dataTable, module, table } = this.state;
    if (!table) {
      Modal.error({title: '保存失败', message: '代码不能为空', width: 200});
    } else {
      const currTable = this._deleteKey(dataTable);
      if (table.includes('/') || table.includes('&') || table.includes(':')) {
        Modal.error({title: '保存失败', message: '数据表名不能包含/或者&或者:', width: 300});
        cb('error');
      } else if (currTable.fields && currTable.fields
        .some(filed => filed.name.includes('/') || filed.name.includes('&') || filed.name.includes(':'))) {
        Modal.error({title: '保存失败', message: '属性名不能包含/或者&或者:', width: 300});
        cb('error');
      } else {
        const { project, saveProjectSome, updateTabs, id } = this.props;
        const moduleData = (dataSource.modules || []).filter(mo => mo.name === module)[0];
        saveProjectSome(`${project}.pdman.json`, {
          graphCanvas: {
            ...(moduleData.graphCanvas || {}),
            nodes: _object.get(moduleData, 'graphCanvas.nodes', []).map((node) => {
              if (node.id === id) {
                return {
                  ..._object.omit(node, 'copy'),
                };
              }
              return node;
            }),
          },
        }, () => {
          saveProjectSome(`${project}.pdman.json`, currTable, () => {
              this.module && this.table && updateTabs
              && updateTabs(this.module, this.currentTable, this.value);
              cb();
            }, this.table && this.value && {oldName: this.currentTable, newName: this.value},
            `${module}/entities/${this.currentTable}`);
        }, undefined, `${module}/graphCanvas`);
      }
    }
  };
  _deleteField = () => {
    const { dataTable, selectedTrs } = this.state;
    // 获取上一行
    let tempFields = [...(dataTable.fields || [])];
    const minIndex = Math.min(...tempFields
      .map((field, index) => {
        if (selectedTrs.includes(field.key)) {
          return index;
        }
        return null;
      }).filter(field => field !== null));
    const newFields = (dataTable.fields || []).filter(fid => !selectedTrs.includes(fid.key));
    this._saveData({
      ...dataTable,
      fields: newFields,
    });
    const selectField = newFields[(minIndex - 1) < 0 ? 0 : minIndex - 1];
    this.setState({
      selectedTrs: (selectField && [selectField.key]) || [],
    });
  };
  _checkUntitledName = (name) => {
    if (!name.split('untitled')[1]) {
      return `${name}1`;
    }
    return `untitled${parseInt(name.split('untitled')[1] || 0, 10) + 1}`;
  };
  _getFieldName = (fields = [], name) => {
    if (fields.some(field => field.name === name)) {
      return this._getFieldName(fields, this._checkUntitledName(name));
    }
    return name;
  };
  _addField = (type) => {
    const { dataTable, selectedTrs } = this.state;
    const { dataSource } = this.props;
    const dataTypes = _object.get(dataSource, 'dataTypeDomains.datatype', []);
    const fieldName = this._getFieldName(dataTable.fields, 'untitled');
    const tempFields = [...(dataTable.fields || [])];
    const selectedTrsIndex = tempFields
      .map((field, index) => {
        if (selectedTrs.includes(field.key)) {
          return index;
        }
        return null;
      }).filter(field => field !== null);
    const newField = {
      name: fieldName,
      type: dataTypes[0].code,
      remark: '',
      chnname: '',
      key: `${uuid()}-${fieldName}`,
    };
    if (type && selectedTrsIndex.length > 0) {
      tempFields.splice(Math.max(...selectedTrsIndex) + 1, 0, newField);
    } else {
      tempFields.push(newField);
    }
    this._saveData({
      ...dataTable,
      fields: tempFields,
    });
  };
  _inputOnChange = (e, key, type) => {
    // console.log(e, module, table, tempField, type);
    let notNull = {};
    if (type === 'pk') {
      notNull = {
        notNull: e.target.value,
      };
    }
    const { dataTable } = this.state;
    this._saveData({
      ...dataTable,
      fields: (dataTable.fields || []).map((field) => {
        if (field.key === key) {
          return {
            ...field,
            [type]: e.target.value,
            ...notNull,
          };
        }
        return field;
      }),
    });
  };
  _checkBoxOnChange = (e, fieldName) => {
    const { dataTable } = this.state;
    this._saveData({
      ...dataTable,
      headers: (dataTable.headers || []).map((header) => {
        if (header.fieldName === fieldName) {
          return {
            ...header,
            relationNoShow: e.target.value,
          };
        }
        return header;
      }),
    });
  };
  _tableNameOnChange = (e, module, table) => {
    const { dataTable } = this.state;
    this._saveData({
      ...dataTable,
      title: e.target.value,
    }, module, table, e.target.value);
  };
  _inputTableOnChange = (e, name) => {
    const { dataTable } = this.state;
    this._saveData({
      ...dataTable,
      [name]: e.target.value,
    });
  };
  _getTableSummary  = (table, name) => {
    const { dataTable } = this.state;
    return dataTable && dataTable[name] || '';
  };
  _tabClick = (type) => {
    this.setState({
      tabShow: type,
    });
  };
  _onDragStart = (e, value) => {
    e.stopPropagation();
    e.dataTransfer.setData('Text', value);
  };
  _onDrop = (e, index) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('Text');
    const { dataTable } = this.state;
    this._saveData({
      ...dataTable,
      fields: moveArrayPosition(dataTable.fields, data, index),
    });
  };
  _onDragOver = (e) => {
    e.preventDefault();
  };
  _trClick = (e, key) => {
    e.stopPropagation();
    e.preventDefault();
    const { selectedTrs } = this.state;
    let tempSelectedTrs = [...selectedTrs];
    if (tempSelectedTrs.some(tr => tr === key)) {
      tempSelectedTrs = e.shiftKey ? tempSelectedTrs.filter(tr => tr !== key) : [];
    } else {
      e.shiftKey ? tempSelectedTrs.push(key) : tempSelectedTrs = [key];
    }
    this.setState({
      selectedTrs: tempSelectedTrs,
    });
  };
  _checkFields = (data) => {
    if (Array.isArray(data)) {
      const names = ['name', 'type', 'remark', 'chnname', 'pk', 'relationNoShow', 'key', 'notNull'];
      return data.every(d => d.name && typeof d.name === 'string')
        && data.every(d => Object.keys(d).every(name => names.includes(name)));
    }
    return false;
  };
  _checkFieldName = (fields, field) => {
    if (fields.includes(field)) {
      return this._checkFieldName(fields, `${field}1`);
    }
    return field;
  };
  _onKeyDown = (e, tableData) => {
    // c 67
    // v 86
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      if (e.ctrlKey || e.metaKey) {
        const { selectedTrs, dataTable } = this.state;
        if (e.keyCode === 67) {
          const { fields = [] } = tableData;
          const clipboardData = fields
            .filter(field => selectedTrs.includes(field.key))
            .map(field => ({...field, key: `${uuid()}-${field.name}`}));
          if (clipboardData.length === 0) {
            Modal.error({title: '复制无效', message: '未选中属性', width: 200});
            return;
          }
          clipboard.writeText(JSON.stringify(clipboardData));
          Com.Message.success({title: '数据表列已经成功复制到粘贴板'});
        } else if(e.keyCode === 86) {
          try {
            const tempData = JSON.parse(clipboard.readText());
            if (this._checkFields(tempData)) {
              const fieldNames = (dataTable.fields || []).map(field => field.name);
              const copyFields = tempData.map((field) => {
                const name = this._checkFieldName(fieldNames, field.name);
                return {
                  ...field,
                  name: name,
                  key: `${uuid()}-${field.name}`,
                };
              });
              const tempFields = dataTable.fields || [];
              if (selectedTrs && selectedTrs.length > 0) {
                const selectedTrsIndex = tempFields
                  .map((field, index) => {
                    if (selectedTrs.includes(field.key)) {
                      return index;
                    }
                    return null;
                  }).filter(field => field !== null);
                const maxIndex = Math.max(...selectedTrsIndex);
                tempFields.splice(maxIndex + 1, 0, ...copyFields);
              } else {
                tempFields.push(...copyFields);
              }
              this._saveData({
                ...dataTable,
                fields: tempFields,
              });
            } else {
              Modal.error({title: '粘贴失败', message: '无效的数据', width: 200});
            }
          } catch (err) {
            console.log(err);
            Modal.error({title: '粘贴失败', message: '无效的数据', width: 200});
          }
        }
      }
    } else if (e.keyCode === 40 || e.keyCode === 38){
      // 处理键盘上下箭头，判断光标是在最前还是最后
      if ((e.target.selectionEnd === (e.target.value && e.target.value.length))
        || (e.target.selectionEnd === 0)) {
        // 当前所在的坐标;
        const x = this.inputPosition.x;
        const y = this.inputPosition.y;
        //let dom = null;
        if (e.keyCode === 38 && y - 1 > -1) {
          // 将光标放置上一行
          //dom = ReactDom.findDOMNode(this.inputInstance[y - 1][x].focus());
          this.inputInstance[y - 1][x].select();
        } else if (e.keyCode === 40 && y + 1 < this.inputInstance.length){
          // 将光标放置下一行
          this.inputInstance[y + 1][x].select();
          //dom = ReactDom.findDOMNode(this.inputInstance[y + 1][x]);
        }
        //console.log(dom);
        //dom && dom.focus();
      }
    }
  };
  _onFocus = (trIndex, tdIndex) => {
    this.inputPosition = {
      x: tdIndex,
      y: trIndex,
    };
  };
  _columnClick = (type, index) => {
    const { dataTable } = this.state;
    const headers = dataTable.headers;
    const changeIndex = type === 'left' ? index - 1 : index + 1;
    const changeHeader = headers[changeIndex];
    const selectHeader = headers[index];
    this._saveData({
      ...dataTable,
      headers: headers.map((header, headerIndex) => {
        if (headerIndex === index) {
          return changeHeader;
        } else if (headerIndex === changeIndex) {
          return selectHeader;
        }
        return header;
      }),
    });
  };
  _moveField = (type) => {
    const { dataTable, selectedTrs } = this.state;
    let tempFields = [...(dataTable.fields || [])];
    const selectedTrsIndex = tempFields
      .map((field, index) => {
        if (selectedTrs.includes(field.key)) {
          return index;
        }
        return null;
      }).filter(field => field !== null);
    const maxIndex = Math.max(...selectedTrsIndex);
    const minIndex = Math.min(...selectedTrsIndex);
    let changeIndex = type === 'up' ? minIndex - 1 : maxIndex + 1;
    if (changeIndex >= 0 && changeIndex <= tempFields.length - 1) {
      // 获取将要插入位置的属性
      // const changeField = tempFields[changeIndex];
      // 循环移动每一条数据
      selectedTrsIndex.map(fieldIndex => ({
        fieldIndex,
        from: tempFields[fieldIndex],
        to: tempFields[type === 'up' ? fieldIndex - 1 : fieldIndex + 1]
      })).sort((a, b) => type === 'up' ? a.fieldIndex - b.fieldIndex : b.fieldIndex - a.fieldIndex)
        .forEach((field) => {
          tempFields = moveArrayPositionByFuc(
            tempFields,  (f) => {
              return f.key === field.from.key;
            }, type === 'up' ? field.fieldIndex - 1 : field.fieldIndex + 1);
        });
      this._saveData({
        ...dataTable,
        fields: tempFields,
      });
    }
  };
  _relationNoShowClick = (e, key, code, value) => {
    if (key) {
      // 修改属性的显示状态
      this._inputOnChange({
        ...e,
        target: {
          ...e.target,
          value,
        },
      }, key, code);
    } else {
      // 修改列的显示状态
      this._checkBoxOnChange({
        ...e,
        target: {
          ...e.target,
          value,
        },
      }, code);
    }
  };
  _codesTabClick = (code) => {
    this.setState({
      codesTabShow: code,
    });
  };
  _getTableCode = (code) => {
    const { dataSource } = this.props;
    const { dataTable, module } = this.state;
    return getCodeByDataTable(dataSource, module, dataTable, code);
  };
  _getStyle = (code) => {
    let minWidth = '';
    let width = '';
    if (code === 'remark') {
      minWidth = 'calc(100% - 20px)';
      width = 'calc(100% - 20px)';
    } else {
      minWidth = code === 'name' ? 200 : '100%';
      width = (code !== 'pk' && code !== 'notNull' && code !== 'autoIncrement') ? '100%' : 'auto';
    }
    return {
      minWidth,
      width,
    };
  };
  _openRemark = (value, key) => {
    let tempValue = value;
    const remarkChange = (e) => {
      tempValue = e.target.value;
    };
    openModal(
      <TextArea
        style={{height: 150, width: '100%'}}
        defaultValue={tempValue}
        onChange={e => remarkChange(e)}
      />,
      {
        title: '备注详情',
        onOk: (modal) => {
          modal && modal.close();
          this._inputOnChange({
            target: {
              value: tempValue,
            },
          }, key, 'remark');
        },
      },
    );
  };
  _getDefaultDataType = (type) => {
    const { dataSource } = this.props;
    const database = _object.get(dataSource, 'dataTypeDomains.database', []);
    const datatype = _object.get(dataSource, 'dataTypeDomains.datatype', []);
    const defaultDatabase = database.filter(db => db.defaultDatabase)[0];
    const dbCode = defaultDatabase.code || database[0].code || '';
    if (dbCode) {
      const current = datatype.filter(dt => dt.code === type)[0] || {};
      const apply = current.apply || {};
      return (apply[dbCode] && apply[dbCode].type) || '';
    }
    return '';
  };
  render(){
    const { module, table, selectedTrs, dataTable, codesTabShow, height } = this.state;
    const headers = dataTable.headers;
    const { prefix = 'pdman', dataSource, columnOrder } = this.props;
    const database = _object.get(dataSource, 'dataTypeDomains.database', []);
    const dataTypes = _object.get(dataSource, 'dataTypeDomains.datatype', []);
    const currentCode = codesTabShow || (database[0] && database[0].code) || '';
    return (<div className={`${prefix}-data-table`} ref={instance => this.instance = instance}>
      <div className={`${prefix}-data-table-title`}>
        <Icon type="fa-table" style={{marginRight: 5}}/>
        {`${module}/${table}/数据表详情`}
      </div>
      <div
        style={{overflow: 'auto'}}
        className={`${prefix}-data-table-content`}
      >
        <div className={`${prefix}-data-table-content-tab`}>
          <div
            onClick={() => this._tabClick('summary')}
            className={`${prefix}-data-table-content-tab${this.state.tabShow === 'summary' ? '-selected' : '-unselected'}`}
          >基本信息</div>
          <div
            onClick={() => this._tabClick('fields')}
            className={`${prefix}-data-table-content-tab${this.state.tabShow === 'fields' ? '-selected' : '-unselected'}`}
          >字段信息</div>
          <div
            onClick={() => this._tabClick('codes')}
            className={`${prefix}-data-table-content-tab${this.state.tabShow === 'codes' ? '-selected' : '-unselected'}`}
          >代码信息
          </div>
        </div>
        <div style={{
          height: height,
          overflow: 'auto',
        }}>
          <div
            className={`${prefix}-data-table-content-summary`}
            style={{
              display: this.state.tabShow === 'summary' ? '' : 'none',
            }}>
            <div>
              <span>名称</span>
              <Input
                wrapperStyle={{width: 'calc(100% - 80px)'}}
                style={{height: 23, width: '100%'}}
                value={this._getTableSummary(table, 'chnname')}
                onChange={e => this._inputTableOnChange(e, 'chnname')}
              />
            </div>
            <div>
              <span>代码</span>
              <Input
                wrapperStyle={{width: 'calc(100% - 80px)'}}
                style={{height: 23, width: '100%'}}
                value={table}
                onChange={e => this._tableNameOnChange(e, module, this.currentTable)}
              />
            </div>
            <div>
              <span>名字模板</span>
              <Input
                wrapperStyle={{width: 'calc(100% - 80px)'}}
                style={{height: 23, width: '100%'}}
                value={this._getTableSummary(table, 'nameTemplate') || '{code}[{name}]'}
                onChange={e => this._inputTableOnChange(e, 'nameTemplate')}
              />
            </div>
            <div>
              <span>备注</span>
              <TextArea
                wrapperStyle={{width: 'calc(100% - 80px)'}}
                style={{height: 150, width: '100%'}}
                value={this._getTableSummary(table, 'remark')}
                onChange={e => this._inputTableOnChange(e, 'remark')}
              />
            </div>
          </div>
          <div style={{display: this.state.tabShow === 'fields' ? '' : 'none', height: height}}>
            <div className={`${prefix}-data-table-content-table-opt-icon`}>
              <Icon
                onClick={() => selectedTrs.length !== 0 && this._moveField('up')}
                className={selectedTrs.length === 0 ? `${prefix}-data-table-content-table-disabled-icon` :
                  `${prefix}-data-table-content-table-normal-icon`}
                type="fa-long-arrow-up"
              />
              <Icon
                onClick={() => selectedTrs.length !== 0 && this._moveField('bottom')}
                className={selectedTrs.length === 0 ?
                  `${prefix}-data-table-content-table-disabled-icon`
                  : `${prefix}-data-table-content-table-normal-icon`}
                type="fa-long-arrow-down"
              />
              <Icon
                onClick={() => selectedTrs.length !== 0 && this._deleteField()}
                className={selectedTrs.length === 0 ?
                  `${prefix}-data-table-content-table-disabled-icon`
                  : `${prefix}-data-table-content-table-normal-icon`}
                type="fa-minus"
              />
              <Icon
                onClick={() => this._addField('field')}
                className={`${prefix}-data-table-content-table-normal-icon`}
                type="fa-plus"
              />
              <Icon
                className={`${prefix}-data-table-content-table-normal-icon`}
                onClick={() => this.save((err) => {
                  if (!err) {
                    Message.success({title: '保存成功'});
                  } else {
                    Modal.error({title: '保存失败', message: '保存失败', width: 100});
                  }
                })}
                type='fa-save'
              />
            </div>
            <div style={{height: typeof height !== 'string' ? height - 40 : height, overflow: 'auto'}}>
              <table
                tabIndex="0"
                onKeyDown={e => this._onKeyDown(e, dataTable)}
                className={`${prefix}-data-table-content-table`}
              >
                <tbody>
                  <tr className={`${prefix}-data-table-content-table-first-tr`}>
                    <th>{}</th>
                    {
                      headers.map((header, index) => {
                        const column = columnOrder.filter(c => c.code === header.fieldName)[0];
                        const showLeft = index === 0 ? 'none' : '';
                        const showRight = index === headers.length - 1 ? 'none' : '';
                        return (<th key={column.code}>
                          <div>
                            <Icon
                              onClick={() => this._columnClick('left', index)}
                              type='arrowleft'
                              style={{display: showLeft}}
                            />
                            <div>
                              {column.value}
                              {
                                column.code !== 'relationNoShow' &&
                                <Icon
                                  style={{ marginLeft: 5 }}
                                  type={header.relationNoShow ? 'fa-eye-slash' : 'fa-eye'}
                                  onClick={e => this._relationNoShowClick(e, '', column.code, !header.relationNoShow)}
                                  title='是否在关系图中显示'
                                />}
                            </div>
                            <Icon
                              onClick={() => this._columnClick('right', index)}
                              type='arrowright'
                              style={{display: showRight}}
                            />
                          </div>
                        </th>);
                      })
                    }
                  </tr>
                  {
                    (dataTable && dataTable.fields || []).map((field, index) => (
                      <tr
                        onClick={e => this._trClick(e, field.key)}
                        draggable
                        onDragStart={e => this._onDragStart(e, index)}
                        onDrop={e => this._onDrop(e, index, dataTable)}
                        onDragOver={this._onDragOver}
                        className={`${prefix}-data-table-content-table-normal-tr
                      ${selectedTrs.some(tr => tr === field.key) ? `${prefix}-data-table-content-table-selected-tr` : ''}`}
                        key={field.key}
                      >
                        <th style={{width: 35, userSelect: 'none'}}>{index + 1}</th>
                        {
                          headers.map((header, rowIndex) => {
                            const column = columnOrder.filter(c => c.code === header.fieldName)[0];
                            const ThCom = Com[column.com || 'Input'] || Input;
                            if (column.com === 'Icon') {
                              return (
                                <th key={`${column.code}-${field.key}`}>
                                  <ThCom
                                    style={{cursor: 'pointer'}}
                                    type={field[column.code] ? 'fa-eye-slash' : 'fa-eye'}
                                    onClick={e => this._relationNoShowClick(e,
                                      field.key, column.code, !field[column.code])}
                                    title='是否在关系图中显示'
                                  />
                                </th>
                              );
                            }
                            return (
                              <th key={`${column.code}-${field.key}`}>{
                                <ThCom
                                  //disabled={(column.code === 'notNull') && field.pk}
                                  suffix={column.code === 'remark' ?
                                    <span onClick={() => this._openRemark(field[column.code], field.key)}>...</span> : ''}
                                  ref={(instance) => {
                                    if (column.com === 'Input') {
                                      if (!this.inputInstance[index]) {
                                        this.inputInstance[index] = [];
                                      }
                                      this.inputInstance[index][rowIndex] = instance;
                                    }
                                  }}
                                  onFocus={() => column.com === 'Input' && this._onFocus(index, rowIndex)}
                                  onChange={e => this._inputOnChange(e, field.key, column.code)}
                                  value={column.code === 'dataType' ?
                                    this._getDefaultDataType(field.type) : field[column.code]}
                                  style={{
                                    height: (column.code !== 'pk' && column.code !== 'notNull' && column.code !== 'autoIncrement') ? 23 : 15,
                                    ...this._getStyle(column.code)
                                  }}
                                >
                                  {
                                    column.code === 'type' && column.com === 'Select' && (
                                      dataTypes.concat({
                                        name: '--请选择--',
                                        code: '',
                                      })
                                        .map(dataType =>
                                          (
                                            <option
                                              value={dataType.code}
                                              key={dataType.code}
                                            >
                                              {dataType.name}
                                            </option>
                                          ))
                                    )
                                  }
                                </ThCom>
                              }</th>);
                          })
                        }
                        {/*<th>
                        <Input
                          ref={(instance) => {
                            if (!this.inputInstance[index]) {
                              this.inputInstance[index] = [];
                            }
                            this.inputInstance[index][0] = instance;
                          }}
                          onFocus={() => this._onFocus(index, 0)}
                          onChange={e => this._inputOnChange(e, field.name, 'name')}
                          value={field.name}
                          style={{height: 23}}
                        />
                      </th>
                      <th>
                        <Input
                          ref={instance => this.inputInstance[index][1] = instance}
                          onFocus={() => this._onFocus(index, 1)}
                          onChange={e => this._inputOnChange(e, field.name, 'chnname')}
                          value={field.chnname}
                          style={{height: 23}}
                        />
                      </th>
                      <th>
                        <Select
                          onChange={e => this._inputOnChange(e, field.name, 'type')}
                          style={{height: 23}}
                          value={field.type}
                        >
                          {
                            dataTypes
                              .map(dataType =>
                                (
                                  <option
                                    value={dataType.code}
                                    key={dataType.code}
                                  >
                                    {dataType.name}
                                  </option>
                                ))
                          }
                        </Select>
                      </th>
                      <th>
                        <Input
                          ref={instance => this.inputInstance[index][2] = instance}
                          onFocus={() => this._onFocus(index, 2)}
                          onChange={e => this._inputOnChange(e, field.name, 'remark')}
                          value={field.remark}
                          style={{height: 23}}
                        />
                      </th>
                      <th>
                        <Checkbox
                          onClick={e => this._inputOnChange(e, field.name, 'pk')}
                          defaultChecked={field.pk}
                          style={{height: 23}}
                        />
                      </th>
                      <th>
                        <Checkbox
                          onClick={e => this._inputOnChange(e, field.name, 'relationNoShow')}
                          defaultChecked={field.relationNoShow}
                          style={{height: 23}}
                        />
                      </th>*/}
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div style={{display: this.state.tabShow === 'codes' ? '' : 'none', height: height}}>
            <div className={`${prefix}-data-table-content-tab-code`}>
              {
                // 根据数据库的数量来生成数据类型
                database.map(db => (
                  <div
                    key={`${db.code}`}
                    onClick={() => this._codesTabClick(db.code)}
                    className={`${prefix}-data-table-content-tab${currentCode === db.code ? '-selected' : '-unselected'}`}
                  >{db.code}
                  </div>
                ))
              }
            </div>
            <div style={{height: typeof height !== 'string' ? height - 50 : height, overflow: 'auto'}}>
              {
                database.map(db => (
                  <div
                    key={`${db.code}-code`}
                    style={{display: currentCode === db.code ? '' : 'none'}}
                  >
                    <div>
                      <Com.Code
                        language={db.code !== 'Java' ? 'SQL' : 'Java'}
                        style={{minHeight: 300, width: '100%'}}
                        data={this._getTableCode(db.code)}
                      />
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
}

export default Table;
