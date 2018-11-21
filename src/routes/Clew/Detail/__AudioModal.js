import React from 'react';
import {Modal, Table} from 'antd';

const columns = [{
  title: '呼叫号码',
  dataIndex: 'customerTypeName',
}, {
  title: '呼叫时间',
  dataIndex: 'customerName',
}, {
  title: '通话时长',
  dataIndex: 'status',
}, {
  title: '处理人',
  dataIndex: 'safeStatus',
}];

export default function AudioModal(props) {
  return (
    <Modal
      title="呼叫记录"
      visible={props.visible}
      onCancel={props.onCancel}
      width={600}
      footer={null}
    >
      <Table columns={columns} dataSource={props.importResult || []} pagination={false} />
      <audio style={{width: '100%'}} id="player" controls src="https://storage.googleapis.com/webfundamentals-assets/videos/chrome.webm">
        <track src="video" kind="captions" default />
      </audio>
    </Modal>
  )
}
