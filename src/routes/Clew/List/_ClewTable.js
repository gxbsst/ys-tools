import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Table, Alert, Badge, Divider, Dropdown, Menu, Button, Popconfirm } from 'antd';
import { clewTypeMap, cleanTagMap } from '../../../utils/paramsMap';
import styles from './_ClewTable.less';

const hasPermission = (has = [], should = []) => has.some(item => should.includes(item));

@connect()
export default class ClewTable extends PureComponent {
  state = {
    selectedRowKeys: [],
  };

  componentWillReceiveProps(nextProps) {
    // clean state
    if (nextProps.selectedRows.length === 0) {
      this.setState({
        selectedRowKeys: [],
      });
    }
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    if (this.props.onSelectRow) {
      this.props.onSelectRow(selectedRows);
    }
    this.setState({ selectedRowKeys });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.props.onChange(pagination, filters, sorter);
  }

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  }

  render() {
    const { selectedRowKeys } = this.state;
    const { data: { data, pagination: {page, pageSize, totalCount} }, loading, type, permissions } = this.props;
    const pagination = {current: page, pageSize, total: totalCount};
    const statusMap = {
      0: '',
      1: '待分配', //售前客服
      2: '待清洗', //售前客服
      3: '已废弃', //售前客服
      4: '待分配', //直销
      5: '待清洗', //直销
      6: '待审核', //直销
      7: '已转出', //直销转机会
      8: '已废弃', //直销废弃
    };
    const statusBadge = {
      0: '',
      1: 'default',
      2: 'warning',
      3: 'error',
      4: 'default',
      5: 'warning',
      6: 'processing',
      7: 'success',
      8: 'error',
    };

    const checkColumns = [
      {
        title: '审批流Id',
        dataIndex: 'processId',
        fixed: 'left',
        width: 80,
      },
      {
        title: '申请人',
        dataIndex: 'applyRealName',
      },
      {
        title: '申请时间',
        dataIndex: 'applyTime',
      },
      {
        title: '线索ID',
        dataIndex: 'clewId',
        render: (val, record) => {
          return <span>{val} {record.urgentStatus ? <Badge dot={[3001004].includes(type)} /> : null}</span>
        }
      },
      {
        title: '客户名称',
        dataIndex: 'customerName',
      },
      {
        title: '地区',
        dataIndex: 'area',
      },
      {
        title: '行业',
        dataIndex: 'industry',
      },
      {
        title: '线索来源',
        dataIndex: 'sourceName',
        render: (nothing, record) => {
          return <span>{[record.firstFromSourceName, record.secondFromSourceName].join('/')}</span>
        }
      },
      {
        title: '清洗标签',
        dataIndex: 'cleanTag',
        render: (val) => cleanTagMap.get(val),
      },
    ]
    const baseColumns = [
      {
        title: '线索ID',
        dataIndex: 'clewId',
        fixed: 'left',
        width: 80,
        render: (val, record) => {
          return <span>{val} {record.urgentStatus ? <Badge dot={[3001004].includes(type)} /> : null}</span>
        }
      },
      {
        title: '线索类型',
        dataIndex: 'clewType',
        width: 90,
        render: (val) => clewTypeMap.get(val),
      },
      {
        title: '客户名称',
        dataIndex: 'customerName',
        render: (val, record) => record.customerType == 1 ? record.idNumber : val,
      },
      {
        title: '地区',
        dataIndex: 'area',
        // render: (val) => val && val.split(',').slice(1, 3).join('/').replace(/[省市区]/g, ''),
      },
      {
        title: '行业',
        width: 90,
        dataIndex: 'industry',
      },
      {
        title: '线索来源',
        dataIndex: 'sourceName',
        render: (nothing, record) => {
          return <span>{[record.firstFromSourceName, record.secondFromSourceName].join('/')}</span>
        }
      },
      {
        title: [3001003, 4001005, 4002003, 5005002, 5006002].includes(type) ? '到期时间' : '创建时间',
        dataIndex: [3001003, 4001005, 4002003, 5005002, 5006002].includes(type) ? 'automaticTime' : 'createTime',
      },
      {
        title: '清洗标签',
        dataIndex: 'cleanTag',
        render: (val) => cleanTagMap.get(val),
      },
      {
        title: '状态',
        dataIndex: 'clewStatus',
        render(val) {
          return [3001001, 3001004].includes(type) && val > 3 ?
            <Badge status="success" text="已转出" /> :
            <Badge status={statusBadge[val]} text={statusMap[val]} />
        },
      },
      {
        title: '处理人',
        dataIndex: 'handlerName',
      }
    ];
    const optionColumns = [
      {
        title: '操作',
        fixed: 'right',
        width: 100,
        render: item => (
          <div>
            <Link to={`/clew/clews/${item.clewId}/detail`}>查看</Link>
            {
              [4001002, 4001006].includes(type) &&
              <React.Fragment>
                <Divider type="vertical" />
                <Link className="" to={`/approval/my-apply/detail/${item.processId}?redirect=/clew/clews`}>审批详情</Link>
              </React.Fragment>
            }{
              [4001002].includes(type) &&
              <React.Fragment>
                <Divider type="vertical" />
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item>
                        <Button type="primary" size="small" onClick={() => this.props.onOption('pass', item.processId)}>通过</Button>
                      </Menu.Item>
                      <Menu.Item>
                        <Button type="default" size="small" onClick={() => this.props.onOption('reject', item.processId)}>驳回</Button>
                      </Menu.Item>
                      <Menu.Item>
                        <Button type="danger" size="small" onClick={() => this.props.onOption('abandon', item.processId)}>废弃</Button>
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <a trigger="hover" style={{ marginLeft: 8 }}>审核</a>
                </Dropdown>
              </React.Fragment>
            }{
              (
                [3001002, 4001003, 4002002].includes(type) ||
                (type === 5005001 && item.clewStatus === 4)
              ) &&
              <React.Fragment>
                <Divider type="vertical" />
                <a style={{ marginLeft: 8 }} onClick={() => this.props.onActionAssign(item.clewId)}>分配</a>
              </React.Fragment>
            }{
              [3001003, 4001005, 4002003, 5005002, 5006002].includes(type) &&
              <React.Fragment>
                <Divider type="vertical" />
                <Link className="" to={`/clew/clews/${item.clewId}/clean`}>清洗</Link>
              </React.Fragment>
            }{
              item.clewStatus === 4 && [5006001].includes(type) && permissions.includes(5006002) &&
              <React.Fragment>
                <Divider type="vertical" />
                <Popconfirm title="确定申领此线索吗?" onConfirm={() => this.props.onOption('apply', item.clewId)} okText="确定" cancelText="取消">
                  <a style={{ marginLeft: 8 }}>申领</a>
                </Popconfirm>
              </React.Fragment>
            }{
              [3001004].includes(type) &&
              <React.Fragment>
                <Divider type="vertical" />
                <Popconfirm title="确定加急此线索吗?" onConfirm={() => this.props.onOption('urgent', item.clewId)} okText="确定" cancelText="取消">
                  <a style={{ marginLeft: 8 }}>加急</a>
                </Popconfirm>
              </React.Fragment>
            }
          </div>
        )
      },
    ];

    const columns = [...([4001002, 4001006].includes(type) ? checkColumns : baseColumns), ...optionColumns];
    // columns[0] = {...columns[0], fixed: 'left', width: 80};
    const paginationProps = {
      // showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
      showTotal: () => `共${pagination.total}条`,
    };

    const rowSelection = false
      || [3001002, 4001003, 4002002, 4001002, 5005001].includes(type)
      || ([5006001].includes(type) && permissions.includes(5006002))
      ? {
        selectedRowKeys,
        onChange: this.handleRowSelectChange,
        getCheckboxProps: record => ({
          disabled: [5005001, 5006001].includes(type) && record.clewStatus !== 4,
        }),
      } : null;
    const tableProps = {
      columns,
      loading,
      rowSelection,
      scroll: { x: 1300 },
      rowKey: 'clewId',
      dataSource: data,
      pagination: paginationProps,
      onChange: this.handleTableChange
    }
    return (
      <div className={styles.standardTable}>
        {
          [3001002, 4001003, 4002002, 4001002, 5005001].includes(type) || ([5006001].includes(type) && permissions.includes(5006002))
            ?
          <div className={styles.tableAlert}>
            <Alert
              showIcon
              type="info"
              message={(
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 条&nbsp;&nbsp;
                  线索
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>清空</a>
                </div>
              )}
            />
        </div> : null
        }
        <Table {...tableProps} />
      </div>
    );
  }
}
