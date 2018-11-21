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

export default class FpOperation extends PureComponent {
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
    console.info('reload', reload);
    const {data, message: msg, code} = await request('/api/auth/assign', {
      method: 'POST',
      body: {
        ...params,
      },
    });
    onCancel();
    reload();
  };
  //运营列表
  operationList = async (fromSource) => {
    const {data} = await request(`/api/auth/employees?fromSource=${fromSource}`)
    if (data.length) {
      this.setState({
        serviceList: data
      })
    }

  }

  componentDidMount() {
    let {fromSource} = this.props;
    console.info('fromSource', fromSource);
    fromSource && this.operationList(fromSource);
  }

  handleOk = (e) => {
    const {serviceInfo} = this.state;
    let {customerId} = this.props;
    customerId = customerId.join();
    let {fromSource: type} = this.props;
    type = type ? type : 1;
    type = type.toString();
    let parms = Object.assign({}, serviceInfo, {type, ids: customerId});
    if (serviceInfo) {
      this.distribution(parms);
    } else {
      message.info('请选中客户')
    }
  };
  handleCancel = (e) => {
    const {onCancel} = this.props;
    onCancel()
  };
  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
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
      width: 206,
    }, {
      title: '当前未完成任务数',
      dataIndex: 'countUnfinish',
      width: 206,
    }];
    return (
      <span>
        <Modal
          title="分配运营"
          destroyOnClose
          {...receiveProps}
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

