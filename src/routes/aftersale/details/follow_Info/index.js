import React, {PureComponent} from "react";
import {
  Card,
  Tabs,
  Table,
  Button,
  Form,
  Input,
  Select,
  Divider,
  message,
  Pagination
} from 'antd';
import _ from 'lodash'
import classNames from 'classnames';
import OsVisit from './tabs/osvisit'
import LinkLog from './tabs/linkLog'
import ChanceLog from './tabs/chanceLog'
import VisitLog from './tabs/visitLog'
import ClewLog from './tabs/clew'
import ArriveChanceLog from './tabs/arriveChanceLog'
import styles from './index.less';
import common from '../../../Personnel/common/index.less'
import request from '../../../../utils/request';
import Dialog from '../../../../components/Dialog';
import autodata from '../../../../decorators/AutoData';
import can from "../../../../decorators/Can";
import boundary from '../../../../decorators/Boundary';


const TabPane = Tabs.TabPane;
const {TextArea} = Input;
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  }
};
const contactType = [
  {value: 1, label: '关怀回访'},
  {value: 2, label: '续费回访'},
  {value: 3, label: '上门拜访'},
  {value: 4, label: '来访记录'},
  {value: 5, label: '来电回访'}
]
const contactTypeMap = new Map([[1, '关怀回访'], [2, '续费回访'], [3, '上门拜访'], [4, '来访记录'], [5, '来电回访']]);

