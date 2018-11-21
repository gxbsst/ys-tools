import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Input, Button, DatePicker, Select, Form, Table, Divider, Spin, Popconfirm, message } from 'antd';
import { Region } from '../../../../../components/Cascader';
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
    filterStatus: [],
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'saleRetail/queryPrivateSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        chanceType: 'os',
        fromSource: 1,
        isSubordinate: 0,
        applyType: 'init',
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
  pushOrder = (id) => {
    this.props.dispatch({
      type: 'saleRetail/pushOrder',
      payload: {
        id,
      },
    });
  }
  abandonConfirm = (id) => {
    this.props.dispatch({
      type: 'saleRetail/abandonChance',
      payload: {
        id,
      },
    }).then((val) => {
      this.props.dispatch({
        type: 'saleRetail/queryPrivateSeaList',
        payload: {
          page: 1,
          pageSize: 10,
          chanceType: 'os',
          fromSource: 1,
          isSubordinate: 0,
          applyType: 'init',
        },
      });
    });
  }

  abandonCancel = () => {
    message.error('已取消');
  }
  handleReset = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'saleRetail/queryPrivateSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        chanceType: 'os',
        fromSource: 1,
        isSubordinate: 0,
        applyType: 'init',
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
      const { createTime, areaCode, ...params } = getFieldsValue();

      this.props.dispatch({
        type: 'saleRetail/queryPrivateSeaList',
        payload: {
          ...params,
          createTime: createTime ? createTime.format('YYYY-MM-DD') : '',
          areaCode: areaCode,
          pageSize: pagination.pageSize,
          chanceType: 'os',
          fromSource: 1,
          isSubordinate: 0,
          applyType: 'init',
        },
      });
    };

    const FormTitle = (
      <div style={{ width: '100%', textAlign: 'right' }}>
        <Form>
          <Row>
            <Col lg={{span: 8}} md={{span: 12}} sm={24} style={{width: '190px'}}>
              <FormItem>
                {getFieldDecorator('createTime')(
                  <DatePicker style={{width: '180px'}}/>
                )}
              </FormItem>
            </Col>
            <Col lg={{span: 8}} md={{span: 12}} sm={24} style={{width: '190px'}}>
              <FormItem>
                {getFieldDecorator('areaCode', {})(
                  <Region
                    style={{width: '180px'}}
                  />
                )}
              </FormItem>
            </Col>
            <Col lg={{span: 8}} md={{span: 12}} sm={24} style={{width: '190px'}}>
              <FormItem>
                {getFieldDecorator('level')(
                  <Select
                    placeholder="所有漏斗等级"
                    style={{width: 120}}
                    onFocus={this.getSelectOptions.bind(this, 'levels')}
                    notFoundContent={fetchingOptions ? <Spin size="small"/> : null}
                  >
                    {levels.map(item => (
                      <Option value={item.level} key={item.level}>{item.levelName}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col lg={{span: 8}} md={{span: 12}} sm={24} style={{width: '340px'}}>
              {getFieldDecorator('customerName')(
                <Search
                  style={{marginTop: '3px'}}
                  className={styles.extraContentSearch}
                  placeholder="请输入"
                  onSearch={onSearch}
                  enterButton="搜索"
                />
              )}
            </Col>
            <Col lg={{span: 8}} md={{span: 12}} sm={24} style={{width: '190px'}}>
              <Button style={{marginTop: '3px'}} onClick={this.handleReset}>
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
        title: '处理人',
        dataIndex: 'opUserName',
        key: 'opName',
      }, {
        title: '到期时间',
        dataIndex: 'surplusDays',
        key: 'surplusDays',
      }, {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <span>
            <a onClick={() => this.toDetail(record.id)}>详情</a>
            <Divider type="vertical" />
            <a onClick={() => this.pushOrder(record.id)}>提单</a>
            <Divider type="vertical" />
            <Popconfirm title="是否放弃?" onConfirm={() =>this.abandonConfirm(record.id)} onCancel={this.abandonCancel} okText="确定" cancelText="取消">
              <a>放弃</a>
            </Popconfirm>
          </span>
        ),
      }
    ];

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
            chanceType: 'os',
            fromSource: 1,
            isSubordinate: 0,
            applyType: 'init',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryPrivateSeaList',
          payload: {
            pageSize: size,
            chanceType: 'os',
            fromSource: 1,
            isSubordinate: 0,
            applyType: 'init',
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
