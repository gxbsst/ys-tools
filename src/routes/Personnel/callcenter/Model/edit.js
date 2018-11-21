import React, {PureComponent} from "react";
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
import common from '../../common/index.less'
import styles from '../index.less'

const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;
const RadioGroup = Radio.Group;
export default class Edit extends PureComponent {
  state = {
    visible: false,
    value: 1,
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
  // 选中选项
  onChangeradio = (e) => {
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
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
      <span>
        <span type="primary"
              size="small"
              onClick={this.showModal}><Icon type="edit"/></span>
        <Modal
          title="编辑坐席"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
           <Form layout='inline'>
              <div className={styles.edititem}>
                <FormItem
                  style={{width: '80%'}}
                  {...formItemLayout}
                  label={`坐席描述`}>
                <Input value={`软件事业群/新零售营销中心/呼叫中心`}/>
              </FormItem>
              </div>
              <div className={styles.edititem}>
                <FormItem
                  style={{width: '80%'}}
                  {...formItemLayout}
                  label={`员工姓名`}>
                <Input placeholder="请输入用户姓名"/>
              </FormItem>
              </div>
              <div className={styles.edititem}>
                <FormItem
                  style={{width: '80%'}}
                  {...formItemLayout}
                  label={`班长坐席`}>
                    <Radio value={1}>所选组织负责人</Radio>
              </FormItem>
              </div>
           </Form>
        </Modal>
      </span>
    );
  }
}
