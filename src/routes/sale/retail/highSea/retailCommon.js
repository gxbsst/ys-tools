import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { can } from '../../../../decorators';
import { Card, Row, Col, Input, Button, Menu, DatePicker, Select, Form, Table, Spin, message } from 'antd';
import styles from './index.less';
import DropOption from '../../../../components/DropOption/';
import { Region } from '../../../../components/Cascader';

const FormItem = Form.Item;
const { Search } = Input;
const { Option } = Select;
@can(4003000, null)
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
    selectedRowKeys: [],
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'saleRetail/queryHighSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 1,
        chanceBizType: 2,
        chanceType: 'is',
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
  };
  handleReset = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'saleRetail/queryHighSeaList',
      payload: {
        fromSource: 1,
        chanceType: 'is',
        chanceBizType: 2,
      },
    });
  };
  applyChance = (id, type) => {
    const { highSeaData } = this.props.data;
    const { pagination } = highSeaData;
    const { page, pageSize } = pagination;
    if (id.length === 0) {
      message.warning('请选择至少一条机会');
    } else {
      this.props.dispatch({
        type: 'saleRetail/applyChance',
        payload: {
          type,
          chanceIds: id,
          fromSource: 1,
        },
      }).then(val => {
        if (val) {
          this.props.dispatch({
            type: 'saleRetail/queryHighSeaList',
            payload: {
              page: page,
              pageSize: pageSize,
              fromSource: 1,
              chanceType: 'is',
              chanceBizType: 2,
            },
          });
        }
      });
    }
  };

  renderAction(record) {
    const { permissions } = this.props.user;
    const actions = (
      <Menu>
        {
          permissions.includes(4003001) &&
          <Menu.Item>
            <span onClick={this.toDetail.bind(this, record.id)}>详情</span>
          </Menu.Item>
        }
        {
          (permissions.includes(4003003) || permissions.includes(4003004)) &&
          <Menu.SubMenu title="申领">
            {
              permissions.includes(4003004) &&
              <Menu.Item>
                <span onClick={this.applyChance.bind(this, [record.id], 'protect')}>至客保</span>
              </Menu.Item>
            }
            <Menu.Item>
              <span onClick={this.applyChance.bind(this, [record.id], 'library')}>至申领库</span>
            </Menu.Item>
          </Menu.SubMenu>
        }
      </Menu>
    );
    return actions;
  }

  renderBatchButton() {
    const selectedRowKeys = this.state.selectedRowKeys;
    const { permissions } = this.props.user;
    return (
      <Fragment>
        {
          permissions.includes(4003003) && <Button onClick={this.applyChance.bind(this, selectedRowKeys, 'library')}>申领至申领库</Button>
        }
        {
          permissions.includes(4003004) && <Button style={{ marginLeft: '15px' }} onClick={this.applyChance.bind(this, selectedRowKeys, 'protect')}>申领至客保</Button>
        }
      </Fragment>
    );
  }

  render() {
    const { data: { highSeaData }, fetchingOptions, form: { getFieldDecorator, getFieldsValue }, user: { permissions } } = this.props;
    const { levels } = this.state;
    if (!highSeaData) {
      return null;
    }
    const { data, pagination } = highSeaData;
    const onSearch = () => {
      const { createTime, areaCode, ...params } = getFieldsValue();

      this.props.dispatch({
        type: 'saleRetail/queryHighSeaList',
        payload: {
          ...params,
          createTime: createTime ? createTime.format('YYYY-MM-DD') : '',
          areaCode: areaCode,
          pageSize: pagination.pageSize,
          fromSource: 1,
          chanceType: 'is',
          chanceBizType: 2,
        },
      });
    };

    const FormTitle = (
      <div style={{ width: '100%', textAlign: 'right' }}>
        {
          permissions.includes(4003002) &&
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
        }
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
          <span>{text == 0 ? '未加急' : '加急'}</span>
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
            renderMenu={this.renderAction(record)}
          />
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
          type: 'saleRetail/queryHighSeaList',
          payload: {
            ...getFieldsValue(),
            page,
            pageSize: size,
            fromSource: 1,
            chanceType: 'is',
            chanceBizType: 2,
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
            chanceBizType: 2,
          },
        });
      }
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
            title={() => this.renderBatchButton()}
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
