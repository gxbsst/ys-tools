import React, {PureComponent} from "react";
import styles from './index.less'
import common from '../../Personnel/common/index.less'
import moment from 'moment';
import request from '../../../utils/request';
import {
  Form,
  Input,
  Radio,
  Select,
  Button,
  AutoComplete,
  DatePicker,
  Modal,
  Table,
  Rate,
  Row, Col, message
} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;
const RadioGroup = Radio.Group;
const {TextArea} = Input;
const formItemLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};
const formLayout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
};
const gradeLayout = {
  labelCol: {span: 9},
  wrapperCol: {span: 15},
};
@Form.create()
export default class CallGrade extends PureComponent {
  state = {
    visible: false,
  };
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  // 客户评分
  grade = async (params) => {
    const {data} = await request(`api/customerAddition/add`, {
      method: 'POST',
      body: {
        ...params,
      },
    });
    data && message.success('评分完成')
  }
  handleOk = (e) => {
    this.props.form.validateFields((err, values) => {
      // 模拟
      const id = 1;
      const {warnDatetime, brandClass, influenceClass, livenessClass, operationClass, proSatisfactionClass, renewClass, ...residue} = values;
      if (!err) {
        const params = {
          warnDatetime,
          brandClass,
          influenceClass,
          livenessClass,
          operationClass,
          proSatisfactionClass,
          renewClass,
          id
        };
        this.grade(params)
      }
    });
  };
  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  componentDidMount() {

  }

  fontSize = {
    fontSize: '13px'
  }

  render() {
    const {form, customerName} = this.props;
    const {getFieldDecorator, validateFields} = form;
    const dateFormat = 'YYYY/MM/DD';
    return (
      <div>
        <Button type="primary"
                onClick={this.showModal}>呼叫</Button>
        <Modal
          title="回访呼叫"
          visible={this.state.visible}
          onOk={this.handleOk}
          width={750}
          onCancel={this.handleCancel}
        >
          <div className={styles.addLinkman}>
            <Form layout='inline'>
              <div className={styles.input_item + ' ' + styles.twocolumns}>
                <FormItem
                  {...formLayout}
                  label='客户名称'>
                  {
                    getFieldDecorator('customerName', {})(
                      <span>琪琪服装有限公司</span>
                    )
                  }
                </FormItem>
                <FormItem
                  {...formLayout}
                  label='下次提醒时间'>
                  {
                    getFieldDecorator('warnDatetime', {})(
                      <DatePicker
                        showTime
                        format={dateFormat}
                        style={{width: '100%'}}
                        placeholder="下次提醒时间"
                      />
                    )
                  }
                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='微盟账号'>
                  {
                    getFieldDecorator('relType', {
                      initialValue: 0
                    })(
                      <span>QiQI</span>
                    )
                  }
                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='店铺名'>
                  {
                    getFieldDecorator('invoiceAmount', {})(
                      <span>琪琪服饰</span>
                    )
                  }
                </FormItem>
              </div>
              <div className={styles.Rate}>
                <Row type="flex" justify="space-between" className={styles.margin}>
                  <Col span={8}>
                    <FormItem {...gradeLayout} label="客户品牌度">
                      {
                        getFieldDecorator('brandClass')(
                          <Rate style={this.fontSize}/>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem {...gradeLayout} label="客户运营效果">
                      {
                        getFieldDecorator('operationClass')(
                          <Rate style={this.fontSize}/>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem {...gradeLayout} label="客户活跃度">
                      {
                        getFieldDecorator('livenessClass')(
                          <Rate style={this.fontSize}/>
                        )
                      }
                    </FormItem>
                  </Col>
                </Row>
                <Row type="flex" justify="space-between" className={styles.margin}>
                  <Col span={8}>
                    <FormItem {...gradeLayout} label="续费意向度">
                      {
                        getFieldDecorator('renewClass')(
                          <Rate style={this.fontSize}/>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem {...gradeLayout} label="业界影响度">
                      {
                        getFieldDecorator('influenceClass')(
                          <Rate style={this.fontSize}/>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem {...gradeLayout} label="产品满意度">
                      {
                        getFieldDecorator('proSatisfactionClass')(
                          <Rate style={this.fontSize}/>
                        )
                      }
                    </FormItem>
                  </Col>
                </Row>
                <Row type="flex" justify="space-between" className={styles.margin}>
                  <Col span={8}>
                    <span>本次联系电话：</span>
                    <span>13122516113</span>
                  </Col>
                  <Col span={8}>
                    <span>本次联系人：</span>
                    <span>琪琪</span>
                  </Col>
                  <Col span={8}>
                    <span>本次满意度：</span>
                    <span><Rate style={this.fontSize}/></span>
                  </Col>
                </Row>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='联系主题'>
                  {
                    getFieldDecorator('invoiceType', {})(
                      <Input placeholder="联系主题"/>
                    )
                  }

                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='联系内容'>
                  {
                    getFieldDecorator('demand', {})(
                      <TextArea placeholder="联系内容" autosize/>
                    )
                  }
                </FormItem>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}
