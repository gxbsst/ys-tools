import {Modal, Button} from 'antd';
import React, {PureComponent} from "react";
import DescriptionList from '../../../../components/DescriptionList';

const {Description} = DescriptionList;

export default class CheckItem extends PureComponent {
  render() {
    const {visible, title, onCancel, info} = this.props;
    const handleOk = () => {
      if (info) {
        onCancel()
      }
    };
    return (
      <Modal
        visible={visible}
        title={title}
        onCancel={onCancel}
        onOk={handleOk}
        width={750}
      >
        <DescriptionList col="3" gutter={0} size="large">
          <Description term="姓名">{info.name}</Description>
          <Description term="登陆名">{info.username}</Description>
          <Description term="职位">{info.position}</Description>
          <Description term="电子邮箱	">{info.email}</Description>
          <Description term="担保额度">{info.guaranteeAmount?info.guaranteeAmount:'无'}</Description>
          <Description term="是否在职">{info.isOnJob ? '在职' : '离职'}</Description>
          <Description term="入职时间">{info.jionTime}</Description>
          <Description term="离职时间">{info.leftTime}</Description>
          <Description term="联系电话">{info.mobile}</Description>
          <Description term="已用担保额度">{info.usedAmount?info.usedAmount:'无'}</Description>
        </DescriptionList>
      </Modal>
    );
  }
}
