import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Input, Row, Col, Card, Form, Divider } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import can from '../../decorators/Can';
import styles from './ResourceFlow.less';

const tabListAll = [{
  key: '1',
  code: 12002001,
  tab: '新零售流转',
}, {
  key: '2',
  code: 12002002,
  tab: '到店流转',
}];

const newRetailFieldLabels = {
  ownCleanValidTime: '个人清洗库有效期',
  ownCleanNum: '个人清洗库条数限制',

  isApplyValidTime: 'IS申领库有效期',
  isApplyNum: 'IS申领库条数限制',
  isOwnValidTime: 'IS自有库有效期',
  isOwnNum: 'IS自有库条数限制',
  leaderApplyValidTime: 'IS领导申领库有效期',
  leaderApplyNum: 'IS领导申领库条数限制',
  noGetTime: '私海回公海禁领限制',

  osPrivateValidTime: 'OS私海有效期',
  osPrivateNum: 'OS私海条数限制',
}

const arrivalFieldLabels = {
  ownCleanValidTime: '个人清洗库有效期',
  ownCleanNum: '个人清洗库条数限制',

  osPrivateValidTime: '到店私海有效期',
  osPrivateNum: '到店私海条数限制',
  noGetTime: '私海回公海禁领限制',
}

@connect(({resourceFlow, loading}) => ({
  resourceFlow,
  loading: loading.effects['resourceFlow/fetch'],
  submitting: loading.effects['resourceFlow/edit'],
}))
@can([12002000])
@Form.create()
export default class ResourceFlow extends PureComponent {
  state = {
    type: '1',
    tabList: tabListAll,
  }
  componentDidMount() {
    this.initTabs();
  }
  initTabs() {
    const {can} = this.props;
    const tabList = tabListAll.filter(i => can(i.code));
    const type = tabList[0].key;
    this.setState({type, tabList});
    this.handleFetchAction(type);
  }
  handleFetchAction(type) {
    this.props.dispatch({
      type: 'resourceFlow/fetch',
      payload: type,
    });
  }
  handleTabChange = (key) => {
    const { form } = this.props;
    form.resetFields();
    this.handleFetchAction(key);
    this.setState({type: key});
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'resourceFlow/edit',
          payload: {...values, type: this.state.type},
        })
      }
    })
  }

  renderNewRetailContent() {
    const { form: { getFieldDecorator }, resourceFlow, loading, submitting } = this.props;
    const formItemLayout = {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
    };

    return (
      <Card title="IS/OS销售模式配置管理" loading={loading} bordered={false}>
        <Form layout="horizontal" onSubmit={this.handleSubmit} className={styles.resourceFlowForm}>
          <Row gutter={16}>
            <Col md={10} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.ownCleanValidTime}>
                {getFieldDecorator('ownCleanValidTime', {
                  initialValue: resourceFlow.newRetailFlow.ownCleanValidTime,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" addonAfter="天" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10, offset: 2 }} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.ownCleanNum}>
                {getFieldDecorator('ownCleanNum', {
                  initialValue: resourceFlow.newRetailFlow.ownCleanNum,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ marginBottom: 32 }} />
          <Row gutter={16}>
            <Col md={{ span: 10 }} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.isApplyValidTime}>
                {getFieldDecorator('isApplyValidTime', {
                  initialValue: resourceFlow.newRetailFlow.isApplyValidTime,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" addonAfter="天" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10, offset: 2 }} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.isApplyNum}>
                {getFieldDecorator('isApplyNum', {
                  initialValue: resourceFlow.newRetailFlow.isApplyNum,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10 }} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.isOwnValidTime}>
                {getFieldDecorator('isOwnValidTime', {
                  initialValue: resourceFlow.newRetailFlow.isOwnValidTime,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" addonAfter="天" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10, offset: 2 }} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.isOwnNum}>
                {getFieldDecorator('isOwnNum', {
                  initialValue: resourceFlow.newRetailFlow.isOwnNum,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10 }} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.leaderApplyValidTime}>
                {getFieldDecorator('leaderApplyValidTime', {
                  initialValue: resourceFlow.newRetailFlow.leaderApplyValidTime,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" addonAfter="天" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10, offset: 2 }} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.leaderApplyNum}>
                {getFieldDecorator('leaderApplyNum', {
                  initialValue: resourceFlow.newRetailFlow.leaderApplyNum,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10 }} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.noGetTime}>
                {getFieldDecorator('noGetTime', {
                  initialValue: resourceFlow.newRetailFlow.noGetTime,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" addonAfter="天" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ marginBottom: 32 }} />
          <Row gutter={16}>
            <Col md={{ span: 10 }} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.osPrivateValidTime}>
                {getFieldDecorator('osPrivateValidTime', {
                  initialValue: resourceFlow.newRetailFlow.osPrivateValidTime,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" addonAfter="天" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10, offset: 2 }} sm={24}>
              <Form.Item {...formItemLayout} label={newRetailFieldLabels.osPrivateNum}>
                {getFieldDecorator('osPrivateNum', {
                  initialValue: resourceFlow.newRetailFlow.osPrivateNum,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ marginBottom: 32 }} />
          <Row>
            <Col md={{ span: 10, offset: 5 }} sm={24}>
              <Button type="primary" htmlType="submit" loading={submitting}>保存</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    )
  }

  renderArrivalContent() {
    const { resourceFlow, submitting, loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
    };
    return (
      <Card title="普通销售模式配置管理" loading={loading} bordered={false}>
        <Form layout="horizontal" onSubmit={this.handleSubmit} className={styles.resourceFlowForm}>
          <Row gutter={16}>
            <Col md={10} sm={24}>
              <Form.Item {...formItemLayout} label={arrivalFieldLabels.ownCleanValidTime}>
                {getFieldDecorator('ownCleanValidTime', {
                  initialValue: resourceFlow.arrivalFlow.ownCleanValidTime,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" addonAfter="天" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10, offset: 2 }} sm={24}>
              <Form.Item {...formItemLayout} label={arrivalFieldLabels.ownCleanNum}>
                {getFieldDecorator('ownCleanNum', {
                  initialValue: resourceFlow.arrivalFlow.ownCleanNum,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ marginBottom: 32 }} />
          <Row gutter={16}>
            <Col md={{ span: 10 }} sm={24}>
              <Form.Item {...formItemLayout} label={arrivalFieldLabels.osPrivateValidTime}>
                {getFieldDecorator('osPrivateValidTime', {
                  initialValue: resourceFlow.arrivalFlow.osPrivateValidTime,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" addonAfter="天" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10, offset: 2 }} sm={24}>
              <Form.Item {...formItemLayout} label={arrivalFieldLabels.osPrivateNum}>
                {getFieldDecorator('osPrivateNum', {
                  initialValue: resourceFlow.arrivalFlow.osPrivateNum,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" />
                )}
              </Form.Item>
            </Col>
            <Col md={{ span: 10 }} sm={24}>
              <Form.Item {...formItemLayout} label={arrivalFieldLabels.noGetTime}>
                {getFieldDecorator('noGetTime', {
                  initialValue: resourceFlow.arrivalFlow.noGetTime,
                  rules: [{required: true, pattern: /^\d*$/, message: '请输入有效数值'}],
                })(
                  <Input type="number" step="1" min="1" addonAfter="天" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ marginBottom: 32 }} />
          <Row>
            <Col md={{ span: 10, offset: 5 }} sm={24}>
              <Button type="primary" htmlType="submit" loading={submitting}>保存</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    )
  }

  renderContent() {
    return this.state.type == '1' ? this.renderNewRetailContent() : this.renderArrivalContent();
  }

  render() {
    return (
      <PageHeaderLayout
        tabList={this.state.tabList}
        activeTabKey={this.state.type}
        onTabChange={this.handleTabChange}
      >
        {this.renderContent()}
      </PageHeaderLayout>
    )
  }
}
