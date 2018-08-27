import React from 'react';
import electron from 'electron';
import { Icon, Button } from '../components';
import './style/create.less';

const { dialog, app } = electron.remote;
export default class CreatePro extends React.Component {
  constructor(props){
    super(props);
    this.split = process.platform === 'win32' ? '\\' : '/';
    this.state = {
      value: `${app.getPath('home')}${this.split}demo`,
    };
  }
  componentDidMount(){
    const { onChange } = this.props;
    onChange && onChange(this.state.value);
  }
  _iconClick = () => {
    console.log(process.platform);
    const { onChange } = this.props;
    const extensions = [];
    if (process.platform === 'darwin') {
      extensions.push('json');
    } else {
      extensions.push('pdman.json');
    }
    dialog.showSaveDialog({
      title: 'New Project',
      buttonLabel: '确定',
      filters: [
        { name: 'PDMan', extensions: extensions },
      ],
    }, (file) => {
      if (file) {
        let tempFile = file;
        if (tempFile.endsWith('.pdman.json')) {
          tempFile = file.replace('.pdman.json', '');
        } else {
          tempFile = file.replace('.json', '');
        }
        this.setState({
          value: tempFile,
        });
        onChange && onChange(tempFile);
      }
    });
  };
  _onChange = (e) => {
    const { onChange } = this.props;
    this.setState({
      value: e.target.value,
    });
    onChange && onChange(e.target.value);
  };
  _closeCreatePro = () => {
    const { close } = this.props;
    close && close();
  };
  _onOk = () => {
    const { onOk } = this.props;
    onOk && onOk();
  };
  render() {
    const { style } = this.props;
    return (<div className='pdman-create' style={style}>
      <div className='pdman-create-left'>
        <div className='pdman-create-left-types'>
          <div className='pdman-create-left-types-type pdman-create-left-types-type-default-select'>
            <Icon type='earth' style={{color: '#3AAEDC'}}/>
            <span style={{marginLeft: 5}}>空项目</span>
          </div>
          <div className='pdman-create-left-types-type'>
            <Icon type='fa-futbol-o' style={{color: '#E2CD87'}}/>
            <span style={{marginLeft: 5}}>其他</span>
          </div>
        </div>
        <div className='pdman-create-left-back'>
          <Icon type='fa-arrow-circle-left' style={{color: '#3AAEDC'}} onClick={this._closeCreatePro}/>
        </div>
      </div>
      <div className='pdman-create-right'>
        <div className='pdman-create-right-title'>
          新项目
        </div>
        <div className='pdman-create-right-com'>
          <div className='pdman-create-right-com-label'>
            路径:
          </div>
          <div className='pdman-create-right-com-input'>
            <input onChange={this._onChange} value={this.state.value}/>
          </div>
          <div className='pdman-create-right-com-button'>
            <Button onClick={this._iconClick}>...</Button>
          </div>
        </div>
        <div className='pdman-create-right-footer'>
          <Button onClick={this._onOk}>Create</Button>
        </div>
      </div>
    </div>);
  }
}
