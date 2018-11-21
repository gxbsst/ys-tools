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

export default class AddLinkman extends PureComponent{
  state={
    visible:false
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
    return (
      <div>
        <Button type="primary"
                size="small"
                onClick={this.showModal}>新建联系人</Button>
        <Modal
          title="Basic Modal"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div className={styles.addLinkman}>

          </div>
        </Modal>
      </div>
    );
  }
}
