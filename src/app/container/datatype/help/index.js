import React from 'react';

import { Button } from '../../../../components';

import './style/index.less';

export default class Help extends React.Component{
  close = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  }
  render() {
    return (<div className='pdman-datatype-help'>
      <div className='pdman-datatype-help-list'>
        <div className='pdman-datatype-help-list-item1'>
          <div><div>{}</div></div>
          <span>1.点击[数据域]</span>
        </div>
        <div className='pdman-datatype-help-list-item2'>
          <div><div>{}</div></div>
          <span>2.右键[数据类型]点击[新增数据类型]</span>
        </div>
        <div className='pdman-datatype-help-list-item3'>
          <div><div>{}</div></div>
          <span>3.弹出新增弹窗</span>
        </div>
      </div>
      <div className='pdman-datatype-help-opt'>
        <Button onClick={this.close}>知道了</Button>
      </div>
    </div>);
  }
}
