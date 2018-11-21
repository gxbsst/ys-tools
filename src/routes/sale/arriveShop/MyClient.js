import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Card, Row, Col, Input, Button, DatePicker, Select, Form, Table, Spin } from 'antd';
import { Stars } from '../../../components/Helpers';
import styles from './highSea/index.less';

const FormItem = Form.Item;
const { Search } = Input;
const { Option } = Select;

@connect(state => ({
  data: state.arriveShop,
  user: state.user,
  loading: state.loading.effects['arriveShop/queryCustomersList'],
  fetchingOptions: state.loading.effects['arriveShop/querySelectOptions'],
}))
@Form.create()
export default class HighSeaList extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'arriveShop/queryCustomersList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 2,
        reqType: 'sale',
      },
    });
  }
  toDetail = (id) => {
    this.props.dispatch(routerRedux.push({
      pathname: `/aftersale/details/${id}`,
      query: {
        customerName: id,
      },
    }));
  }
  handleReset = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'arriveShop/queryCustomersList',
      payload: {
        fromSource: 2,
        reqType: 'sale',
      },
    });
  }
  render() {
    const { data: { customersData }, fetchingOptions, form: { getFieldDecorator, getFieldsValue } } = this.props;
    if (!customersData) {
      return null;
    }
    const { data, pagination } = customersData;
    const onSearch = () => {
      const { createTime, ...params } = getFieldsValue();
      this.props.dispatch({
        type: 'arriveShop/queryCustomersList',
        payload: {
          ...params,
          createTime: createTime ? createTime.format('YYYY-MM-DD') : '',
          pageSize: pagination.pageSize,
          fromSource: 2,
          reqType: 'sale',
        },
      });
    };

    const FormTitle = (
      <div style={{ width: '100%', textAlign: 'right' }}>
        <Form>
          <Row>
            <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24} style={{ width: '190px'}}>
              <FormItem>
                {getFieldDecorator('createTime')(
                  <DatePicker style={{ width: '180px' }} />
                )}
              </FormItem>
            </Col>
            <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24} style={{ width: '190px'}}>
              <FormItem>
                {getFieldDecorator('level')(
                  <Select
                    placeholder="所有客户等级"
                    style={{ width: 120 }}
                  >
                    <Option value={1} key={1}><Stars count={1}/></Option>
                    <Option value={2} key={2}><Stars count={2}/></Option>
                    <Option value={3} key={3}><Stars count={3}/></Option>
                    <Option value={4} key={4}><Stars count={4}/></Option>
                    <Option value={5} key={5}><Stars count={5}/></Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24} style={{ width: '345px'}}>
              {getFieldDecorator('customerName')(
                <Search
                  style={{ marginTop: '3px' }}
                  className={styles.extraContentSearch}
                  placeholder="请输入"
                  onSearch={onSearch}
                  enterButton="搜索"
                />
              )}
            </Col>
            <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24} style={{ width: '190px'}}>
              <Button style={{ marginTop: '3px' }} onClick={this.handleReset}>
                重置
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
    const columns = [
      {
        title: '客户ID',
        dataIndex: 'id',
        key: 'id',
      }, {
        title: '客户类型',
        dataIndex: 'customerTypeName',
        key: 'customerTypeName',
      }, {
        title: '客户名',
        dataIndex: 'customerName',
        key: 'customerName',
      }, {
        title: '地区',
        dataIndex: 'area',
        key: 'area',
      }, {
        title: '行业',
        dataIndex: 'industry',
        key: 'industry',
      }, {
        title: '客户等级',
        dataIndex: 'level',
        key: 'level',
        render: value => <Stars count={value}/>,
      }, {
        title: '加急标签',
        dataIndex: 'urgentStatus',
        key: 'urgentStatus',
        render: (text) => (
          <span>{text == 0 ? '未加急' : '加急'}</span>
        ),
      }, {
        title: '当前状态',
        dataIndex: 'statusName',
        key: 'statusName',
      }, {
        title: '处理人',
        dataIndex: 'saleName',
        key: 'saleName',
      }, {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <div>
            <a onClick={() => this.toDetail(record.id)}>详情</a>
          </div>
        ),
      },
    ];
    const paginationProps = {
      current: pagination.page,
      showSizeChanger: true,
      pageSize: pagination.pageSize,
      total: pagination.totalCount,
      showTotal: () => `共${pagination.totalCount}条`,
      onChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryCustomersList',
          payload: {
            ...getFieldsValue(),
            page,
            pageSize: size,
            fromSource: 2,
            reqType: 'sale',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryCustomersList',
          payload: {
            ...getFieldsValue(),
            page,
            pageSize: size,
            fromSource: 2,
            reqType: 'sale',
          },
        });
      },
    };
    const loading = this.props.loading;
    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card
            title={FormTitle}
            className={styles.listCard}
            bordered={false}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
          >
            <Table
              columns={columns}
              dataSource={data}
              pagination={paginationProps}
              loading={loading}
              rowKey={record => `${record.id}`}
            />
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}
