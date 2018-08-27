/* eslint-disable */
import React from 'react';
import './style/index.less';
// import Immutable from 'immutable';

import TreeNode from './TreeNode';
import ReactDom from "react-dom";
import {addOnResize} from "../../utils/listener";

class Tree extends React.Component {

  static defaultProps = {
    defaultChecked: '',
    defaultExpanded: '',
  };

  static TreeNode = TreeNode;

  constructor(props) {
    super(props);
    this.flag = true;
    this.state = {
      checked: '',
      cancelChecked: '',
      blurChecked: '',
      height: document.body.clientHeight
    };
  }

  componentDidMount(){
    addOnResize(this._setTabsHeight);
  }
  componentWillUnmount(){
    this.flag = false;
  }
  _setTabsHeight = () => {
    this.flag && this.setState({
      height: document.body.clientHeight
    })
  };

  _onClick = (value) => {
    const { onClick } = this.props;
    document.getElementById('tree').focus();
    onClick && onClick(value);
    this.setState({
      cancelChecked: this.state.checked,
      checked: value,
      blurChecked: ''
    });
  };

  _onDoubleClick = (value) => {
    const { onDoubleClick } = this.props;
    onDoubleClick && onDoubleClick(value);
  };

  // 递归给子组件注入参数
  _setProps = (item, row, onDrop, onContextMenu) => {
    let tempValue = [];
    const component = [].concat(item.props.children).map(child => {
      tempValue.push(child.props.value);
      if (!tempValue.includes(child.props.realName)) {
        tempValue.push(child.props.realName);
      }
      const childrenData = child.props.children &&
        this._setProps(child, row + 1, onDrop, onContextMenu);
      tempValue = tempValue.concat((childrenData && childrenData.value) || []);
      return {
        ...child,
        props: {
          ...child.props,
          onClick: this._onClick,
          onDrop,
          onContextMenu,
          onDoubleClick: this._onDoubleClick,
          children: childrenData && childrenData.component,
          childrenValue: (childrenData && childrenData.value) || [],
          row: row + 1,
          checked: this.state.checked,
          cancelChecked: this.state.cancelChecked,
          blurChecked: this.state.blurChecked
        }
      };
    });
    return {
      component,
      value: tempValue
    };
  };

  _onBlur = () => {
    // 调整选中树节点的背景色
    this.setState({
      blurChecked: this.state.checked,
    });
  };

  render() {
    const { children, onDrop, onContextMenu } = this.props;
    const { height } = this.state;
    return (<div
      tabIndex="0"
      className='pdman-tree'
      onBlur={this._onBlur}
      id="tree"
      style={{
        height: height - 153,
      }}
    >
      <ul>
        {[].concat(children).map(item => {
          const childrenData = item.props.children &&
            this._setProps(item, 0, onDrop, onContextMenu);
          return {
            ...item,
            props: {
              ...item.props,
              onClick: this._onClick,
              onDrop,
              onContextMenu,
              onDoubleClick: this._onDoubleClick,
              children: childrenData && childrenData.component,
              childrenValue: (childrenData && childrenData.value) || [],
              row: 0,
              checked: this.state.checked,
              cancelChecked: this.state.cancelChecked,
              blurChecked: this.state.blurChecked
            }
          };
        })}
      </ul>
    </div>);
  }
}

export default Tree;
