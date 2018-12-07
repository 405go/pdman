import React from 'react';
import path from 'path';
import electron from 'electron';

import { generateByJar } from '../../src/utils/office';
import { Input, Button, Message, Modal, RadioGroup } from '../../src/components';
import { writeFile } from '../utils/json';
import './style/register.less';

const Radio = RadioGroup.Radio;
const { shell } = electron;
const { app } = electron.remote;

export default class Register extends React.Component{
  constructor(props){
    super(props);
    this.file = 'Register';
    this.path = app.getPath('userData');
    this.split = path.sep;
    this.value = {
      months: 1,
    };
    this.state = {
      months: 1,
      register: props.register || {},
    };
  }
  _valueChange = (name, value) => {
    this.value[name] = value;
    if (name === 'months') {
      this.setState({
        months: value,
      });
    }
  };
  _register = ({setLoading}) => {
    // 校验value是否合法
    if (!this.value.months || !this.value.mobilePhone) {
      Modal.error({title: '注册失败！', message: '时长、手机号不能为空'});
    } else if (!/^\d+$/g.test(this.value.months)) {
      Modal.error({title: '注册失败！', message: '时长格式不正确，必须为数字'});
    } else if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(this.value.mobilePhone)) {
      Modal.error({title: '注册失败！', message: '手机号格式不正确，请输入正确的手机号！'});
    } else {
      const { dataSource } = this.props;
      setLoading(true);
      generateByJar(dataSource, {
        ...this.value,
      }, (error, stdout, stderr) => {
        const result = (stderr || stdout);
        let tempResult = '';
        try {
          tempResult = JSON.parse(result);
        } catch (e) {
          tempResult = result;
        }
        if (tempResult.status === 'SUCCESS') {
          Message.success({title: '注册码生成成功！请使用此注册码前往官网进行注册！'});
          this.setState({
            register: {
              code: tempResult.body,
              status: false,
            },
          }, () => {
            writeFile(this.path + this.split + this.file, this.state.register.code).then(() => {
              const { updateRegister } = this.props;
              updateRegister && updateRegister(this.state.register.code);
            }).catch(() => {
              Message.error({title: '注册码生成失败！请重试！'});
            });
          });
        } else {
          Message.error({title: '注册码生成失败！请重试！'});
        }
        setLoading(false);
      },'registerCode');
    }
  };
  _clearRegister = () => {
    Modal.confirm({
      title: '温馨提示',
      message: '重新生成注册码会丢失当前的注册信息，是否继续操作？',
      onOk: (m) => {
        m && m.close();
        this.setState({
          register: {},
        });
      },
    });
  };
  _openUrl = (url) => {
    shell.openExternal(url);
  };
  render() {
    const { register : { code, status } } = this.state;
    return (
      <div className='pdman-register'>
        {code ? (
          <div className='pdman-register-message'>
            <div className='pdman-register-message-item'>
              <span className='pdman-register-message-item-code-label'>注册码：</span>
              <span className='pdman-register-message-item-code'>{code}</span>
            </div>
            <div className='pdman-register-message-item'>
              <span className='pdman-register-message-item-status-label'>激活状态：</span>
              <span
                className={`pdman-register-message-item-status-${status ? 'activation' : 'unactivation'}`}
              >
                {status ? '已激活' : '未激活'}
              </span>
            </div>
            <div className='pdman-register-message-opt'>
              <Button icon='fa-refresh' onClick={this._clearRegister}>重新生成注册码</Button>
              <Button
                icon='fa-check'
                onClick={() => this._openUrl('http://www.pdman.cn/register')}
              >
                前往官网激活
              </Button>
            </div>
          </div>
        ) : (
          <div className='pdman-register-form'>
            <div className='pdman-register-form-item'>
              <span className='pdman-register-form-item-label pdman-register-form-item-label-require'>使用时长(月)：</span>
              <RadioGroup
                onChange={value => this._valueChange('months', value)}
                value={this.state.months}
              >
                <Radio
                  wrapperStyle={{width: '20px'}}
                  value={1}
                >
                  <span>1个月</span>
                </Radio>
                <Radio
                  wrapperStyle={{width: '20px'}}
                  value={3}
                >
                  <span>3个月</span>
                </Radio>
                <Radio
                  wrapperStyle={{width: '20px'}}
                  value={12}
                >
                  <span>12个月</span>
                </Radio>
              </RadioGroup>
            </div>
            <div className='pdman-register-form-item'>
              <span className='pdman-register-form-item-label pdman-register-form-item-label-require'>手机号：</span>
              <Input onChange={e => this._valueChange('mobilePhone', e.target.value)}/>
            </div>
            <div className='pdman-register-form-item'>
              <span className='pdman-register-form-item-label'>姓名：</span>
              <Input onChange={e => this._valueChange('userName', e.target.value)}/>
            </div>
            <div className='pdman-register-form-item'>
              <span className='pdman-register-form-item-label'>公司名：</span>
              <Input style={{width: 400}} onChange={e => this._valueChange('userCompany', e.target.value)}/>
            </div>
            <div className='pdman-register-form-item'>
              <span className='pdman-register-form-item-label'>公司地址：</span>
              <Input onChange={e => this._valueChange('companyAddress', e.target.value)}/>
            </div>
            <div className='pdman-register-form-item-button'>
              <Button onClick={this._register}>生成注册码</Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
