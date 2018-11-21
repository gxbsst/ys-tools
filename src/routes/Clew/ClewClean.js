import React, { PureComponent } from 'react';
import {
  Divider, Card, Button, Form, Icon, Col, Row, DatePicker, Input, Spin,
  Select, Popover, Popconfirm, message, Menu, Dropdown, Tooltip,
} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import classNames from 'classnames';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FooterToolbar from '../../components/FooterToolbar';
import DescriptionList from '../../components/DescriptionList';
import Exception from '../../components/Exception';
import boundary from '../../decorators/Boundary';
import can from '../../decorators/Can';
import ClewAbandonModal from './Modal/ClewAbandonModal';
import ClewRepeatModal from './Modal/ClewRepeatModal';
import { Region, Industry } from '../../components/Cascader';
import ContactsForm from './_ContactsForm';
import StoresForm from './ChainStore';
import {clew as clewAuth} from '../../utils/auth';
import styles from './ClewClean.less';
import {
  clewFieldLabels,
  customerFieldLabels,
  clewTypeMap,
  cleanTagMap,
  customerTypeMap,
  renderOptions,
} from '../../utils/paramsMap';

const { TextArea } = Input;
const { Description } = DescriptionList;

const fieldLabels = { ...clewFieldLabels, ...customerFieldLabels };

