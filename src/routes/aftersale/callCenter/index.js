import React, {PureComponent} from "react";
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {
  Button,
  Row,
  Col,
  Card,
  Tabs,
  Tooltip,
  Tree,
  Modal,
  Table,
  Icon,
  Divider,
  Pagination,
  Switch,
  Radio,
  Popover
} from 'antd';
import styles from './index.less';
import common from '../../Personnel/common/index.less'

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

// tab 的某一项
function callback(key) {
  console.log(key);
}
// 悬浮框
const font={
  fontSize:17,
  color:'#1cacda',
};
const content = (
  <Row type="flex" justify="space-around" align="center">
    <Icon type="user" style={font}/>&nbsp;&nbsp;
    <Icon type="user" style={font}/>&nbsp;&nbsp;
    <Icon type="phone" style={font}/>
  </Row>
);

export default class Callcenter extends PureComponent {
  handleclick = () => {
    alert('需要写窗口')
  };

  render() {
    const columns = [{
      title: '坐席状态',
      dataIndex: 'seat_status',
      render: (text, record) => (
        <span className={common.leisure}>空闲</span>
      )
    }, {
      title: '座席编号',
      dataIndex: 'seat_code',
    }, {
      title: '姓名',
      dataIndex: 'name',
    }, {
      title: '座席类型',
      dataIndex: 'seat_type',
    }, {
      title: '接听总数',
      dataIndex: 'answer_num',
    }, {
      title: '登录时长',
      dataIndex: 'login_long',
    }, {
      title: '状态时长',
      dataIndex: 'status_long',
    }, {
      title: '主叫号码',
      dataIndex: 'dialing_num',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div>
          <span className={styles.operate_status}>监听</span>
          <span className={styles.operate_status}>三方</span>
          <span className={styles.operate_status}>耳语</span>
          <span className={styles.operate_status}>抢线</span>
          <span className={styles.operate_status}>强拆</span>
          <span className={styles.operate_status}>强插</span>
        </div>
      ),
    }
    ];
    const data = [{
      key: '1',
      seat_code: 'John Brown',
      name: 32,
      seat_type: '销售总监',
      answer_num: '在职',
      login_long: '刘',
      status_long: '销售总监',
      dialing_num: '在职',
    }, {
      key: '2',
      seat_code: 'John Brown',
      name: 32,
      seat_type: '销售总监',
      answer_num: '在职',
      login_long: '刘',
      status_long: '销售总监',
      dialing_num: '在职',
    }, {
      key: '3',
      seat_code: 'John Brown',
      name: 32,
      seat_type: '销售总监',
      answer_num: '在职',
      login_long: '刘',
      status_long: '销售总监',
      dialing_num: '在职',
    }];
    // 页码
    const paginationProps = {
      defaultPageSize: 10,
      pageSizeOptions: ["10", "20", "30"],
      showSizeChanger: true,
      showTotal: function (total) {
        return "总共" + total + "条";
      }
    };
    return (
      <PageHeaderLayout>
        <div className={styles.infostabs}>
          <div className={`${styles.seats_info}`} style={{marginBottom: 6, paddingLeft: 30, paddingTop: 20}}>
            <div className={styles.row}>
              <span>坐席编号：</span>
              <span>8091</span>
            </div>
            <div className={styles.row}>
              <span>绑定电话：</span>
              <span>17721151517</span>
            </div>
            <div className={styles.row + ' ' + styles.btn}>
              <Popover content={content} trigger="click">
                <Icon type="form"/>
              </Popover>
            </div>
            <div className={styles.row}>
              <input type="text" className={styles.input}/>
              <Button size='small' type="primary">呼叫</Button>
            </div>
            <div className={styles.row}>
              <span>坐席状态：</span>
              <Switch defaultChecked checkedChildren="忙碌" unCheckedChildren="空闲"/>
            </div>
          </div>
          <Tabs defaultActiveKey="1" onChange={callback}>
            <TabPane tab="队列信息" key="1">
              <div className={common.separate_line}></div>
              <div className={styles.queue}>
                <p className={styles.col + ' ' + styles.queuetit}>队列信息</p>
                <div className={styles.col + ' ' + styles.queueinfo}>
                  <div className={styles.item}>
                    <span>队列名称：</span><span>售后咨询</span>
                  </div>
                  <div className={styles.item}>
                    <span>座席总数：</span><span>6</span>
                  </div>
                  <div className={styles.item}>
                    <span>呼叫分配方式：</span><span>自动分配</span>
                  </div>
                  <div className={styles.item}>
                    <span>班长席：</span><span>测试班长席</span>
                  </div>
                </div>
              </div>
              <div className={common.separate_line}></div>
              <div className={styles.seatslist + ' ' + styles.queue}>
                <p className={styles.col + ' ' + styles.queuetit}>座席列表</p>
                <div className={styles.col + ' ' + styles.queueinfo}>
                  {/*className={styles.margin}*/}
                  <span>状态筛选；</span>
                  <RadioGroup name="seatslist" defaultValue={1} className={styles.list}>
                    <Radio value={1}>全选</Radio>
                    <Radio value={2}>空闲</Radio>
                    <Radio value={3}>离线</Radio>
                    <Radio value={4}>响铃</Radio>
                    <Radio value={5}>通话</Radio>
                    <Radio value={6}>整理</Radio>
                    <Radio value={7}>置忙</Radio>
                  </RadioGroup>
                </div>
                <div className={common.marginTop}>
                  <Table columns={columns}
                         dataSource={data}
                         pagination={paginationProps}
                         className={common.tableBody}/>
                </div>
              </div>
            </TabPane>
            <TabPane tab="队列信息" key="2">
              <div className={styles.queue}>
                <Table columns={columns}
                       dataSource={data}
                       pagination={paginationProps}
                       className={common.tableBody}/>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </PageHeaderLayout>
    )
  }
}
