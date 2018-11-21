import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Input, Button, DatePicker, Select, Form, Table, Spin, message } from 'antd';
import AllotModal from '../AllotModal';
import DropOption from '../../../../components/DropOption/';
import styles from './index.less';
import {can} from "../../../../decorators";

const FormItem = Form.Item;
const { Search } = Input;
const { Option } = Select;
@can(4003000, null)
@connect(state => ({
  user: state.user,
  data: state.saleRetail,
  loading: state.loading.effects['saleRetail/queryHighSeaList'],
  fetchingOptions: state.loading.effects['saleRetail/querySelectOptions'],
}))
@Form.create()
export default class HighSeaList extends PureComponent {

  state = {
    showAllotModal: false,
    levels: [],
    currentChance: [],
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'saleRetail/queryHighSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 1,
        chanceType: 'is',
        chanceBizType: 1,
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
      type: 'saleRetail/queryHighSeaList',
      payload: {
        fromSource: 1,
        chanceType: 'is',
        chanceBizType: 1,
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
        this.setState({ showAllotModal: true, currentChance: [id] });
        break;
    }
  }
  allot = () => { // 分配人员
    const { currentChance } = this.state;
    if(currentChance.length === 0) {
      message.warning('请选择至少一条机会')
    }else {
      this.setState({ showAllotModal: true, currentChance: currentChance })
    }
  }
  renderAction() {
    const { permissions } = this.props.user;
    const actions = [
      { key: 'detail',
        name: '详情',
        can: 4003001,
      },
      {
        key: 'assign',
        name: '分配',
        can: 4003003
      }];
    return actions.filter(({ can }) => permissions.includes(can));
  }
  renderBatchButton() {
    const { permissions } = this.props.user;
    const isChargeMan = permissions.includes(4003003);
    if (isChargeMan) {
      return <Button onClick={this.allot.bind(this, this.state.currentChance)}>分配</Button>;
    } else {
      return null;
    }
  }
  render() {
    const { data: { highSeaData }, fetchingOptions, form: { getFieldDecorator, getFieldsValue }, user: { permissions }  } = this.props;
    const { levels, currentChance } = this.state;
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
          fromSource: 1,
          chanceType: 'is',
          chanceBizType: 1,
        },
      });
    };
    const FormTitle = (
      <div style={{ width: '100%', textAlign: 'right' }}>
        {
          permissions.includes(4003002) &&
          <Form>
            <Row>
              <Col lg={{span: 4}} md={{span: 8}} sm={24}>
                <FormItem>
                  {getFieldDecorator('createTime')(
                    <DatePicker/>
                  )}
                </FormItem>
              </Col>
              <Col lg={{span: 4}} md={{span: 8}} sm={24}>
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
              <Col lg={{span: 8}} md={{span: 12}} sm={24}>
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
              <Col lg={{span: 4}} md={{span: 12}} sm={24}>
                <Button style={{marginTop: '3px'}} onClick={this.resetSearchParams}>
                  重置
                </Button>
              </Col>
            </Row>
          </Form>
        }
      </div>
    );

    const columns = [
      {
        title: '机会ID',
        dataIndex: 'id',
        key: 'id',
      }, {
        title: '商户名',
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
            menuOptions={this.renderAction()}
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
            fromSource: 1,
            chanceType: 'is',
            chanceBizType: 1,
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
            chanceType: 'is',
            chanceBizType: 1,
          },
        });
      }
    };
    const loading = this.props.loading;
    const showAllotModalProps = {
      id: currentChance,
      fromSource: 1,
      visible: true,
      type: 'protect',
      chanceType: 'is',
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
              chanceType: 'is',
              chanceBizType: 1,
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
          bodyStyle={{ padding: '0 32px 40px 32px' }}
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
          { this.state.showAllotModal && <AllotModal {...showAllotModalProps} />}
        </Card>
      </div>
    );
  }
}
