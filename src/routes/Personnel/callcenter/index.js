import React, { PureComponent } from "react";
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less'
import common from '../common/index.less'
import {Button, Row, Col, Card, Tabs, Tooltip, Tree, Modal, Table, Icon, Divider,Pagination} from 'antd';
import {Link} from "react-router-dom";
import Edit from './Model/edit';

export default class personnelInfo extends PureComponent {
  render() {
    const columns = [{
      title: '坐席编号',
      dataIndex: 'seat',
    }, {
      title: '坐席描述',
      dataIndex: 'seat_des',
    }, {
      title: '坐席密码',
      dataIndex: 'seat_code',
    }, {
      title: '绑定电话',
      dataIndex: 'seat_phone',
    }, {
      title: '班长坐席',
      dataIndex: 'seat_leader',
    },{
      title: '员工工号',
      dataIndex: 'seat_num',
    },{
      title: '员工姓名',
      dataIndex: 'seat_name',
    },{
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div>
          <Edit/>
          {/*<span className={common.operate_icon} onClick={this.handleEdit}></span>*/}
        </div>
      ),
    },
    ];
    const data = [{
      key: '1',
      seat: 2,
      seat_des: 'John Brown',
      seat_code: 32,
      seat_phone: 13122516113,
      seat_leader: '在职',
      seat_num: '刘',
      seat_name:'建礼张'
    }, {
      key: '2',
      seat: 2,
      seat_des: 'John Brown',
      seat_code: 32,
      seat_phone: 13122516113,
      seat_leader: '在职',
      seat_num: '刘',
      seat_name:'建礼张'
    }, {
      key: '3',
      seat: 2,
      seat_des: 'John Brown',
      seat_code: 32,
      seat_phone: 13122516113,
      seat_leader: '在职',
      seat_num: '刘',
      seat_name:'建礼张'
    }];
    // 页码
    const paginationProps={
      defaultPageSize:10,
      pageSizeOptions:["10","20","30"],
      showSizeChanger:true,
      showTotal:function(total){
        return "总共"+ total+"条";
      }
    };
    return (
      <PageHeaderLayout>
        <Card>
         <Button type="primary" size="small" style={{marginBottom:20}} className={styles.operate}>更新坐席</Button>
        <Table columns={columns}
               dataSource={data}
               pagination={paginationProps}
               className={common.tableBody}/>
        </Card>
      </PageHeaderLayout>
    )
  }
}
