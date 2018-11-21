import React from 'react';
import {Modal, Table, Button} from 'antd';

const columns = [{
  title: '客户类型',
  dataIndex: 'customerTypeName',
}, {
  title: '客户名称',
  dataIndex: 'customerName',
}, {
  title: '当前状态',
  dataIndex: 'status',
}, {
  title: '保护状态',
  dataIndex: 'safeStatus',
}];

export default function ClewRepeatModal(props) {
  return (
    <Modal
      title="线索重复录入提示"
      visible={props.visible}
      onCancel={props.onCancel}
      width={600}
      footer={[
        // <Button key="drop" type="danger" onClick={props.resetFormField}>不要了</Button>,
        <Button key="edit" type="primary" onClick={props.onCancel}>好的</Button>,
      ]}
    >
      该客户名称已经存在于机会/客户库中，无法重复录入
      <Table columns={columns} dataSource={props.importResult} pagination={false} />
    </Modal>
  )
}
