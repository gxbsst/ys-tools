import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Input, Button, DatePicker, Select, Form, Table, Spin, message, Popover } from 'antd';
import AllotModal from '../AllotModal';
import DropOption from '../../../../components/DropOption/';
import RejectRequestModal from '../RejectRequestModal';
import styles from './index.less';
import {can} from "../../../../decorators";

const FormItem = Form.Item;
const { Search } = Input;
const { Option } = Select;

@can(4005000, null)
@connect(state => ({
  data: state.saleRetail,
  user: state.user,
  loading: state.loading.effects['saleRetail/queryHighSeaList'],
  fetchingOptions: state.loading.effects['saleRetail/querySelectOptions'],
}))
@Form.create()
export default class HighSeaList extends PureComponent {
  state = {
    levels: [],
    status: [],
    currentChance: [],
    showRejectRequestModal: false,
    currentId: null,
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'saleRetail/queryHighSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        chanceType: 'os',
        fromSource: 1,
      },
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
  resetSearchParams = () => {
    const { resetFields } = this.props.form;
    resetFields();
    this.props.dispatch({
      type: 'saleRetail/queryHighSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        chanceType: 'os',
        fromSource: 1,
      },
    });
  }
  handleMenuClick(record, e) {
    const { id } = record;
    switch (e.key) {
      case 'detail':
        this.toDetail(id);
        break;
      case 'assign':
        this.allot( [id] );
        break;
      case 'reject':
        this.setState({ showRejectRequestModal: true, currentId: id });
        break;
    }
  }
  allot = (id) => { // 分配人员
    if(id.length === 0 ) {
      message.warning('请选择至少一条机会')
    }else {
      this.setState({ showAllotModal: true, currentChance: id })
    }
  }
  renderAction() {
    const { permissions } = this.props.user;
    const actions = [
      { key: 'detail',
        name: '详情',
        can: 4005001,
      },
      {
        key: 'assign',
        name: '分配',
        can: 4005002,
      }, {
        key: 'reject',
        name: '驳回',
        can: 4005003,
      }];
    return actions.filter(({ can }) => permissions.includes(can));
  }
  renderBatchButton() {
    const { permissions } = this.props.user;
    const can = permissions.includes(4005002);
    if (can) {
      return <Button onClick={this.allot.bind(this, this.state.currentChance)}>分配</Button>;
    } else {
      return null;
    }
  }
  render() {
    const { data: { highSeaData }, fetchingOptions, form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { permissions } = this.props.user;
    const { levels, status, currentChance } = this.state;
    if (!highSeaData) {
      return null;
    }
    const { data, pagination } = highSeaData;
    const onSearch = () => {
      const { createTime, ...params } = getFieldsValue();
      this.props.dispatch({
        type: 'saleRetail/queryHighSeaList',
        payload: {
          ...params,
          createTime: createTime ? createTime.format('YYYY-MM-DD') : '',
          pageSize: pagination.pageSize,
          chanceType: 'os',
          fromSource: 1,
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
          <DropOption
            onMenuClick={e => this.handleMenuClick(record, e)}
            menuOptions={this.renderAction(record)}
          />
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
          type: 'saleRetail/queryHighSeaList',
          payload: {
            page,
            pageSize: size,
            chanceType: 'os',
            fromSource: 1,
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryHighSeaList',
          payload: {
            ...getFieldsValue(),
            pageSize: size,
            fromSource: 1,
            chanceType: 'os',
          },
        });
      }
    };

    const loading = this.props.loading;
    const showRejectRequestModalProps = {
      id: this.state.currentId,
      visible: true,
      onOk: () => {
        this.setState({
          showRejectRequestModal: false
        }, () => {
          this.props.dispatch({
            type: 'saleRetail/queryHighSeaList',
            payload: {
              page: 1,
              pageSize: 10,
              fromSource: 1,
              chanceType: 'os',
            },
          });
        })
      },
      onCancel: () => this.setState({ showRejectRequestModal: false }),
    };
    const showAllotModalProps = {
      id: currentChance,
      fromSource: 1,
      type: 'init',
      visible: true,
      chanceType: 'os',
      onOk: () => {
        this.setState({
          showAllotModal: false,
          currentChance: [],
        }, () => {
          this.props.dispatch({
            type: 'saleRetail/queryHighSeaList',
            payload: {
              page: 1,
              pageSize: 10,
              fromSource: 1,
              chanceType: 'os',
            },
          });
        })
      },
      onCancel: () => this.setState({ showAllotModal: false }),
    };
    const rowSelection = {
      selectedRowKeys: currentChance,
      onChange: (keys) => {
        this.setState({ currentChance: keys });
      },
    };
    return (
      <div className={styles.standardList}>
        <Card
          title={FormTitle}
          className={styles.listCard}
          bordered={false}
          bodyStyle={{padding: '0 32px 40px 32px'}}
        >
          <Table
            title={() => this.renderBatchButton()}
            columns={columns}
            dataSource={data}
            pagination={paginationProps}
            loading={loading}
            rowSelection={rowSelection}
            rowKey={record => `${record.id}`}
          />
        </Card>
        {
          permissions.includes(4005003) && this.state.showRejectRequestModal &&
          <RejectRequestModal {...showRejectRequestModalProps} />
        }
        {
          permissions.includes(4005002) && this.state.showAllotModal &&
          <AllotModal {...showAllotModalProps} />
        }
      </div>
    );
  }
}
