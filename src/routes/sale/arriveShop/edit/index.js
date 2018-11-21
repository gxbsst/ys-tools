import React, { PureComponent } from 'react';
import { Card, Button, Form, Icon, Col, Row, DatePicker, Input, Select, Popover, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { Region, Industry } from '../../../../components/Cascader';
import { flattenFields } from '../../../../utils';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import FooterToolbar from '../../../../components/FooterToolbar/';
import DescriptionList from '../../../../components/DescriptionList/index';
import ContactsForm from './ContactsForm';
import ChainStore from './ChainStore';
import styles from './style.less';
import { getFromSource } from '../../../../utils/helpers';

const { Option } = Select;
const { TextArea } = Input;
const { Description } = DescriptionList;

const fieldLabels = {
  'intention.level': '漏斗等级',
  'intention.maxPrice': '意向最大价格',
  'intention.minPrice': '意向最小价格',
  'intention.productTypeId': '意向产品类型',
  'intention.intentionTime': '意向购买时间',
  'intention.productId': '意向产品',
  'chance.customerType': '客户类型',
  'chance.manageStatus': '经营状态',
  'chance.customType': '注册时间',
  'chance.customerName': '客户名称',
  'chance.manageArea': '经营范围',
  'chance.registerAddress': '注册地址',
  'chance.shopName': '商户名称',
  'chance.manageProduct': '主营产品',
  'chance.mainPerson': '法人',
  'chance.accountMainBody': '账号主体',
  'chance.qualificationType': '资质类型',
  'chance.industry': '行业',
  'chance.no': '证件号码',
  'chance.areaCode': '地区',
  'chance.detailAddress': '地址',
  'chance.companyDetail': '公司详情',
  'storeList': '门店',
  'linkList': '联系人',
};
const itemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};