// @autodata({
//   namespace: 'customerContact',
//   url: '/api/customerContact/list/:id'
// })
@can([10003000])
@boundary
export default class FollowInfo extends PureComponent {
  state = {
    followInfo: [],
    loading: true,
    pagination: {},
    current: '',
    id: '',
    clewId: '',
    contacts: [],
    fromSource: ''
  }
  // 跟进信息获取
  columns = [{
    title: '跟进时间',
    dataIndex: 'createTime',
  }, {
    title: '联系类型',
    dataIndex: 'contactType',
    render: (item) => (contactTypeMap.get(item))
  }, {
    title: '联系主题',
    dataIndex: 'linkSubject',
  }, {
    title: '联系内容',
    dataIndex: 'linkContent',
  }, {
    title: '联系人',
    dataIndex: 'linkManName',
  }, {
    title: '跟进人',
    dataIndex: 'createUser',
  }, {
    title: '操作',
    key: 'action',
    render: (text, record) => {
      const {service: {data: service = []}, can} = this.props;
      return (
        <div className={common.operate}>
          {/*<span className={common.item} onClick={this.createInfo(record)}>编辑</span>*/}
          {
            can([10003004, service]) && !!service.length &&
            record.contactType === 5 && <span className={common.item}>听录音</span>
          }
        </div>
      )
    }
  },
  ];
  // 获取联系人信息
  getcontacts = async (clewId) => {
    const {data} = await request(`/api/customer/${clewId}/customerLinks`)
    this.setState({
      contacts: data ? data : []
    })
  }
  handleChange = (value, option) => {
    console.info('other', value, option)
  }
  // 跟进信息创建
  createInfo = () => async () => {
    const {clewId, id, contacts, current: page} = this.state;
    const that = this;
    Dialog.open({
      title: '新建跟进信息',
      width: 530,
      formProps: {
        action: ` /api/customerContact/add`,
        method: 'POST',
        valuesFilter: values => {
          let contactsInfo = contacts.filter(item => (item.id === values.linkManId));
          const linkManTel = contactsInfo[0].mobile;
          const linkManName = contactsInfo[0].linkName
          console.info('contacts', contactsInfo)
          _.merge(values, {customerId: id, linkManTel, serverClass: 0, linkManName});
          for (const key in values) {
            if (values[key] === undefined) {
              delete values[key]
            }
          }
          return values
        },
        onSubmitted: (res) => {
          const {message: msg} = res;
          message.success(msg)
          this.getFollowInfo(id, page)
        }
      },
      render({props: {form: {getFieldDecorator}}}) {
        return (
          <div className={styles.newfollowInfo}>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='联系人'>
                {
                  getFieldDecorator('linkManId', {
                    rules: [{required: true, message: '请输入联系人'}],
                  })(
                    <Select placeholder="请输入联系人" onChange={that.handleChange}>
                      {contacts.map(option => (
                        <Option value={option.id} other={option} key={option.id}>
                          {option.linkName}
                        </Option>
                      ))}
                    </Select>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='联系类型'>
                {
                  getFieldDecorator('contactType', {
                    initialValue: 1
                  })(
                    <Select>
                      {
                        contactType.map(option => (
                          <Option value={option.value} key={option.value}>
                            {option.label}
                          </Option>
                        ))
                      }
                    </Select>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='联系主题'>
                {
                  getFieldDecorator('linkSubject', {
                    rules: [{message: '请输入您的联系主题', required: true,}],
                  })(
                    <Input placeholder="请输入联系主题"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='联系内容'>
                {
                  getFieldDecorator('linkContent', {
                    rules: [{message: '联系内容', required: true,}],
                  })(
                    <TextArea placeholder="联系内容" autosize/>
                  )
                }
              </FormItem>
            </div>
          </div>
        );
      }
    });
  }
  // 跟进信息
  getFollowInfo = async (id, page = 1, pageSize = 10) => {
    const {data, pagination} = await request(`/api/customerContact/list/${id}`, {
      query: {page, pageSize}
    })
    this.setState({
      followInfo: data,
      pagination,
      current: pagination.page,
      loading: false
    });
  }
  paging = (page, pageSize) => {
    const {id} = this.state;
    this.setState({
      current: page,
      loading: true
    });
    this.getFollowInfo(id, page)
  }

  componentWillReceiveProps({baseInfo: {data: baseInfo = {}}}) {
    const {clewId, id} = baseInfo;
    baseInfo !== this.props.baseInfo && this.setState({id, clewId});
    if (!this.loaded && id) {
      this.getFollowInfo(id);
      this.getcontacts(clewId)
      this.loaded = true;
    }
  }

  render() {
    const {baseInfo: {data: baseInfo = {}, loading: baseInfoLoading}, service: {data: service = []}, can} = this.props;
    const {clewId, id: customerId, fromSource} = baseInfo;
    const {columns} = this;
    // 跟进信息
    const {followInfo: dataSource, pagination: paginfo, current, loading} = this.state;
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    const pagination = {
      current,
      pageSize,
      total,
      onChange: this.paging,
    }
    const tableProps = {
      size: 'middle',
      rowKey: 'id',
      columns,
      dataSource,
      pagination,
      loading,
    };
    return (
      <Card bordered={false} loading={baseInfoLoading}>
        {
          can([10003002, service]) && !!service.length &&
          <Button type='primary' style={{marginBottom: 20}} onClick={this.createInfo()}>新建跟进信息</Button>
        }
        <Table {...tableProps}/>
        {
          fromSource === 1 &&
          <Tabs defaultActiveKey="1">
            <TabPane tab="OS拜访记录" key="1">
              <div className={styles.tabs_content}>
                <OsVisit clewId={clewId}/>
              </div>
            </TabPane>
            <TabPane tab="OS机会日志" key="2">
              <div className={styles.tabs_content}>
                <ChanceLog id={customerId} type="os"/>
              </div>
            </TabPane>
            <TabPane tab="IS联系记录" key="3">
              <div className={styles.tabs_content}>
                <LinkLog id={customerId}/>
              </div>
            </TabPane>
            <TabPane tab="IS机会日志" key="4">
              <div className={styles.tabs_content}>
                <ChanceLog id={customerId} type="is"/>
              </div>
            </TabPane>
          </Tabs>
        }
        {
          fromSource === 2 &&
          <Tabs defaultActiveKey="1">
            <TabPane tab="拜访记录" key="1">
              <div className={styles.tabs_content}>
                <VisitLog clewId={clewId} type="os"/>
              </div>
            </TabPane>
            <TabPane tab="机会日志" key="2">
              <div className={styles.tabs_content}>
                <ArriveChanceLog id={customerId}/>
              </div>
            </TabPane>
          </Tabs>
        }
        <Tabs defaultActiveKey="1">
          <TabPane tab="线索日志" key="1">
            <ClewLog clewId={clewId}/>
          </TabPane>
        </Tabs>
      </Card>
    )

  }
}
