import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Button, Icon, Menu } from 'antd';

const DropOption = ({ onMenuClick, menuOptions = [], buttonStyle, dropdownProps, renderMenu }) => {
  let menu = (
    <Menu onClick={onMenuClick}>
      {
        menuOptions.map(item => <Menu.Item key={item.key}>{item.name}</Menu.Item>)
      }
    </Menu>
  );
  if (renderMenu) {
    menu = renderMenu;
  }
  return (
    <Dropdown
      overlay={menu}
      {...dropdownProps}
    >
      <Button style={{border: 'none', ...buttonStyle}}>
        <Icon style={{marginRight: 2}} type="bars"/>
        <Icon type="down" />
      </Button>
    </Dropdown>
  );
}

DropOption.propTypes = {
  onMenuClick: PropTypes.func,
  menuOptions: PropTypes.array,
  buttonStyle: PropTypes.object,
  dropdownProps: PropTypes.object,
  renderMenu: PropTypes.object,
}

export default DropOption;
