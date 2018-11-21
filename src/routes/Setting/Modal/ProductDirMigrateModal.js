import React, { PureComponent } from 'react';
import { Modal, Form, TreeSelect } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16},
};

@Form.create()
export default class ProductDirMigrateModal extends PureComponent {
  onSelect = (value, node, extra) => {
    console.log('value', value);
    console.log('node', node);
    console.log('extra', extra);
  }
  render() {
    const {
      form: {
        getFieldDecorator, validateFields,
      }, onOk, selectedPath, selectedKeys, treeData, treeDataSimpleMode, ...receiveProps } = this.props;
    const isSubNode = (item) => {
      // return item.id == ~~selectedKeys || (item.parentId != 0 ? isSubNode(treeData.find(i => i.id == item.parentId)) : undefined);
      if (!item) return;
      if (item.id == ~~selectedKeys) {
        return true;
      } else if (item.parentId != 0) {
        return isSubNode(treeData.find(i => i.id == item.parentId));
      }
    }
    const renderTreeData = treeData.map(i => isSubNode(i) ? {...i, disabled: true} : i);
    const handleOk = () => {
      validateFields((err, values) => {
        if (!err) {
          onOk(values);
        }
      });
    };
    const selfProps = {
      ...receiveProps,
      onOk: handleOk,
      destroyOnClose: true,
    }

    return (
      <Modal {...selfProps}>
        <Form layout="horizontal">
          <FormItem {...formItemLayout} label="当前路径">
              <span>{selectedPath}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="目标目录"
          >
            {getFieldDecorator('parentId', {
              rules: [{required: true, message: '请选择产品目录!'}],
            })(
              <TreeSelect
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeDefaultExpandAll
                onChange={this.onTreeSelectChange}
                onSelect={this.props.onSelect}
                treeData={renderTreeData}
                treeDataSimpleMode={treeDataSimpleMode}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
