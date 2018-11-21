import React, {PureComponent} from "react";
import moment from 'moment';
import _ from 'lodash'
import Dialog from '../../../../components/Dialog';
import can from '../../../../decorators/Can'
import common from '../../../Personnel/common/index.less'
import DescriptionList from '../../../../components/DescriptionList';
import part from '../index.less'
import styles from './index.less'
import boundary from '../../../../decorators/Boundary';
import request from '../../../../utils/request';
import regExp from '../../../../utils/regexp';
import {Region} from '../../../../components/Cascader';
import {
  getCall,
  getDate,
  getEmail,
  getGender,
  getQQ,
  getWeChat,
  getCustomerType,
  getFromSource,
} from '../../../../utils/helpers';
import {
  Card,
  Tabs,
  Table,
  Input,
  Form,
  Select,
  Button,
  DatePicker,
  message,
  Radio,
} from 'antd';

const {TextArea} = Input;
const FormItem = Form.Item;
const Option = Select.Option;
const {Description} = DescriptionList;
const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
};
const formItem = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  }
};
const dateFormat = 'YYYY-MM-DD';
const TabPane = Tabs.TabPane;
@can([10002000])
@boundary
export default class BaseInfo extends React.Component {
  state = {
    linkmanList: [],
    baseInfo: [],
    shopinfo: [],
    loading: true,
    pagination: {},
    current: '',
    id: '',
    clewId: ""
  }
  edit = (record, fromSource, storeId, isStore) => async () => {
    const beforeInfo = record;
    const {id} = record;
    const {current: page} = this.state;
    const {baseInfo: {data: baseInfo = {}}} = this.props;
    const {clewId, id: customerId} = baseInfo;
    Dialog.open({
      title: id ? '编辑联系人' : '新建联系人',
      width: 700,
      formProps: {
        action: `/api/customer/${customerId}/customerLink`,
        method: id ? 'PUT' : 'POST',
        valuesFilter: values => {
          return _.omit(_.merge(values, {clewId, id, storeId, isStore}), _.isUndefined, fromSource)
        },
        onSubmitted: ({code, data}) => {
          if (isStore) {
            this.getshopinfo(customerId);
          } else {
            this.getContacts(clewId, page);
          }
          if (code === 0) {
            message.success('处理成功')
          } else {
            message.error('处理失败')
          }
        }
      },
      render({props: {form: {getFieldDecorator}}}) {
        return (
          <div>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='姓名'>
                {
                  getFieldDecorator('linkName', {
                    rules: [{required: true, message: '请输入您的姓名'}],
                    initialValue: id ? beforeInfo.linkName : ''
                  })(
                    <Input placeholder="请输入您的姓名"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='性别'>
                {
                  getFieldDecorator('sex', {
                    initialValue: id ? beforeInfo.sex : 1
                  })(
                    <RadioGroup>
                      <Radio value={1}>男</Radio>
                      <Radio value={2}>女</Radio>
                    </RadioGroup>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='电话1'>
                {
                  getFieldDecorator('mobile', {
                    rules: [
                      {required: true, message: '请输入正确的手机号', pattern: regExp.REG_MOBILE},
                    ],
                    initialValue: id ? beforeInfo.mobile : ''
                  })(
                    <Input placeholder="请输入您的手机"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='电话2'>
                {
                  getFieldDecorator('phone', {
                    rules: [
                      {
                        validator: (r, v, c) => {
                          if (isNaN(v * 1)) {
                            c('请输入正确的座机号码');
                          }
                          c();
                        },
                      }
                    ],
                    initialValue: id ? beforeInfo.phone : ''
                  })(
                    <Input placeholder="请输入您的座机"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='QQ'>
                {
                  getFieldDecorator('qq', {
                    rules: [{
                      validator: (r, v, c) => {
                        if (isNaN(v * 1)) {
                          c('请输入正确的QQ');
                        }
                        c();
                      },
                    }],
                    initialValue: id ? beforeInfo.qq : ''
                  })(
                    <Input placeholder="请输入您的QQ"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='微信'>
                {
                  getFieldDecorator('wechat', {
                    initialValue: id ? beforeInfo.wechat : ''
                  })(
                    <Input placeholder="请输入您的微信"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='邮箱'>
                {
                  getFieldDecorator('email', {
                    rules: [{required: true, message: '请输入正确的的email', pattern: regExp.REG_EMAIL},],
                    initialValue: id ? beforeInfo.email : ''
                  })(
                    <Input placeholder="请输入您的邮箱"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='所属部门'>
                {
                  getFieldDecorator('department', {
                    initialValue: id ? beforeInfo.department : ''
                  })(
                    <Input placeholder="所属部门"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='职务'>
                {
                  getFieldDecorator('position', {
                    rules: [{message: '请输入您的职务'}],
                    initialValue: id ? beforeInfo.position : ''
                  })(
                    <Input placeholder="请输入您的职务"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='备注'>
                {
                  getFieldDecorator('remark', {
                    rules: [{message: '备注'}],
                    initialValue: id ? beforeInfo.remark : ''
                  })(
                    <TextArea placeholder="备注" autosize/>
                  )
                }
              </FormItem>
            </div>
          </div>
        );
      }
    });
  };
  // 编辑基本信息
  baseInfo = () => async () => {
    const {baseInfo: {data: baseInfo = {}}} = this.props;
    const {id} = baseInfo;
    Dialog.open({
      title: '编辑基本信息',
      width: 700,
      formProps: {
        action: '/api/customer/update',
        method: 'PUT',
        valuesFilter: values => _.merge(values, {id, registerTime: moment(values.registerTime).format(dateFormat)}),
        onSubmitted: (res) => {
          if (res.data) {
            this.props.baseInfo.reload()
            message.success('编辑成功')
          } else {
            message.error('编辑失败')
          }
        }
      },
      render({props: {form: {getFieldDecorator}}}) {
        return (
          <div>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='行业'>
                {
                  getFieldDecorator('industry', {
                    initialValue: baseInfo.industry
                  })(
                    <Input placeholder="请输入您的姓名"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='地址'>
                {
                  getFieldDecorator('detailAddress', {
                    rules: [{message: '地址'}],
                    initialValue: baseInfo.detailAddress
                  })(
                    <Input placeholder="请输入地址"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='经营状态'>
                {
                  getFieldDecorator('manageStatus', {
                    initialValue: baseInfo.manageStatus
                  })(
                    <Input placeholder="请输入经营状态"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='经营范围'>
                {
                  getFieldDecorator('manageArea', {
                    rules: [{message: '经营范围'}],
                    initialValue: baseInfo.manageArea
                  })(
                    <Input placeholder="经营范围"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='主营产品'>
                {
                  getFieldDecorator('manageProduct', {
                    rules: [{message: '主营产品'}],
                    initialValue: baseInfo.manageProduct
                  })(
                    <Input placeholder="主营产品"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='法人信息'>
                {
                  getFieldDecorator('legalPerson', {
                    initialValue: baseInfo.legalPerson
                  })(
                    <Input placeholder="法人"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='注册时间'>
                {
                  getFieldDecorator('registerTime', {
                    initialValue: moment(baseInfo.registerTime, dateFormat)
                  })(
                    <DatePicker
                      style={{width: '100%'}}
                      format={dateFormat}
                      placeholder="注册时间"
                    />
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='注册地址'>
                {
                  getFieldDecorator('registerAddress', {
                    initialValue: baseInfo.registerAddress
                  })(
                    <Input placeholder="注册地址"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='资质类型'>
                {
                  getFieldDecorator('qualificationType', {
                    initialValue: baseInfo.qualificationType
                  })(
                    <Input placeholder="资质类型"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='证件号码'>
                {
                  getFieldDecorator('certificateNumber', {
                    rules: [{
                      validator: (r, v, c) => {
                        if (isNaN(v * 1)) {
                          c('请输入正确的证件号码');
                        }
                        c();
                      },
                    }],
                    initialValue: baseInfo.certificateNumber
                  })(
                    <Input placeholder="证件号码"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item + ' ' + styles.fullline}>
              <FormItem {...formItem} label='公司详情'>
                {
                  getFieldDecorator('companyDetail', {
                    initialValue: baseInfo.companyDetail
                  })(
                    <TextArea placeholder="公司详情" autosize/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='账号主体'>
                {
                  getFieldDecorator('accountMainBody', {
                    initialValue: baseInfo.accountMainBody
                  })(
                    <Input placeholder="账号主体"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='备注'>
                {
                  getFieldDecorator('remark', {
                    initialValue: baseInfo.remark
                  })(
                    <TextArea placeholder="备注" autosize/>
                  )
                }
              </FormItem>
            </div>
          </div>
        );
      }
    });
  }
  // 编辑门店信息
  editStore = record => async () => {
    const {baseInfo: {data: baseInfo = {}}} = this.props;
    Dialog.open({
      title: '编辑门店信息',
      width: 700,
      formProps: {
        valuesFilter: values => _.merge(values, {id: record.id}),
        action: '/api/store',
        method: 'PUT',
        onSubmitted: (res) => {
          this.getshopinfo(baseInfo.id);
        }
      },
      render({props: {form: {getFieldDecorator}}}) {
        return (
          <div>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='门店名'>
                {
                  getFieldDecorator('storeName', {
                    initialValue: record.storeName
                  })(
                    <Input placeholder="请输入门店名"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='地址'>
                {
                  getFieldDecorator('address', {
                    initialValue: record.address
                  })(
                    <Input placeholder="请输入地址"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='地区'>
                {
                  getFieldDecorator('areaCode', {
                    initialValue: record.areaCode
                  })(
                    <Region/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='经营状态'>
                {
                  getFieldDecorator('status', {
                    initialValue: record.status
                  })(
                    <Input placeholder="请输入经营状态"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='备注'>
                {
                  getFieldDecorator('remark', {
                    initialValue: record.remark
                  })(
                    <Input placeholder="请输入备注"/>
                  )
                }
              </FormItem>
            </div>
          </div>
        );
      }
    });
  }
  // 联系人信息
  retail = [{
    title: '姓名',
    dataIndex: 'linkName',
  }, {
    title: '性别',
    dataIndex: 'sex',
    render: getGender,
  }, {
    title: '电话1',
    dataIndex: 'mobile',
    render: getCall,
  }, {
    title: '电话2',
    dataIndex: 'phone',
    render: getCall,
  }, {
    title: 'qq',
    dataIndex: 'qq',
    render: getQQ,
  }, {
    title: '微信',
    dataIndex: 'wechat',
    render: getWeChat,
  }, {
    title: '邮箱',
    dataIndex: 'email',
    render: getEmail,
  }, {
    title: '部门',
    dataIndex: 'department',
  }, {
    title: '职务',
    dataIndex: 'position',
  }, {
    title: '创建人',
    dataIndex: 'createUser',
  }, {
    title: '创建时间',
    dataIndex: 'createTime',
  }, {
    title: '备注',
    dataIndex: 'remark',
  }, {
    title: '操作',
    key: 'action',
    render: (text, record) => {
      const {service: {data: service = []}, can} = this.props;
      console.info('service', service);
      return (
        <div className={common.operate}>
          {
            can([10002004, service]) && !!service.length &&
            < span className={common.item} onClick={this.edit(record, 1)}>编辑</span>
          }
        </div>
      )
    },
  }];
  // 到店
  storeContacts = [{
    title: '姓名',
    dataIndex: 'linkName',
  }, {
    title: '性别',
    dataIndex: 'sex',
    render: getGender,
  }, {
    title: '电话1',
    dataIndex: 'mobile',
    render: getCall,
  }, {
    title: '电话2',
    dataIndex: 'phone',
    render: getCall,
  }, {
    title: 'qq',
    dataIndex: 'qq',
    render: getQQ,
  }, {
    title: '微信',
    dataIndex: 'wechat',
    render: getWeChat,
  }, {
    title: '邮箱',
    dataIndex: 'email',
    render: getEmail,
  }, {
    title: '部门',
    dataIndex: 'department',
  }, {
    title: '职务',
    dataIndex: 'position',
  }, {
    title: '创建人',
    dataIndex: 'createUser',
  }, {
    title: '创建时间',
    dataIndex: 'createTime',
    render: getDate,
  }, {
    title: '备注',
    dataIndex: 'remark',
  }, {
    title: '操作',
    key: 'action',
    render: (text, record) => {
      const {service: {data: service = []}, can} = this.props;
      return (
        <div className={common.operate}>
          {
            can([10002004, service]) && !!service.length &&
            <span className={common.item} onClick={this.edit(record, 1, record.storeId, true)}>编辑</span>
          }
        </div>
      )
    }
  }];
  // 门店信息
  shopDetail = [
    {
      title: '门店名',
      dataIndex: 'storeName',
    }, {
      title: '地区',
      dataIndex: 'area',
    }, {
      title: '地址',
      dataIndex: 'address',
    }, {
      title: '经营状态',
      dataIndex: 'status',

    }, {
      title: '备注',
      dataIndex: 'remark',
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (text, record) => {
        const {service: {data: service = []}, can} = this.props;
        return (
          <div>
            {
              can([10002002, service]) && !!service.length &&
              <a onClick={this.editStore(record)}>编辑</a>
            }
          </div>
        )
      }
    }
  ];
  getContacts = async (clewId, page = 1, pageSize = 10) => {
    this.setState({
      loading: true,
    })
    let {data, pagination} = await request(`/api/customer/${clewId}/customerLinks`, {
      query: {page, pageSize}
    });
    this.setState({
      linkmanList: data,
      pagination,
      current: pagination.page,
      loading: false,
    })
  }
  // 获取门店信息
  getshopinfo = async (id) => {
    const {data} = await request(`/api/customer/${id}/stores`)
    this.setState({
      shopinfo: data || []
    });
  };

  componentWillReceiveProps({baseInfo: {data: baseInfo = {}}}) {
    const {clewId, id} = baseInfo;
    baseInfo !== this.props.baseInfo && this.setState({id, clewId});
    if (!this.loaded && id) {
      this.getContacts(clewId);
      this.getshopinfo(id);
      this.loaded = true;
    }
  }

  paging = (page, pageSize) => {
    const {clewId} = this.state;
    this.setState({
      current: page,
      loading: true
    });
    this.getContacts(clewId, page)
  }

  render() {
    const {baseInfo: {data: baseInfo = {}, loading: baseInfoLoading}, service: {data: service = []}, can} = this.props;
    // 编辑基本信息   新建联系人
    const {linkmanList, shopinfo, pagination: paginfo, current, loading} = this.state;
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    const pagination = {
      current,
      pageSize,
      total,
      onChange: this.paging,
    };
    const clewTypeMap = new Map([
      [1, '新零售'],
      [2, '到店'],
      [3, '渠道加盟'],
      [4, '定制开发'],
    ]);
    return (
      <Card bordered={false} loading={baseInfoLoading}>
        <div className={part.tabs_content}>
          {/*<div>*/}
          <Card className={common.card} title="基本信息">
            <div className={styles.btn}>
              {
                can([10002002, service]) && !!service.length &&
                <Button type='primary'
                        className={common.marginTop} onClick={this.baseInfo()}>编辑</Button>
              }
            </div>
            <DescriptionList col="4" gutter={0} size="large">
              <Description term="客户名称">{baseInfo.customerName}</Description>
              <Description term="线索id">{baseInfo.clewId}</Description>
              <Description term="线索类型">{clewTypeMap.get(baseInfo.clewType)}</Description>
              <Description term="客户类型">{getCustomerType(baseInfo.customerType)}</Description>
              <Description term="商户名称">{baseInfo.shopName}</Description>
              <Description term="一级来源">{baseInfo.firstFromSourceName}</Description>
              <Description term="二级来源">{baseInfo.secondFromSourceName}</Description>
              <Description term="来源标签">{getFromSource(baseInfo.fromSource)}</Description>
              <Description term="创建时间">{baseInfo.createTime}</Description>
              <Description term="注册时间">{baseInfo.registerTime}</Description>
              <Description term="账号主体">{baseInfo.accountMainBody}</Description>
              <Description term="行业">{baseInfo.industry}</Description>
              <Description term="地区">{baseInfo.area}</Description>
              <Description term="地址">{baseInfo.detailAddress}</Description>
              <Description term="经营状态">{baseInfo.manageStatus}</Description>
              <Description term="经营范围">{baseInfo.manageArea}</Description>
              <Description term="主营产品">{baseInfo.manageProduct}</Description>
              <Description term="注册地址">{baseInfo.registerAddress}</Description>
              <Description term="法人信息">{baseInfo.legalPerson}</Description>
              <Description term="资质类型">{baseInfo.qualificationType}</Description>
              <Description term="证件号码">{baseInfo.certificateNumber}</Description>
              <Description term="公司详情">{baseInfo.companyDetail}</Description>
              <Description term="更新时间	">{baseInfo.updateTime}</Description>
              <Description term="更新人">{baseInfo.updateUser}</Description>
            </DescriptionList>
            <div>
              <div className={styles.btn}>
                {
                  can([10002003, service]) && !!service.length &&
                  <Button type='primary' onClick={this.edit({}, 1)}
                  >新建联系人
                  </Button>
                }
              </div>
              <Table columns={this.retail}
                     dataSource={linkmanList}
                     pagination={pagination}
                     rowKey="id"
                     scroll={{x: 1000}}
                     loading={loading}
                     className={`${common.tableBody} ${common.foldtable}`}/>
            </div>
          </Card>
          {
            shopinfo.length ? <Card className={common.marginTop} title="连锁门店信息">
              <Tabs defaultActiveKey="1">
                {
                  shopinfo.map((item, index) => (
                    <TabPane tab={item.storeName} key={index + 1}>
                      <div className={styles.tabs_content}>
                        <span className={styles.shopDetails}>门店基本信息</span>
                        <Table columns={this.shopDetail}
                               dataSource={shopinfo}
                               pagination={false}
                               rowKey="id"
                               className={`${common.tableBody} ${common.foldtable}`}/>
                      </div>
                      {/*联系人信息*/}
                      <div className={styles.btn}>
                        {
                          can([10002003, service]) && !!service.length &&
                          <Button type='primary' onClick={this.edit({}, 2, item.id, true)}
                          >新建联系人
                          </Button>
                        }
                      </div>
                      <Table columns={this.storeContacts}
                             dataSource={item.contacts}
                             pagination={false}
                             rowKey="id"
                             className={`${common.tableBody} ${common.foldtable}`}/>
                    </TabPane>
                  ))
                }
              </Tabs>
            </Card> : ''
          }
        </div>
      </Card>
    )
  }
}
