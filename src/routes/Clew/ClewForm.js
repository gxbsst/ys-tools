import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tooltip, Card, Button, Form, Icon, Col, Row, DatePicker, Input, Select, Popover, message } from 'antd';
import qs from 'qs';
import _ from 'lodash';
import PropTypes from 'prop-types';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FooterToolbar from '../../components/FooterToolbar';
import { FromSource } from '../../components/Selectors';
import { Region, Industry } from '../../components/Cascader';
import can from '../../decorators/Can';
import ClewRepeatModal from './Modal/ClewRepeatModal';
import ContactsForm from './_ContactsForm';
import StoresForm from './ChainStore';
import { toSafeJSON, contain } from '../../utils';
import styles from './ClewForm.less';
import {
  clewFieldLabels,
  customerFieldLabels,
  getEnterTarget,
  enterMap,
  customerTypeMap,
  renderObjOptions,
  renderOptions,
} from '../../utils/paramsMap';

const { TextArea } = Input;
const hasPermission = (has = [], should = []) => has.some(item => should.includes(item));
const enterTarget = getEnterTarget(); // clew enter url &  clew enter target
const fieldLabels = { ...clewFieldLabels, ...customerFieldLabels, foreign: '外资公司名称' };

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@can([2002000], true)
@connect(({ loading }) => ({
  submitting: loading.effects['clews/add'],
}))
@Form.create()
export default class ClewForm extends PureComponent {
  static contextTypes = {
    location: PropTypes.object,
  };
  state = {
    repeatModalVisible: false,
    customerType: '',
    importResult: [],
  };
  customerTypeChange = (value) => {
    this.setState({
      customerType: value,
    });
  };
  handleRepeatModalCancel = () => {
    this.setState({ repeatModalVisible: false });
  };
  resetFormField = () => {
    this.props.form.resetFields();
    this.setState({ repeatModalVisible: false });
    this.props.history.goBack();
  };

