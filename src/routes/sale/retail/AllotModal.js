import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, message, Form } from 'antd';
import { StaffFinder } from '../../../components';

@Form.create()
@connect(state => ({
  fetchingOptions: state.loading.effects['saleRetail/querySelectOptions'],
}))
export default class AllotModal extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    currentSelect: null,
  }


  handleChange = (value, record = {}) => {
    this.setState({
      value,
      currentSelect: record,
    });
  }
  handleAllotOk = () => {
    console.info(this.state.keywordPropName)
    const { currentSelect } = this.state;
    if (!currentSelect) {
      return message.error('未选择分配联系人！')
    }
    const { username, name} = currentSelect;
    this.props.dispatch({
      type: 'saleRetail/batchAllocation',
      payload: {
        applyUser: username,
        applyUserName: name,
        type: 'init',
        chanceIds: this.props.id,
        fromSource: this.props.fromSource,
        chanceType: this.props.chanceType,
      }
    }).then(val => {
      this.props.onOk();
    });
  }

  render() {
    const { id, fetchingOptions, ...modalProps } = this.props;
    return (
      <Modal
        {...modalProps}
        title="选择分配人员"
        onOk={this.handleAllotOk}
        width="350px"
      >
        <StaffFinder
          onChange={this.handleChange}
        />
      </Modal>
    )
  }
}