@connect(({ arriveShop, loading, user }) =>
  ({
    currentDetail: arriveShop.currentDetail,
    submitting: loading.effects['arriveShop/editChanceDetail'],
    user,
    id: arriveShop.id,
    fetchingOptions: loading.effects['arriveShop/querySelectOptions'],
  })
)
@Form.create()
export default class EditChanceDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      width: '100%',
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeFooterToolbar);
    this.props.dispatch({
      type: 'arriveShop/queryChanceDetail',
      payload: {
        id: this.props.match.params.id || '',
      },
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

  getSelectOptions(type) {
    if (this.state[type].length === 0) { // 选项为空
      this.props.dispatch({
        type: 'arriveShop/querySelectOptions',
        payload: { type },
      }).then((val) => {
        if (val) {
          this.setState({
            [type]: val,
          });
        }
      });
    }
  }

  resizeFooterToolbar = () => {
    const sider = document.querySelectorAll('.ant-layout-sider')[0];
    const width = `calc(100% - ${sider.style.width})`;
    if (this.state.width !== width) {
      this.setState({ width });
    }
  };

  render() {
    const { form, dispatch, submitting, user: { currentUser }, currentDetail } = this.props;
    if (!currentDetail) {
      return null;
    }
    const {
      customerType,
      manageStatus,
      registerTime,
      customerName,
      manageArea,
      registerAddress,
      shopName,
      manageProduct,
      legalPerson,
      accountMainBody,
      qualificationType,
      industry,
      industryId,
      areaCode,
      detailAddress,
      companyDetail,
      id,
      firstFromSourceName,
      secondFromSourceName,
      fromSource,
      certificateNumber,
      createTime,
      contacts,
      stores,
    } = currentDetail;
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError, getFieldValue, setFieldsValue } = form;
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        // console.info(values)
        if (!error) {
          // submit the values
          const { chance, linkList, storeList } = values;
          if (linkList.some(item => !item.linkType || !item.linkName || !item.phone)) {
            return message.error('联系人信息不完整!');
          } else if(storeList && storeList.some(store => store.contacts.some(item => !item.linkType || !item.linkName || !item.phone))) {
            return message.error('门店联系人信息不完整!');
          }
          const { registerTime } = chance;
          dispatch({
            type: 'arriveShop/editChanceDetail',
            payload: {
              ...values,
              chance: {
                ...chance,
                registerTime: registerTime ? registerTime.format('YYYY-MM-DD') : '',
              },
              id,
            },
          });
        }
      });
    };
    const errors = getFieldsError();
    const getErrorInfo = () => {
      const newError = flattenFields(errors, key => Object.keys(fieldLabels).includes(key), '找不到表单域');
      const errorCount = Object.keys(newError).filter(key => newError[key]).length;
      if (!errors || errorCount === 0) {
        return null;
      }
      const scrollToField = (fieldKey) => {
        const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
        if (labelNode) {
          labelNode.scrollIntoView(true);
        }
      };
      const errorList = Object.keys(newError).map((key) => {
        if (!newError[key]) {
          return null;
        }
        return (
          <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
            <Icon type="cross-circle-o" className={styles.errorIcon}/>
            <div className={styles.errorMessage}>{newError[key][0]}</div>
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
    getFieldDecorator('chance.industry', {
      initialValue: industry,
    });
    return (
      <PageHeaderLayout
        title="编辑信息"
        wrapperClassName={styles.advancedForm}
      >
        <Card
          title={(
            <DescriptionList title="基本信息" style={{ marginBottom: 32 }}>
              <Description term="线索id">{id}</Description>
              <Description term="一级来源">{firstFromSourceName}</Description>
              <Description term="二级来源">{secondFromSourceName}</Description>
              <Description term="来源标签">{getFromSource(fromSource)}</Description>
              <Description term="创建时间">{createTime}</Description>
            </DescriptionList>
          )}
          className={styles.card}
          bordered={false}
        >
          <Form layout="horizontal">
            <Row gutter={16}>
              <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                <Form.Item label="客户类型" {...itemLayout}>
                  {getFieldDecorator('chance.customType', {
                    initialValue: customerType,
                    rules: [{ required: true, message: '请选择客户类型' }],
                  })(
                    <Select placeholder="请选择客户类型" disabled={true}>
                      <Option value={1}>个人商户</Option>
                      <Option value={2}>公司</Option>
                      <Option value={3}>外资公司</Option>
                      <Option value={4}>连锁店</Option>
                      <Option value={9}>未知</Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
                <Form.Item label="经营状态" {...itemLayout}>
                  {getFieldDecorator('chance.manageStatus', {
                    initialValue: manageStatus,
                  })(
                    <Input placeholder="请输入经营状态" />
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
                <Form.Item label="注册时间" {...itemLayout}>
                  {getFieldDecorator('chance.registerTime', {
                    initialValue: moment(registerTime),
                  })(
                    <DatePicker placeholder="注册时间"/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                <Form.Item label="客户名称" {...itemLayout}>
                  {getFieldDecorator('chance.customerName', {
                    initialValue: customerName,
                    rules: [{ required: true, message: '请输入客户名称' }],
                  })(
                    <Input placeholder="请输入客户名称" disabled={true}/>
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
                <Form.Item label="经营范围" {...itemLayout}>
                  {getFieldDecorator('chance.manageArea', {
                    initialValue: manageArea,
                  })(
                    <Input placeholder="请输入"/>
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
                <Form.Item label="注册地址" {...itemLayout}>
                  {getFieldDecorator('chance.registerAddress', {
                    initialValue: registerAddress,
                  })(
                    <Input placeholder="请输入"/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col lg={8} md={12} sm={24}>
                <Form.Item label="商户名称" {...itemLayout}>
                  {getFieldDecorator('chance.shopName', {
                    initialValue: shopName,
                    rules: [{ required: true, message: '请输入商户名称' }],
                  })(
                    <Input placeholder="请输入"/>
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
                <Form.Item label="经营产品" {...itemLayout}>
                  {getFieldDecorator('chance.manageProduct', {
                    initialValue: manageProduct,
                  })(
                    <Input placeholder="请输入"/>
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
                <Form.Item label="法人" {...itemLayout}>
                  {getFieldDecorator('chance.legalPerson', {
                    initialValue: legalPerson,
                  })(
                    <Input placeholder="请输入"/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col lg={8} md={12} sm={24}>
                <Form.Item label="账户主体" {...itemLayout}>
                  {getFieldDecorator('chance.accountMainBody', {
                    initialValue: accountMainBody,
                  })(
                    <Input placeholder="请输入"/>
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
                <Form.Item label="资质类型" {...itemLayout}>
                  {getFieldDecorator('chance.qualificationType', {
                    initialValue: qualificationType,
                  })(
                    <Input placeholder="请输入"/>
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
                <Form.Item label="证件号码" {...itemLayout}>
                  {getFieldDecorator('chance.certificateNumber', {
                    initialValue: certificateNumber,
                  })(
                    <Input placeholder="请输入"/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col lg={8} md={12} sm={24}>
                <Form.Item label="行业" {...itemLayout}>
                  {getFieldDecorator('chance.industryId', {
                    initialValue: industryId || undefined,
                    rules: [{ required: true, message: '请选择行业' }],
                  })(
                    <Industry placeholder="请选择行业" onChange={(_, val) => setFieldsValue({ 'chance.industry' : val && val.showName })}/>
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
                <Form.Item label="地址" {...itemLayout}>
                  {getFieldDecorator('chance.detailAddress', {
                    initialValue: detailAddress,
                  })(
                    <Input placeholder="请输入"/>
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
                <Form.Item label="地区" {...itemLayout}>
                  {getFieldDecorator('chance.areaCode', {
                    initialValue: areaCode,
                    rules: [{ required: true, message: '请选择地区' }],
                  })(
                    <Region
                      style={{ width: '100%' }}
                      placeholder="选择地区"
                      disabled={true}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col>
                <Form.Item label="公司详情">
                  {getFieldDecorator('chance.companyDetail', {
                    initialValue: companyDetail,
                  })(
                    <TextArea placeholder="请输入"/>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        <Card title="联系人信息" className={styles.card} bordered={false}>
          <Form.Item>
            {getFieldDecorator('linkList', {
              initialValue: contacts,
              rules: [
                {
                  validator: (r, v, c) => {
                    if (v.length < 1) {
                      c('至少有一条联系人记录!');
                    }
                    c();
                  },
                }
              ]
            })(<ContactsForm/>)}
          </Form.Item>
        </Card>
        {
          getFieldValue('chance.customType') === 4 &&
          <Form.Item>
            <Card title="门店信息" className={styles.card} bordered={false}>
              {getFieldDecorator('storeList', {
                initialValue: stores,
                rules: [
                  {
                    validator: (r, v, c) => {
                      if (v.length < 1) {
                        c('至少有一条门店记录!');
                      }
                      c();
                    },
                  }
                ]
              })(<ChainStore/>)}
            </Card>
          </Form.Item>
        }
        <FooterToolbar style={{ width: this.state.width }} extra="">
          {getErrorInfo()}
          <Button type="ghost" onClick={() => window.history.back()} style={{ marginRight: '20px' }}>
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