  render() {
    const permissions = [2002003, 2002004, 2002005, 2002006, 2002007].filter(i => contain(this.props.permissions, i));
    let { id } = this.props.match.params;
    id = hasPermission(enterMap.find(i => i.url == id).permissions, permissions) ? id : 'clewPool';
    const { form, dispatch, submitting } = this.props;
    const { location: { search } } = this.context;
    const { clewFromSource, customerLinks } = toSafeJSON(_.get(qs.parse(search.substr(1)), 'clew'));
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError } = form;
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          const { clewFromSource, customerLinks, storeInfos, ...restValues } = values;
          const [firstFromSource, secondFromSource] = clewFromSource || [];
          const postData = {
            clewInfo: {
              ...restValues,
              firstFromSource,
              secondFromSource,
            },
            inputType: enterMap.find((value) => value.url == id).id,
            customerLinks,
            storeInfos,
          };
          dispatch({
            type: 'clews/add',
            payload: postData,
          }).then((res) => {
            if (!res.code) {
              message.success(res.message);
              this.props.form.resetFields();
              this.props.history.goBack();
            } else if ([100004, 100005].includes(res.code)) {
              res.data && res.data.length ? this.setState({
                importResult: res.data,
                repeatModalVisible: true,
              }) : message.error(res.message);
            } else {
              message.error(res.message);
            }
          });
        }
      });
    };
    const errors = getFieldsError();
    const getErrorInfo = () => {
      const errorCount = Object.keys(errors).filter(key => errors[key]).length;
      if (!errors || errorCount === 0) {
        return null;
      }
      const scrollToField = (fieldKey) => {
        const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
        if (labelNode) {
          labelNode.scrollIntoView(true);
        }
      };
      const errorList = Object.keys(errors).map((key) => {
        if (!errors[key]) {
          return null;
        }
        return (
          <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
            <Icon type="cross-circle-o" className={styles.errorIcon}/>
            <div className={styles.errorMessage}>{errors[key][0]}</div>
            <div className={styles.errorField}>{fieldLabels[key]}</div>
          </li>
        );
      });
      return (
        <span className={styles.errorIcon}>
          <Popover
            title="表单校验信息"
            content={errorList}
            overlayClassName={styles.errorPopover}
            trigger="click"
            getPopupContainer={trigger => trigger.parentNode}
          >
            <Icon type="exclamation-circle"/>
          </Popover>
          {errorCount}
        </span>
      );
    };

    //线索类型
    const clewTypeMap = (function getClewTypeMap(id) {
      let clewTypeMap = {};
      if (['ISPublic', 'ISPrivate'].includes(id)) {
        clewTypeMap = { ...clewTypeMap, 1: '新零售' };
      }
      if (['arrivalPub', 'arrivalPri'].includes(id)) {
        clewTypeMap = { ...clewTypeMap, 2: '到店', 4: '定制开发' };
      }
      if (['clewPool'].includes(id)) {
        clewTypeMap = { 1: '新零售', 2: '到店', 3: '渠道加盟', 4: '定制开发' };
      }
      return clewTypeMap;
    })(id);

    const formRequired = {}; //必填项

    if (id !== 'clewPool') {
      formRequired.customerType = true;
      formRequired.customerName = true;
      formRequired.idNumber = true;
    }
    if (['arrivalPub', 'arrivalPri'].includes(id)) {
      formRequired.shopName = true;
    }
    let customerInfo = 'customerName';
    if (this.state.customerType == 1) {
      customerInfo = 'idNumber';
    }
    // if (this.state.customerType == 3) {
    //   customerInfo = 'foreign';
    // }
    const action = <div style={{ lineHeight: '32px', textAlign: 'left' }}>{`-${enterTarget[id]}`}</div>;
    return (
      <PageHeaderLayout
        wrapperClassName={styles.advancedForm}
        action={action}
      >
        <Card title="线索信息" className={styles.card} bordered={false}>
          <Form layout="horizontal">
            <Row gutter={16}>
              <Col lg={6} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={clewFieldLabels.clewType}>
                  {getFieldDecorator('clewType', {
                    rules: [{ required: true, message: `请选择 ${clewFieldLabels.clewType}` }],
                  })(
                    <Select allowClear placeholder="请选择线索类型">
                      {renderObjOptions(clewTypeMap)}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                <Form.Item {...formItemLayout} label={clewFieldLabels.clewFromSource}>
                  {getFieldDecorator('clewFromSource', {
                    initialValue: clewFromSource,
                    rules: [{ required: true, message: `请选择 ${clewFieldLabels.clewFromSource}` }],
                  })(
                    <FromSource placeholder="请选择线索来源" />
                  )}
                </Form.Item>
              </Col>
              <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={clewFieldLabels.sourceTag}>
                  {getFieldDecorator('sourceTag', {
                    rules: [{ max: 30, message: '长度限制在30以内' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card title="联系人信息" className={styles.card} bordered={false}>
          <Form.Item>
            {getFieldDecorator('customerLinks', {
              initialValue: customerLinks || [],
              rules: [{ required: true, message: '请添加联系方式' }],
            })(<ContactsForm />)}
          </Form.Item>
        </Card>

        <Card title="客户信息" className={styles.card} bordered={false}>
          <Form layout="horizontal">
            <Row gutter={16}>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.customerType}>
                  {getFieldDecorator('customerType', {
                    rules: [{ required: formRequired.customerType, message: `请选择 ${customerFieldLabels.customerType}` }],
                  })(
                    <Select allowClear placeholder="请选择客户类型" onChange={this.customerTypeChange}>
                      {renderOptions(customerTypeMap)}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.manageStatus}>
                  {getFieldDecorator('manageStatus', {
                    rules: [{ max: 30, message: '长度限制在30以内' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.registerTime}>
                  {getFieldDecorator('registerTime')(
                    <DatePicker style={{ width: '100%' }} />
                  )}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={
                  <span>
                    {customerFieldLabels[customerInfo]}
                    {
                      [2, 3].includes(this.state.customerType) &&
                      <em className={styles.optional}>
                        <Tooltip title={this.state.customerType == 2 ? '工商校验的公司名称' : '外资公司名称'}>
                          <Icon type="info-circle-o" style={{ marginRight: 4, marginLeft: 4 }} />
                        </Tooltip>
                      </em>
                    }
                  </span>
                }>
                  {getFieldDecorator(customerInfo, {
                    rules: [
                      { required: formRequired[customerInfo], message: `请填写 ${customerFieldLabels[customerInfo]}` },
                      { max: 30, message: '长度限制在30以内' },
                    ],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.manageArea}>
                  {getFieldDecorator('manageArea', {
                    rules: [{ max: 30, message: '长度限制在30以内' }],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.registerAddress}>
                  {getFieldDecorator('registerAddress', {
                    rules: [{ max: 30, message: '长度限制在30以内' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.shopName}>
                  {getFieldDecorator('shopName', {
                    rules: [
                      { required: formRequired.shopName, message: `请选择 ${customerFieldLabels.shopName}` },
                      { max: 30, message: '长度限制在30以内' },
                    ]
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.manageProduct}>
                  {getFieldDecorator('manageProduct', {
                    rules: [{ max: 30, message: '长度限制在30以内' }],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.legalPerson}>
                  {getFieldDecorator('legalPerson', {
                    rules: [{ max: 30, message: '长度限制在30以内' }],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.qualificationType}>
                  {getFieldDecorator('qualificationType', {
                    rules: [{ max: 30, message: '长度限制在30以内' }],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.accountMainBody}>
                  {getFieldDecorator('accountMainBody', {
                    rules: [{ max: 30, message: '长度限制在30以内' }],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.certificateNumber}>
                  {getFieldDecorator('certificateNumber', {
                    rules: [{ max: 30, message: '长度限制在30以内' }],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.industryId}>
                  {getFieldDecorator('industryId')(
                    <Industry placeholder="请选择行业" />
                  )}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.areaCode}>
                  {getFieldDecorator('areaCode', {
                    rules: [{ required: true, message: `请选择 ${customerFieldLabels.areaCode}` }],
                  })(
                    <Region placeholder="请选择地区" />
                  )}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.detailAddress}>
                  {getFieldDecorator('detailAddress', {
                    rules: [{ max: 30, message: '长度限制在30以内' }],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item {...formItemLayout} label={customerFieldLabels.companyDetail}>
                  {getFieldDecorator('companyDetail', {
                    rules: [{ max: 200, message: '长度限制在200以内' }],
                  })(
                    <TextArea autosize={{ minRows: 2, maxRows: 4 }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        {
          this.state.customerType == '4' &&
          <Card title="门店信息" className={styles.card} bordered={false}>
            <Form.Item>
              {getFieldDecorator('storeInfos', {
                initialValue: [],
                rules: [{ required: true, message: '请添加连锁店' }],
              })(<StoresForm />)}
              </Form.Item>
          </Card>
        }
        <ClewRepeatModal
          importResult={this.state.importResult}
          resetFormField={this.resetFormField}
          visible={this.state.repeatModalVisible}
          onCancel={this.handleRepeatModalCancel}
        />
        <FooterToolbar style={{ width: '100%' }}>
          {getErrorInfo()}
          <Button type="default" onClick={() => this.props.history.goBack()}>
            取消
          </Button>
          <Button type="primary" onClick={validate} loading={submitting}>
            提交
          </Button>
        </FooterToolbar>
      </PageHeaderLayout>
    );
  }
}
