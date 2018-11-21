import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Input, Button, DatePicker, Select, Form, Table, Divider, Spin } from 'antd';
import styles from './style.less';
const FormItem = Form.Item;
const { Search } = Input;
const { Option } = Select;

@connect(state => ({
  data: state.saleRetail,
  loading: state.loading.effects['saleRetail/queryPrivateSeaList'],
  fetchingOptions: state.loading.effects['saleRetail/querySelectOptions'],
}))
@Form.create()
export default class TurnedOutList extends PureComponent {
  state = {
    levels: [],
    status: [],
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'saleRetail/queryPrivateSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 1,
        isSubordinate: 0,
        chanceBizType: 1,
        chanceType: 'is',
        status: 1,
      },
    });
  }
  getSelectOptions(type) {
    if (this.state[type].length === 0) { // 选项为空
      this.props.dispatch({
        type: 'saleRetail/querySelectOptions',
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
  toDetail = (id) => {
    this.props.dispatch({
      type: 'saleRetail/checkCurrentChance',
      payload: {
        id,
      },
    });
  }
  resetSearchParams = () => {
    const { resetFields } = this.props.form;
    resetFields();
    this.props.dispatch({
      type: 'saleRetail/queryPrivateSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 1,
        isSubordinate: 0,
        chanceBizType: 1,
        chanceType: 'is',
        status: 1,
      },
    });
  }
  render() {
    const { data: { privateSeaData }, fetchingOptions, form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { levels } = this.state;
    if (!privateSeaData) {
      return null;
    }
    const { data, pagination } = privateSeaData;
    const onSearch = () => {
      const { createTime, ...params } = getFieldsValue();
      this.props.dispatch({
        type: 'saleRetail/queryPrivateSeaList',
        payload: {
          ...params,
          createTime: createTime ? createTime.format('YYYY-MM-DD') : '',
          pageSize: pagination.pageSize,
          fromSource: 1,
          isSubordinate: 0,
          chanceBizType: 1,
          chanceType: 'is',
          status: 1,
        },
      });
    };

    const FormTitle = (
      <div style={{ width: '100%', textAlign: 'right' }}>
        <Form>
          <Row>
            <Col lg={{ span: 4 }} md={{ span: 8 }} sm={24}>
              <FormItem>
                {getFieldDecorator('createTime')(
                  <DatePicker />
                )}
              </FormItem>
            </Col>
            <Col lg={{ span: 4 }} md={{ span: 8 }} sm={24}>
              <FormItem>
                {getFieldDecorator('level')(
                  <Select
                    placeholder="所有漏斗等级"
                    style={{ width: 120 }}
                    onFocus={this.getSelectOptions.bind(this, 'levels')}
                    notFoundContent={fetchingOptions ? <Spin size="small" /> : null}
                  >
                    {levels.map(item => (
                      <Option value={item.level} key={item.level}>{item.levelName}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
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
            <Col lg={{ span: 4 }} md={{ span: 12 }} sm={24}>
              <Button style={{ marginTop: '3px' }} onClick={this.resetSearchParams}>
                重置
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );

    const columns = [{
      title: '机会ID',
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
      title: '漏斗等级',
      dataIndex: 'levelName',
      key: 'levelName',
    }, {
      title: '加急标签',
      dataIndex: 'urgentStatus',
      key: 'urgentStatus',
      render: (text) => (
        <span>{ text == 0 ? '未加急' : '加急'}</span>
      ),
    }, {
      title: '处理人',
      dataIndex: 'opUserName',
      key: 'opUserName',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <a onClick={() => this.toDetail(record.id)}>详情</a>
        </span>
      ),
    }];

    const paginationProps = {
      current: pagination.page,
      showSizeChanger: true,
      pageSize: pagination.pageSize,
      total: pagination.totalCount,
      showTotal: () => `共${pagination.totalCount}条`,
      onChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryPrivateSeaList',
          payload: {
            page,
            pageSize: size,
            fromSource: 1,
            isSubordinate: 0,
            chanceBizType: 1,
            chanceType: 'is',
            status: 1,
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryPrivateSeaList',
          payload: {
            pageSize: size,
            fromSource: 1,
            isSubordinate: 0,
            chanceBizType: 1,
            chanceType: 'is',
            status: 1,
          },
        });
      },

    };
    const loading = this.props.loading;
    return (
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
          />
        </Card>
      </div>
    );
  }
}
