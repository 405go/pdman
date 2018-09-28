import React from 'react';
import _object from 'lodash/object';
import PropTypes from 'prop-types';
import * as Utils from './TableUtils';
import { uuid } from '../../../utils/uuid';
import * as Com from '../../../components';
import { getCodeByDataTable } from '../../../utils/json2code';
import { getCurrentVersionData } from '../../../utils/dbversionutils';

import TableIndexConfig from './TableIndexConfig';
import Table from './Table';

import './style/index.less';

const { Icon, Input, TextArea, Modal } = Com;
const clipboard = require('electron').clipboard;
// 数据表详情界面
class DataTable extends React.Component {
  static Utils = Utils;

  constructor(props) {
    super(props);
    const values = props.value.split('&');
    this.currentTable = values[2];
    this.state = {
      dataTable: this._initTableData(this.props.dataSource || {}, values[1], values[2]),
      tabShow: 'summary',
      module: values[1],
      table: values[2],
      templateShow: 'createTableTemplate',
      changes: [],
    };
    this.dataTable = this._initTableData(this.props.dataSource || {}, values[1], values[2], 'same');
    const split = process.platform === 'win32' ? '\\' : '/';
    getCurrentVersionData(props.dataSource, props.project, split, (changes, oldDataSource) => {
      this.setState({
        changes,
        oldDataSource,
      });
    });
  }
  componentWillReceiveProps(nextProps){
    // 如果该数据表发生了变化则将变化后的数据记录下来
    // 如果Tab页被激活，则需要有一个提示信息，是否要覆盖
    if (this.props.dataSource !== nextProps.dataSource) {
      // 整体数据发生变化
      const newModule = nextProps.value.split('&')[1];
      const newTableData =
        this._initTableData(nextProps.dataSource, newModule, this.state.table || this.currentTable, 'same');
      if (nextProps.changeDataType === 'reset') {
        this.setState({
          dataTable: this._initTableData(nextProps.dataSource,
            newModule, this.state.table || this.currentTable),
          table: newTableData.title,
          module: newModule,
        });
        return;
      }
      // 获取当前版本的变化信息
      const split = process.platform === 'win32' ? '\\' : '/';
      getCurrentVersionData(nextProps.dataSource,
        nextProps.project, split, (changes, oldDataSource) => {
        this.setState({
          changes,
          oldDataSource,
        });
      });
    }
  }
  getAllTable = () => {
    const { dataSource } = this.props;
    return (dataSource.modules || []).reduce((a, b) => {
      return a.concat((b.entities || []));
    }, []);
  };
  promiseSave = (callback) => {
    return new Promise((res, rej) => {
      this.save((err) => {
        callback && callback(err);
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
    });
  };
  save = (cb) => {
    const { dataTable, table, module } = this.state;
    if (!table) {
      if (cb) {
        cb(`数据表【${this.currentTable}】代码不能为空`);
      } else {
        Modal.error({title: '保存失败', message: `数据表【${this.currentTable}】代码不能为空`, width: 300});
      }
    } else {
      const currTable = this._deleteKey(dataTable);
      this.dataTable = currTable;
      if (table.includes('/') || table.includes('&') || table.includes(':')) {
        Modal.error({title: '保存失败', message: '数据表名不能包含/或者&或者:', width: 300});
        cb('error');
      } else if (currTable.fields && currTable.fields
        .some(filed => filed.name.includes('/') || filed.name.includes('&') || filed.name.includes(':'))) {
        Modal.error({title: '保存失败', message: '属性名不能包含/或者&或者:', width: 300});
        cb('error');
      } else {
        const { project, saveProjectSome, updateTabs } = this.props;
        saveProjectSome(`${project}.pdman.json`, currTable, () => {
            this.module && this.table && updateTabs &&
            updateTabs(this.module, this.currentTable, this.value);
            cb();
          }, this.table && this.value && {oldName: this.currentTable, newName: this.value},
          `${module}/entities/${this.currentTable}`);
      }
    }
  };
  _initColumnOrder = (dataTable) => {
    // 初始化列的顺序、列在关系图中的显示
    // 返回原引用，否则会影响后续的引用比较
    const tempDataTable = dataTable;
    const { columnOrder } = this.props;
    const headers = (dataTable && dataTable.headers || []);
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
    if (tempDataTable) {
      tempDataTable.headers = headers;
    }
    return tempDataTable;
  };
  _deleteKey = (dataTable) => {
    const tempFields = (dataTable.fields || []).map(field => _object.omit(field, ['key']));
    return {
      ...dataTable,
      fields: tempFields,
      indexs: (dataTable.indexs || []).map((field) => {
        return {
          ..._object.omit(field, ['key']),
          fields: (field.fields || []).filter(f => tempFields.map(fd => fd.name).includes(f)),
        };
      }).filter(indexData => (indexData.fields || []).length > 0),
    };
  };
  _initTableData = (dataSource, module, table, type) => {
    const moduleData = (dataSource.modules || []).filter(mo => mo.name === module)[0] || {};
    let tableData =  (moduleData.entities || []).filter(entity => entity.title === table)[0];
    if (tableData) {
      const fields = (tableData.fields || []).map(field => ({...field, key: `${uuid()}-${field.name}`}));
      const indexs = (tableData.indexs || []).map(field => ({...field, key: `${uuid()}-${field.name}`}));
      if (type !== 'same') {
        tableData = {
          ...tableData,
          fields: fields,
          indexs: indexs,
        };
      }
    }
    return this._initColumnOrder(tableData);
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
  _getTableSummary = (name) => {
    const { dataTable } = this.state;
    return dataTable && dataTable[name];
  };
  _tabClick = (type) => {
    this.setState({
      tabShow: type,
    });
  };
  _codesTabClick = (code) => {
    this.setState({
      codesTabShow: code,
    });
  };
  _getTableCode = (code, templateShow) => {
    const { dataSource } = this.props;
    const { dataTable, module, changes = [], oldDataSource } = this.state;
    // 根据模板类型的不同，传递不同的变化数据
    let tempChanges = changes.filter((c) => {
      const title = c.name.split('.')[0];
      return (templateShow === 'createFieldTemplate'
        && c.type === 'field'
        && c.opt === 'add'
        && title === dataTable.title) ||
        (templateShow === 'updateFieldTemplate'
          && c.type === 'field'
          && c.opt === 'update'
          && title === dataTable.title) ||
        (templateShow === 'deleteFieldTemplate'
          && c.type === 'field'
          && c.opt === 'delete'
          && title === dataTable.title) ||
        (templateShow === 'deleteIndexTemplate'
          && c.type === 'index'
          && c.opt === 'delete'
          && title === dataTable.title) ||
        (templateShow === 'rebuildTableTemplate'
          && c.type === 'field'
          && title === dataTable.title);
    });
    return getCodeByDataTable(dataSource, module, dataTable,
      code, templateShow, tempChanges, oldDataSource);
  };
  _update = (dataTable) => {
    this.setState({
      dataTable,
    });
  };
  _copyClick = (data) => {
    clipboard.writeText(data);
    Com.Message.success({title: '代码经成功复制到粘贴板'});
  };
  _templateTabClick = (template) => {
    this.setState({
      templateShow: template,
    });
  };
  render() {
    const { dataTable = {}, codesTabShow } = this.state;
    const { prefix = 'pdman', height, dataSource, columnOrder } = this.props;
    const { module, table } = this.state;
    const dataTypes = _object.get(dataSource, 'dataTypeDomains.datatype', []);
    const database = _object.get(dataSource, 'dataTypeDomains.database', []);
    const currentCode = codesTabShow || (database[0] && database[0].code) || '';
    return (<div className={`${prefix}-data-table`}>
      <div className={`${prefix}-data-table-title`}>
        <Icon type="fa-table" style={{marginRight: 5}}/>
        {`${module}/${table}/数据表详情`}
      </div>
      <div
        className={`${prefix}-data-table-content`}
      >
        <div className={`${prefix}-data-table-content-tab`}>
          <div
            onClick={() => this._tabClick('summary')}
            className={`${prefix}-data-table-content-tab${this.state.tabShow === 'summary' ? '-selected' : '-unselected'}`}
          >基本信息
          </div>
          <div
            onClick={() => this._tabClick('fields')}
            className={`${prefix}-data-table-content-tab${this.state.tabShow === 'fields' ? '-selected' : '-unselected'}`}
          >字段信息
          </div>
          <div
            onClick={() => this._tabClick('codes')}
            className={`${prefix}-data-table-content-tab${this.state.tabShow === 'codes' ? '-selected' : '-unselected'}`}
          >代码信息
          </div>
          <div
            onClick={() => this._tabClick('indexs')}
            className={`${prefix}-data-table-content-tab${this.state.tabShow === 'indexs' ? '-selected' : '-unselected'}`}
          >索引信息
          </div>
        </div>
        <div style={{height: height - 102, overflow: 'auto'}}>
          <div
            className={`${prefix}-data-table-content-summary`}
            style={{display: this.state.tabShow === 'summary' ? '' : 'none'}}
          >
            <div>
              <span>名称</span>
              <Input
                wrapperStyle={{width: 'calc(100% - 80px)'}}
                style={{height: 23, width: '100%'}}
                value={this._getTableSummary('chnname')}
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
                value={this._getTableSummary('nameTemplate') || '{code}[{name}]'}
                onChange={e => this._inputTableOnChange(e, 'nameTemplate')}
              />
            </div>
            <div>
              <span>备注</span>
              <TextArea
                wrapperStyle={{width: 'calc(100% - 80px)'}}
                style={{height: 150, width: '100%'}}
                value={this._getTableSummary('remark')}
                onChange={e => this._inputTableOnChange(e, 'remark')}
              />
            </div>
          </div>
          <div style={{display: this.state.tabShow === 'fields' ? '' : 'none'}}>
            <Table
              height={height}
              columnOrder={columnOrder}
              dataTable={dataTable}
              dataSource={dataSource}
              dataTypes={dataTypes}
            />
          </div>
          <div style={{display: this.state.tabShow === 'codes' ? '' : 'none'}}>
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
            <div style={{height: height - 135, overflow: 'auto'}}>
              {
                database.map(db => (
                  <div
                    key={`${db.code}-code`}
                    style={{display: currentCode === db.code ? '' : 'none'}}
                  >
                    <div
                      className={`${prefix}-data-table-content-tab`}
                      style={{marginTop: 5, fontSize: 12, marginBottom: 0}}
                    >
                      <div
                        onClick={() => this._templateTabClick('createTableTemplate')}
                        className={`${prefix}-data-table-content-tab${this.state.templateShow === 'createTableTemplate' ? '-selected' : '-unselected'}`}
                      >
                        新建数据表代码
                      </div>
                      <div
                        onClick={() => this._templateTabClick('deleteTableTemplate')}
                        className={`${prefix}-data-table-content-tab${this.state.templateShow === 'deleteTableTemplate' ? '-selected' : '-unselected'}`}
                      >
                        删除数据表代码
                      </div>
                      <div
                        onClick={() => this._templateTabClick('createIndexTemplate')}
                        className={`${prefix}-data-table-content-tab${this.state.templateShow === 'createIndexTemplate' ? '-selected' : '-unselected'}`}
                      >
                        新建索引代码
                      </div>
                      <div
                        onClick={() => this._templateTabClick('rebuildTableTemplate')}
                        className={`${prefix}-data-table-content-tab${this.state.templateShow === 'rebuildTableTemplate' ? '-selected' : '-unselected'}`}
                      >
                        重建数据表代码
                      </div>
                      <div
                        onClick={() => this._templateTabClick('createFieldTemplate')}
                        className={`${prefix}-data-table-content-tab${this.state.templateShow === 'createFieldTemplate' ? '-selected' : '-unselected'}`}
                      >
                        新增字段代码
                      </div>
                      <div
                        onClick={() => this._templateTabClick('deleteFieldTemplate')}
                        className={`${prefix}-data-table-content-tab${this.state.templateShow === 'deleteFieldTemplate' ? '-selected' : '-unselected'}`}
                      >
                        删除字段代码
                      </div>

                      <div
                        onClick={() => this._templateTabClick('updateFieldTemplate')}
                        className={`${prefix}-data-table-content-tab${this.state.templateShow === 'updateFieldTemplate' ? '-selected' : '-unselected'}`}
                      >
                        修改字段代码
                      </div>

                      <div
                        onClick={() => this._templateTabClick('deleteIndexTemplate')}
                        className={`${prefix}-data-table-content-tab${this.state.templateShow === 'deleteIndexTemplate' ? '-selected' : '-unselected'}`}
                      >
                        删除索引代码
                      </div>
                    </div>
                    <div className={`${prefix}-data-tab-content`}>
                      <div style={{display: 'flex', padding: 5}}>
                        <Icon
                          type='copy1'
                          style={{cursor: 'pointer'}}
                          title='点击复制到粘贴板'
                          onClick={() => this._copyClick(
                            this._getTableCode(currentCode, this.state.templateShow))}
                        />
                        <span
                          style={{marginLeft: '10px', fontSize: 12, color: 'green'}}
                        >
                          {
                            (this.state.templateShow === 'createTableTemplate' ||
                            this.state.templateShow === 'deleteTableTemplate' ||
                            this.state.templateShow === 'createIndexTemplate') ? '该脚本为全量脚本' : '该脚本为差异化脚本'
                          }
                        </span>
                      </div>
                      <div style={{height: height - 194, overflow: 'auto'}}>
                        <Com.Code
                          language={db.code !== 'Java' ? 'SQL' : 'Java'}
                          style={{minHeight: height - 194, width: '100%'}}
                          data={this._getTableCode(db.code, this.state.templateShow)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <div style={{display: this.state.tabShow === 'indexs' ? '' : 'none', height: '100%'}}>
            <TableIndexConfig dataTable={dataTable} update={this._update}/>
          </div>
        </div>
      </div>
    </div>);
  }
}
DataTable.contextTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
};

export default DataTable;

