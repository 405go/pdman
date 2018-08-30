import React from 'react';
import electron from 'electron';
import { Button, Message } from '../components';
import { copyFileSync } from '../utils/json';
import './style/word.less';

const { ipcRenderer } = electron;

const { dialog } = electron.remote;

export default class WORDConfig extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data: props.data,
    };
  }
  _openDir = (callBack) => {
    const filter = [{name: 'word模板文件', extensions: ['docx']}];
    dialog.showOpenDialog({
      title: 'Open File',
      properties:['openFile'],
      filters: filter,
    }, (file) => {
      if (file) {
        callBack && callBack(file[0]);
      }
    });
  };
  _iconClick = () => {
    const { onChange } = this.props;
    this._openDir((dir) => {
      this.setState({
        data: dir,
      }, () => {
        onChange && onChange(this.state.data);
      });
    });
  };
  _saveTemplate = () => {
    // 获取word的目录
    const defaultPath = ipcRenderer.sendSync('wordPath');
    dialog.showSaveDialog({
        title: 'Save as',
        filters: [
          { name: 'word模板文件', extensions: ['docx'] },
        ],
      },(file) => {
      if (file) {
        const result = copyFileSync(defaultPath, file);
        if (result) {
          Message.error({title: '模板文件另存为失败'});
        } else {
          Message.success({title: '模板文件另存为成功'});
        }
      }
    });
  };
  _onChange = (e) => {
    const { onChange } = this.props;
    this.setState({
      data: e.target.value,
    }, () => {
      onChange && onChange(this.state.data);
    });
  };
  render() {
    const { data } = this.state;
    return (
      <div className='pdman-config-word'>
        <div className='pdman-config-word-config'>
          <div className='pdman-config-word-config-label'>
            <span>WORD模板:</span>
          </div>
          <div className='pdman-config-word-config-input'>
            <input
              placeholder='默认为系统自带的模板，如需修改，请先另存为，再指定模板文件'
              onChange={this._onChange}
              value={data || ''}
            />
          </div>
          <div className='pdman-config-word-config-button'>
            <Button onClick={this._iconClick} title='点击从本地选择模板'>...</Button>
            <Button style={{marginLeft: 5}} onClick={this._saveTemplate}>模板另存为</Button>
          </div>
        </div>
      </div>
    );
  }
}
