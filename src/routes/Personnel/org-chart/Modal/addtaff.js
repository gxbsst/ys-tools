import React, {PureComponent} from "react";
import {connect} from 'dva'
import AutoComplete from '../../../../components/AutoComplete'
import {tree} from '../../../../utils/index';
import request from '../../../../utils/request';
import {
  Form,
  Input,
  Radio,
  Select,
  Button,
  Cascader,
  Breadcrumb,
  Modal,
} from 'antd';
import common from '../../common/index.less'
import styles from '../index.less'

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 18
  }
};

@Form.create()

export default class Addstaff extends PureComponent {
  width = {width: '80%'};
  left = {width: '25%'};
  right = {width: '75%'};
  render() {
    // 选中选
    const {visible, onCancel, onCreate, form, selectedTissue} = this.props;
    const {getFieldDecorator} = form;
    const ori = selectedTissue ? selectedTissue : '未选择组织';
    const AutoCompleteProps = {
      dataSource: '/api/personnel/employee/think',
      valuePropName: 'id',
      keywordPropName: 'name',
      labelRender: record => `${record.name} (${record.username})`
    }
    return (
      <Modal
        visible={visible}
        title="添加员工"
        okText="确定"
        onCancel={onCancel}
        onOk={onCreate}
      >
        <Form layout='inline'>
          <div className={styles.item} style={this.width}>
            <span className={common.columnsTwo + ' ' + common.left + ' ' + common.right}
                  style={this.left}>所选组织：</span>
            <span>{ori}</span>
          </div>
          <div className={styles.item}>
            <FormItem
              style={this.width} {...formItemLayout} label='选择员工'>
              {
                getFieldDecorator('eId', {
                  rules: [{required: true, message: '请选择要添加员工'}],
                  trigger: 'onSelect',
                  getValueFromEvent: record => record.id,
                })(
                  <AutoComplete placeholder="请选择要添加员工" {...AutoCompleteProps}/>
                )
              }
            </FormItem>
          </div>
          <div className={styles.item}>
            <FormItem
              style={this.width} {...formItemLayout} label='组织负责人'>
              {
                getFieldDecorator('isLeader', {
                  rules: [{required: true}],
                  initialValue: false
                })(
                  <RadioGroup>
                    <Radio value={true}>所选组织负责人</Radio>
                    <Radio value={false}>非所选组织负责人</Radio>
                  </RadioGroup>
                )
              }
            </FormItem>
          </div>
        </Form>
      </Modal>
    );
  }
}
