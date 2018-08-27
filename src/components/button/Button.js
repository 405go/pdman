import React from 'react';

import Icon from '../icon';

class Button extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectBorder: '1px solid #0784DE',
      selectColor: '#E3F1FA',
      defaultBorder: '1px solid #ADADAD',
      defaultColor: '#E3E3E3',
    };
  }

  _onClick = () => {
    const { onClick } = this.props;
    onClick && onClick();
  };

  _mouseOver = () => {
    this.setState({
      defaultBorder: this.state.selectBorder,
      defaultColor: this.state.selectColor,
    });
  };

  _mouseOut = () => {
    this.setState({
      defaultBorder: '1px solid #ADADAD',
      defaultColor: '#E3E3E3',
    });
  };

  render() {
    const { type, children, style, icon, title, loading } = this.props;
    return (<button
      disabled={loading}
      title={title}
      onClick={this._onClick}
      onMouseOver={this._mouseOver}
      onMouseOut={this._mouseOut}
      style={{
        ...style,
        userSelect: 'none',
        cursor: 'pointer',
        paddingLeft: 20,
        paddingRight: 20,
        border: type === 'primary' ? this.state.selectBorder : this.state.defaultBorder,
        backgroundColor: type === 'primary' ? this.state.selectColor : this.state.defaultColor,
        outline: 'none',
      }}
    >
      {loading && <Icon className='anticon-spin' type='loading1' style={{marginRight: 5}}/>}
      {icon && <Icon type={icon} style={{marginRight: 5}}/>}
      {children}
    </button>);
  }
}

export default Button;