@connect(state => ({
  clew: state.clews.clew,
  cleanFieldsChanged: state.clews.cleanFieldsChanged,
  submitting: state.clews.clewSubmitting,
  loading: state.loading.effects['clews/detail'],
}))
@Form.create({
  onFieldsChange(props) {
    props.dispatch({
      type: 'clews/onCleanFieldsChange',
      payload: true,
    });
  },
})
@boundary
export default class ClewClean extends PureComponent {
  state = {
    repeatModalVisible: false,
    abandonModalVisible: false,
    abandonSubmitting: false,
    customerType: 0,
  };
  componentWillUnmount() {
    this.props.dispatch({
      type: 'clews/onCleanFieldsChange',
      payload: false,
    });
  }
  componentDidMount() {
    this.initCustomerType(this.props.clew.clewInfo.customerType);
  }
  initCustomerType(customerType) {
    this.setState({customerType});
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.clew.clewInfo.customerType !== this.props.clew.clewInfo.customerType) {
      this.initCustomerType(nextProps.clew.clewInfo.customerType);
    }
  }
  customerTypeChange = (value) => {
    this.setState({
      customerType: value,
    });
  };
  rollout = (inputType) => {
    this.props.dispatch({
      type: 'clews/rollout',
      payload: {
        id: this.props.match.params.id,
        inputType,
      },
    })
  }
  gotoDetail = () => {
    const {dispatch, match} = this.props;
    dispatch(routerRedux.push(match.url.replace('clean', 'detail')));
  }
  arraign = () => {
    this.props.dispatch({
      type: 'clews/arraign',
      payload: { id: this.props.match.params.id },
    })
  }
  activate = () => {
    this.props.dispatch({
      type: 'clews/activate',
      payload: { id: this.props.match.params.id },
    })
  }
  showAbandonModal = () => {
    this.setState({
      abandonModalVisible: true,
    })
  }
  handleRepeatModalCancel = () => {
    this.setState({ repeatModalVisible: false });
  };
  handleAbandonModalCancel = () => {
    this.setState({
      abandonModalVisible: false,
    })
  }
  handleAbandonModalOk = (data) => {
    const {dispatch, match} = this.props;
    this.setState({
      abandonSubmitting: true,
    })
    dispatch({
      type: 'clews/abandon',
      payload: { ...data, ids: [match.params.id] },
    }).then((response) => {
      this.setState({
        abandonSubmitting: false,
      })
      if (!response.code) {
        message.success(response.message);
        this.setState({
          abandonModalVisible: false,
        })
        dispatch(routerRedux.push('/clew/clews'));
      } else {
        message.error(response.message);
      }
    });
  }
  render() {
    const { clew: {
      clewInfo, contacts, stores,
    }, match } = this.props;
    const {id} = match.params;
    const { form, dispatch, submitting } = this.props;
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
              clewId: id,
            },
            customerLinks,
            storeInfos
          };

          // submit the values
          dispatch({
            type: 'clews/clean',
            payload: postData,
          }).then(res => {
            if (!res.code) {
              dispatch({
                type: 'clews/onCleanFieldsChange',
                payload: false,
              });
              message.success(res.message);
              dispatch(routerRedux.push(match.url.replace('clean', 'detail')))
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
            <Icon type="cross-circle-o" className={styles.errorIcon} />
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
            <Icon type="exclamation-circle" />
          </Popover>
          {errorCount}
        </span>
      );
    };
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const cleanFormLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };
    const handleMenuClick = (e) => {
      this.rollout(~~e.key);
    }
    const menu = (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="1">到公海</Menu.Item>
        <Menu.Item key="2">到私海</Menu.Item>
      </Menu>
    );
    const action = (
      <div>
        {
          clewInfo.clewStatus == 2 && //售前待清洗
          can([3001003], clewInfo.handlerNo) && //售前清洗权限 & 当前处理人
          <Popconfirm title="确定转出此线索吗?" onConfirm={() => this.rollout()} okText="确定" cancelText="取消">
            <Button disabled={this.props.cleanFieldsChanged} type="primary">转出</Button>
          </Popconfirm>
        }
        {
          clewInfo.clewStatus == 5 && //直销待清洗
          !(clewInfo.fromSource == 1 && clewInfo.clewBizType == 2) && //非新零售常规组
          can([4002003, 5001004], clewInfo.handlerNo) && //新零售订单组和到店清洗权限 & 当前处理人
          <Dropdown overlay={menu}>
            <Button disabled={this.props.cleanFieldsChanged} type="primary">
              转出 <Icon type="down" />
            </Button>
          </Dropdown>
        }
        {
          clewInfo.clewStatus == 5 && //直销待清洗
          clewInfo.fromSource == 1 && //新零售
          clewInfo.clewBizType == 2 && //常规组
          can([4001005], clewInfo.handlerNo) && //新零售常规组清洗权限 & 当前处理人
          <Popconfirm title="确定提审此线索吗?" onConfirm={this.arraign} okText="确定" cancelText="取消">
            <Button disabled={this.props.cleanFieldsChanged} type="primary">提审</Button>
          </Popconfirm>
        }
        {
          [2, 5].includes(clewInfo.clewStatus) && //待清洗
          !(clewInfo.fromSource == 1 && clewInfo.clewBizType == 2) && //非新零售常规组
          can([3001003, 4002003, 5001004], clewInfo.handlerNo) && //售前客服|新零售订单组|到店 清洗权限 & 当前处理人
          <Button disabled={this.props.cleanFieldsChanged} type="danger" onClick={this.showAbandonModal}>废弃</Button>
        }
      </div>
    );
    const tips = `( * )字段为${clewInfo.clewStatus == 5 && clewInfo.fromSource == 1 && clewInfo.clewBizType == 2 ? '提审' : '转出'}必填字段`;
    const modalProps = {
      visible: this.state.abandonModalVisible,
      onOk: this.handleAbandonModalOk,
      onCancel: this.handleAbandonModalCancel,
      destroyOnClose: true,
      confirmLoading: this.state.abandonSubmitting,
    }

    const customerInfo = this.state.customerType == 1 ? 'idNumber' : 'customerName';
    return (
      clewInfo.clewStatus && //数据已获取
      !clewAuth.clean(can, clewInfo)
        ?
      <Exception type="403"/>
        :
      <PageHeaderLayout
        action={action && tips}
        wrapperClassName={styles.advancedForm}
      >
        <Spin spinning={this.props.loading}>
          <ClewAbandonModal {... modalProps} />
          <Card className={styles.card} bordered={false}>
            <Form layout="horizontal">
              <Form.Item {...cleanFormLayout} label="清洗标签">
                {getFieldDecorator('cleanTag', {
                  initialValue: clewInfo.cleanTag || undefined,
                  rules: [{ required: true, message: '请选择清洗标签' }],
                })(
                  <Select placeholder="请选择清洗标签">
                    {renderOptions(cleanTagMap)}
                  </Select>
                )}
              </Form.Item>
              <Form.Item {...cleanFormLayout} label="清洗备忘录">
                {getFieldDecorator('remark', {
                  initialValue: clewInfo.remark,
                  rules: [{ max: 200, message: '长度限制在200以内' }],
                })(
                  <TextArea style={{ minHeight: 32 }} rows={2} />
                )}
              </Form.Item>
            </Form>
          </Card>
          <Card title="基本信息" className={styles.card} bordered={false}>
            <DescriptionList size="large" col={4} style={{ paddingLeft: 16, paddingRight: 16 }}>
              <Description term="线索ID">{clewInfo.clewId}</Description>
              <Description term="线索来源">
                {`${clewInfo.firstFromSourceName || ''}/${clewInfo.secondFromSourceName || ''}`}
              </Description>
              <Description term="创建时间">{clewInfo.createTime}</Description>
              <Description term="来源标签">{clewInfo.sourceTag}</Description>
            </DescriptionList>
            <Divider />
            <Form layout="horizontal">
              <Row gutter={16}>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item className={styles.requiredMark} {...formItemLayout} label={clewFieldLabels.clewType}>
                    {getFieldDecorator('clewType', {
                      initialValue: clewInfo.clewType || undefined,
                      rules: [{ required: clewInfo.clewStatus === 5, message: `请选择 ${clewFieldLabels.clewType}` }],
                    })(
                      <Select allowClear disabled={clewInfo.clewStatus === 5} placeholder="请选择线索类型">
                        {renderOptions(clewTypeMap)}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item
                    className={classNames({[styles.requiredMark]: clewInfo.clewStatus == 5})}
                    {...formItemLayout}
                    label={customerFieldLabels.customerType}
                  >
                    {getFieldDecorator('customerType', {
                      initialValue: clewInfo.customerType || undefined,
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
                      initialValue: clewInfo.manageStatus,
                      rules: [{ max: 30, message: '长度限制在30以内' }],
                    })(
                      <Input />
                    )}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.registerTime}>
                    {getFieldDecorator('registerTime', {
                      initialValue: moment(clewInfo.registerTime),
                    })(
                      <DatePicker style={{ width: '100%' }} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col lg={8} md={12} sm={24}>
                  {/*<Form.Item {...formItemLayout} label={customerFieldLabels.customerName}>
                    {getFieldDecorator('customerName', {
                      initialValue: clewInfo.customerName,
                      rules: [{ required: true, message: `请选择 ${customerFieldLabels.customerName}` }],
                    })(
                      <Input />
                    )}
                  </Form.Item>*/}
                  <Form.Item
                    className={classNames({[styles.requiredMark]: clewInfo.clewStatus == 5})}
                    {...formItemLayout}
                    label={
                    <span>
                      {customerFieldLabels[customerInfo]}
                      {
                        [2, 3].includes(this.state.customerType) &&
                        <em className={styles.optional}>
                          <Tooltip title={this.state.customerType == 2 ? '工商校验的公司名称' : '外资公司名称'}>
                            <Icon type="info-circle-o" style={{ marginRight: 4, marginLeft: 4 }}/>
                          </Tooltip>
                        </em>
                      }
                    </span>
                  }>
                    {getFieldDecorator(customerInfo, {
                      initialValue: clewInfo[customerInfo],
                      rules: [
                        { message: `请填写 ${customerFieldLabels[customerInfo]}` },
                        { max: 30, message: '长度限制在30以内' },
                      ],
                    })(
                      <Input/>
                    )}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.manageArea}>
                    {getFieldDecorator('manageArea', {
                      initialValue: clewInfo.manageArea,
                      rules: [{ max: 30, message: '长度限制在30以内' }],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.registerAddress}>
                    {getFieldDecorator('registerAddress', {
                      initialValue: clewInfo.registerAddress,
                      rules: [{ max: 30, message: '长度限制在30以内' }],
                    })(
                      <Input />
                    )}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item
                    className={classNames({[styles.requiredMark]: clewInfo.clewStatus == 5 && clewInfo.clewFromSource == 2})}
                    {...formItemLayout}
                    label={customerFieldLabels.shopName}
                  >
                    {getFieldDecorator('shopName', {
                      initialValue: clewInfo.shopName,
                      rules: [
                        // { required: clewInfo.clewStatus == 5 && clewInfo.fromSource == 2,
                        //   message: `请填写 ${customerFieldLabels.shopName}` },
                        { max: 30, message: '长度限制在30以内' },
                      ],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.manageProduct}>
                    {getFieldDecorator('manageProduct', {
                      initialValue: clewInfo.manageProduct,
                      rules: [{ max: 30, message: '长度限制在30以内' }],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.legalPerson}>
                    {getFieldDecorator('legalPerson', {
                      initialValue: clewInfo.legalPerson,
                      rules: [{ max: 30, message: '长度限制在30以内' }],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.qualificationType}>
                    {getFieldDecorator('qualificationType', {
                      initialValue: clewInfo.qualificationType,
                      rules: [{ max: 30, message: '长度限制在30以内' }],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.accountMainBody}>
                    {getFieldDecorator('accountMainBody', {
                      initialValue: clewInfo.accountMainBody,
                      rules: [{ max: 30, message: '长度限制在30以内' }],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.certificateNumber}>
                    {getFieldDecorator('certificateNumber', {
                      initialValue: clewInfo.certificateNumber,
                      rules: [{ max: 30, message: '长度限制在30以内' }],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item
                    className={classNames({[styles.requiredMark]: clewInfo.clewStatus == 5})}
                    {...formItemLayout}
                    label={customerFieldLabels.industryId}
                  >
                    {getFieldDecorator('industryId', {
                      initialValue: clewInfo.industryId,
                    })(
                      <Industry placeholder="请选择行业" />
                    )}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.areaCode}>
                    {getFieldDecorator('areaCode', {
                      initialValue: clewInfo.areaCode,
                      rules: [{ required: true, message: `请选择 ${customerFieldLabels.areaCode}` }],
                    })(
                      <Region disabled={clewInfo.clewStatus == 5 && !(clewInfo.fromSource == 1 && clewInfo.clewBizType == 2)} placeholder="请选择地区" />
                    )}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.detailAddress}>
                    {getFieldDecorator('detailAddress', {
                      initialValue: clewInfo.detailAddress,
                      rules: [{ max: 30, message: '长度限制在30以内' }],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24}>
                  <Form.Item {...formItemLayout} label={customerFieldLabels.companyDetail}>
                    {getFieldDecorator('companyDetail', {
                      initialValue: clewInfo.companyDetail,
                      rules: [{ max: 200, message: '长度限制在200以内' }],
                    })(
                      <TextArea style={{ minHeight: 32 }} rows={3} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card title="联系人信息" className={styles.card} bordered={false}>
            <Form.Item>
              {getFieldDecorator('customerLinks', {
                initialValue: contacts,
                rules: [{ required: true, message: '请添加联系方式' }],
              })(<ContactsForm />)}
            </Form.Item>
          </Card>
          {
            this.state.customerType == '4' &&
            <Card title="门店信息" className={styles.card} bordered={false}>
              <Form.Item>
                {getFieldDecorator('storeInfos', {
                  initialValue: stores || [],
                  rules: [{ required: true, message: '请添加连锁店' }],
                })(<StoresForm />)}
              </Form.Item>
            </Card>
          }

          <ClewRepeatModal
            importResult={this.state.importResult}
            visible={this.state.repeatModalVisible}
            onCancel={this.handleRepeatModalCancel}
          />
          <FooterToolbar style={{ width: this.state.width }}>
          {getErrorInfo()}
          <Button type="default" onClick={() => this.props.history.goBack()}>
            返回
          </Button>
          <Button disabled={!this.props.cleanFieldsChanged} type="primary" onClick={validate} loading={submitting}>
            保存
          </Button>
        </FooterToolbar>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
