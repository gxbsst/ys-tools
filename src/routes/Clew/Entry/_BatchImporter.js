import React, { PureComponent } from 'react';
import { Modal, Button, Upload, Icon, message } from 'antd';
import DescriptionList from '../../../components/DescriptionList';

const { Dragger } = Upload;
const { Description } = DescriptionList;

export default class BatchImporter extends PureComponent {
  state = {
    visible: false,
    importResut: {
      successCount: 0,
      incompleteCount: 0,
      repeatCount: 0,
      failId: '',
    }
  }

  handleCancel = () => {
    this.setState({visible: false})
  }

  render() {
    const self = this;
    const uploaderProps = {
      name: 'uploadFile',
      multiple: true,
      showUploadList: true,
      accept: '.xls, .csv, .xlsx',
      action: '/api/clews/upload',
      onChange(info) {
        // const {status} = info.file;
        const {file, file: {response, status}} = info;
        if (status !== 'uploading') {
          // console.log(file, info.fileList);
        }
        if (status === 'done') {
          const { code, data} = response;
          if (!code) {
            data && self.setState({
              visible: true,
              importResut: data,
            })
          } else {
            Modal.error({
              title: '导入失败',
              content: response.message,
            });
          }
        } else if (status === 'error') {
          message.error(`${file.name} file upload failed.`);
        }
      },
    }

    const {title, fromType} = this.props;
    const { successCount, incompleteCount, repeatCount, failId } = this.state.importResut;

    return (
      <React.Fragment>
        <div>
          <Dragger {...uploaderProps}>
            <p className="ant-upload-text">{title}</p>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-hint">点击或将文件拖拽到这里上传</p>
          </Dragger>
          <div>
            <a href={`/api/clews/template/download?fromType=${fromType}`} download>
              <Button size="large" style={{ width: '100%', marginTop: '10px'}} icon="download">导入模板下载</Button>
            </a>
          </div>
        </div>
        <Modal
          title="批量导入结果"
          visible={this.state.visible}
          cancelText="关闭"
          onCancel={this.handleCancel}
          footer={
            <React.Fragment>
              <Button key="back" onClick={this.handleCancel}>关闭</Button>
              {
                failId &&
                <Button style={{marginLeft: 10}} key="download" download href={`/api/clews/fail/download?failMsgId=${failId}`} type="primary">
                  下载失败记录
                </Button>
              }
            </React.Fragment>
          }
        >
          <DescriptionList>
            <Description term="导入成功"><span>{successCount}</span></Description>
            <Description term="信息有误"><span>{incompleteCount}</span></Description>
            <Description term="电话重复"><span>{repeatCount}</span></Description>
          </DescriptionList>
        </Modal>
      </React.Fragment>
    )
  }
}