import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Input, Button, DatePicker, Select, Form, Table, Spin, Divider, message } from 'antd';
import styles from './index.less';
import { Region } from '../../../../components/Cascader';

const FormItem = Form.Item;
const { Search } = Input;
const { Option } = Select;

@connect(state => ({
  data: state.arriveShop,
  user: state.user,
  loading: state.loading.effects['arriveShop/queryHighSeaList'],
  fetchingOptions: state.loading.effects['arriveShop/querySelectOptions'],
}))
@Form.create()
export default class HighSeaList extends PureComponent {
  state = {
    levels: [],
    selectedRowKeys: [],
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'arriveShop/queryHighSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 2,
        chanceBizType: 2,
      },
    });
  }
  toDetail = (id) => {
    this.props.dispatch({
      type: 'arriveShop/checkCurrentChance',
      payload: {
        id,
      },
    });
  }
  handleReset = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'arriveShop/queryHighSeaList',
      payload: {
        fromSource: 2,
        chanceBizType: 2,
      },
    });
  }
  applyChance = (id, type) => {
    const { highSeaData } = this.props.data;
    const { pagination } = highSeaData;
    const { page, pageSize } = pagination;
    if(id.length === 0) {
      message.warning('请选择至少一条机会');
    } else {
      this.props.dispatch({
        type: 'arriveShop/applyChance',
        payload: {
          type,
          chanceIds: id,
          fromSource: 2,
        },
      }).then( val => {
        if (val) {
          this.props.dispatch({
            type: 'arriveShop/queryHighSeaList',
            payload: {
              page: page,
              pageSize: pageSize,
              fromSource: 2,
              chanceBizType: 2,
            },
          });
        }
      })
    }
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
  render() {
    const { data: { highSeaData }, fetchingOptions, form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { levels } = this.state;
    if (!highSeaData) {
      return null;
    }
    const { data, pagination } = highSeaData;
    const onSearch = () => {
      const { createTime, areaCode, ...params } = getFieldsValue();
      this.props.dispatch({
        type: 'arriveShop/queryHighSeaList',
        payload: {
          ...params,
          createTime: createTime ? createTime.format('YYYY-MM-DD') : '',
          areaCode: areaCode,
          pageSize: pagination.pageSize,
          fromSource: 2,
          chanceBizType: 2,
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
                {getFieldDecorator('areaCode', {
                })(
                  <Region
                    style={{ width: '180px' }}
                  />
                )}
              </FormItem>
            </Col>
            <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24} style={{ width: '190px'}}>
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
        title: '当前状态',
        dataIndex: 'statusName',
        key: 'statusName',
      }, {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <div>
            <a onClick={() => this.toDetail(record.id)}>详情</a>
            <Divider type="vertical" />
            <a onClick={() => this.applyChance([record.id], 'init')}>申领</a>
          </div>
        ),
      },
    ];
    const rowSelection = {
      onChange: (keys) => {
       this.setState({ selectedRowKeys: keys });
      },
    };

    const paginationProps = {
      current: pagination.page,
      showSizeChanger: true,
      pageSize: pagination.pageSize,
      total: pagination.totalCount,
      showTotal: () => `共${pagination.totalCount}条`,
      onChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryHighSeaList',
          payload: {
            ...getFieldsValue(),
            page,
            pageSize: size,
            fromSource: 2,
            chanceBizType: 2,
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryHighSeaList',
          payload: {
            ...getFieldsValue(),
            page,
            pageSize: size,
            fromSource: 2,
            chanceBizType: 2,
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
          <Button style={{ marginBottom: '15px' }} onClick={() => this.applyChance(this.state.selectedRowKeys, 'init')}>申领</Button>
          <Table
            columns={columns}
            dataSource={data}
            pagination={paginationProps}
            loading={loading}
            rowSelection={rowSelection}
            rowKey={record => `${record.id}`}
          />
        </Card>
      </div>
    );
  }
}
