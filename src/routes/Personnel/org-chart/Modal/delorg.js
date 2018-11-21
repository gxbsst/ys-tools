import React, {PureComponent} from "react";
import {Modal, Button} from 'antd';
import common from '../../common/index.less'
import styles from '../index.less'

export default class Delorg extends PureComponent {
  state = {
    visible: false,
  };
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = () => {
    this.props.delOrg();
    this.setState({
      visible: false,
    });
  };
  handleCancel = () => {
    setTimeout(() => {
      this.setState({visible: false});
    }, 500)

  };

  render() {
    const {ban} = this.props;
    const {visible} = this.state;
    return (
      <span>
        <Button type="danger" onClick={this.showModal} disabled={ban}>
          删除
        </Button>
        <Modal
          visible={visible}
          title="删除组织"
          footer={[
            <Button key="back" onClick={this.handleCancel}>取消</Button>,
            <Button key="submit" type="primary" onClick={this.handleOk}>
              确定
            </Button>,
          ]}
        >
            <p className={styles.item}>确定删除此组织及附属子组织吗？</p>
            <p className={styles.item}>组织内存在员工的归属关系，请先处理好员工归属再删除组织</p>
        </Modal>
      </span>
    );
  }
}
