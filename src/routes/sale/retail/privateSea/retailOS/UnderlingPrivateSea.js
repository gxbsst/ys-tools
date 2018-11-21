import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Input, Button, DatePicker, Select, Form, Table, Divider, Spin } from 'antd';
import AllotModal from '../../AllotModal';
import RejectRequestModal  from '../../RejectRequestModal';
import styles from './style.less';
import { Region } from '../../../../../components/Cascader';
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
    showAllotModal: false,
    showRejectRequestModal: false,
    currentChance: [],
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'saleRetail/queryPrivateSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 1,
        isSubordinate: 1,
        chanceType: 'os',
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
  allot = (id) => { // 分配人员
    this.setState({ showAllotModal: true, currentChance: id })
  }
  abadon = (id) => {
    this.props.dispatch({
      type: 'saleRetail/approval',
      payload: {
        id,
        result: 1,
      },
    }).then((val) => {
      if (val) {
        this.props.dispatch({
          type: 'saleRetail/queryPrivateSeaList',
          payload: {
            page: 1,
            pageSize: 10,
            fromSource: 1,
            isSubordinate: 1,
            chanceType: 'os',
          },
        });
      }
    });
  }
  toDetail = (id) => {
    this.props.dispatch({
      type: 'saleRetail/checkCurrentChance',
      payload: {
        id,
      },
    });
  }
  handleReset = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'saleRetail/queryPrivateSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 1,
        isSubordinate: 1,
        chanceType: 'os',
      },
    });
  }

  renderAction(record) {
    return (
      <span>
        {
          record.status != 2 &&
          <a onClick={() => this.allot(record.id)}>再分配</a>
        }
        <Divider type="vertical" />
        {
          record.status != 2 &&
          <a onClick={() => this.abadon(record.id)}>驳回</a>
        }
        <Divider type="vertical" />
        <a onClick={() => this.toDetail(record.id)}>详情</a>
      </span>
    )
  }
  render() {
    const { data: { privateSeaData }, fetchingOptions, form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { levels, filterStatus, currentChance } = this.state;
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
          fromSource: 1,
          isSubordinate: 1,
          chanceType: 'os',
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
      title: '当前状态',
      dataIndex: 'statusName',
      key: 'statusName',
    }, {
      title: '处理人',
      dataIndex: 'opUserName',
      key: 'opUserName',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => this.renderAction(record),
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
            isSubordinate: 1,
            chanceType: 'os',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryPrivateSeaList',
          payload: {
            pageSize: size,
            fromSource: 1,
            isSubordinate: 1,
            chanceType: 'os',
          },
        });
      },

    };
    const loading = this.props.loading;
    const showRejectRequestModalProps = {
      id: currentChance,
      visible: this.state.showRejectRequestModal,
      onOk: () => {
        this.setState({
          showRejectRequestModal: false
        }, () => {
          this.props.dispatch({
            type: 'saleRetail/queryPrivateSeaList',
            payload: {
              page: 1,
              pageSize: 10,
              fromSource: 1,
              isSubordinate: 1,
              chanceType: 'os',
            },
          });
        })
      },
      onCancel: () => this.setState({ showRejectRequestModal: false }),
    };
    const showAllotModalProps = {
      fromSource: 1,
      id: currentChance,
      type: 'init',
      visible: true,
      chanceType: 'os',
      onOk: () => {
        this.setState({
          showAllotModal: false
        }, () => {
          this.props.dispatch({
            type: 'saleRetail/queryPrivateSeaList',
            payload: {
              page: 1,
              pageSize: 10,
              fromSource: 1,
              isSubordinate: 1,
              chanceType: 'os',
            },
          });
        })
      },
      onCancel: () => this.setState({ showAllotModal: false }),
    };
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
          <RejectRequestModal {...showRejectRequestModalProps} />
          { this.state.showAllotModal && <AllotModal {...showAllotModalProps} />}
        </Card>
      </div>
    );
  }
}
