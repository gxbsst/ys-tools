import React, {PureComponent} from "react";
import styles from '../index.less'
import {
  Icon,
  Row,
  Col,
  Form,
  Input,
  Tooltip,
  Cascader,
  Radio,
  Select,
  Checkbox,
  Button,
  AutoComplete,
  DatePicker,
  Modal
} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;
const RadioGroup = Radio.Group;

export default class AddLinkman extends PureComponent {
  state = {
    visible: false
  };
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };
  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  render() {
    const formItemLayout = {
      labelCol: {
        xs: {span: 6},
        sm: {span: 6},
      },
      wrapperCol: {
        xs: {span: 18},
        sm: {span: 18},
      },
    };
    return (
      <div>
        <Button type="primary"
                size="small"
                onClick={this.showModal}>新建联系人</Button>
        <Modal
          title="新建跟进信息"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div className={styles.addLinkman}>
            <Form layout='inline'>
              <div className={styles.input_item}>
                <FormItem
                  style={{width: '90%'}}
                  {...formItemLayout}
                  label={`联系人`}>
                  <Input value={`软件事业群/新零售营销中心/呼叫中心`} readOnly={true}/>
                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  style={{width: '90%'}}
                  {...formItemLayout}
                  label={`联系类别`}>
                  <Select defaultValue="phone">
                    <Option value="phone">电话</Option>
                    <Option value="qq">QQ</Option>
                  </Select>
                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  style={{width: '90%'}}
                  {...formItemLayout}
                  label={`联系主题`}>
                  <Input/>
                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  style={{width: '90%'}}
                  {...formItemLayout}
                  label={`联系内容`}>
                  <textarea className={styles.contact_details}></textarea>
                </FormItem>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}
