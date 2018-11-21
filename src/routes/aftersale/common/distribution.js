import React, {PureComponent} from "react";
import {
  Button,
  Modal,
  Table,
  message
} from 'antd';
import request from "../../../utils/request";
import {getUrlParam} from '../../../utils/index';
import common from '../../Personnel/common/index.less'
import styles from '../afterServe/index.less'
import _ from 'lodash'

export default class Distribution extends PureComponent {
  state = {
    visible: false,
    serviceInfo: '',
    serviceList: [],
  };
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  distribution = async (params) => {
    const {reload, onCancel} = this.props;
    const {code, message: msg} = await request('/api/customer/assign', {
      method: 'POST',
      body: {
        ...params,
      },
    });
    message.success(msg);
    onCancel();
    reload()
  };
  //获取客服
  getservice = async (fromSource) => {
    const {data} = await request(`/api/customer/employees?fromSource=${fromSource}`);
    if (data.length) {
      this.setState({
        serviceList: data
      })
    }
  }

  componentDidMount() {
    let {fromSource} = this.props;
    fromSource && this.getservice(fromSource);
  }

  handleOk = (e) => {
    const {serviceInfo} = this.state;
    let {props: {customerId, fromSource: type}, state: {serviceList: {name, username}}} = this;
    customerId = customerId.join(',');
    type = type ? type : 1;
    type = type.toString();
    let parms = {type, ids: customerId, ...serviceInfo};
    if (serviceInfo) {
      this.distribution(parms);
    }
  };
  handleCancel = (e) => {
    const {onCancel} = this.props;
    onCancel()
  };
  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.info('selectedRows', selectedRows);
      const {realname} = selectedRows[0];
      const {username} = selectedRows[0];
      this.setState({
        serviceInfo: {name: realname, username}
      })
    },
    type: 'radio'
  };

  // table 配置
  render() {
    const {customerId, ...receiveProps} = this.props;
    const {serviceList} = this.state;
    const columns = [{
      title: '姓名',
      dataIndex: 'realname',
      width: 102,
    }, {
      title: '客户总条数',
      dataIndex: 'countAll',
      width: 102,
    }, {
      title: '活跃客户',
      dataIndex: 'countActive',
      width: 102,
    }, {
      title: '休眠客户',
      dataIndex: 'countFrozen',
      width: 102,
    }];
    return (
      <span>
        <Modal
          title="分配客服"
          {...receiveProps}
          destroyOnClose
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
        <div className={styles.pop_up}>
            <div className={styles.pop_tit}>
              <span>选中客户：</span>
              <span>{customerId.length}条</span>
            </div>
          <div className={common.marginTop}>
            <div>
              <Table
                rowSelection={this.rowSelection}
                type="radio"
                columns={columns}
                pagination={false}
                scroll={{y: 200}} bordered dataSource={serviceList}/>
            </div>
          </div>
        </div>
        </Modal>
      </span>
    );
  }

}

