import React, {PureComponent} from "react";
import {connect} from 'dva';
import {
  Row,
  Col,
  Button,
  Card,
  Tree,
  Transfer,
  message,
} from 'antd';
import {tree} from '../../../../utils/index';
import request from '../../../../utils/request';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import styles from './index.less'
import common from '../../common/index.less'
// 树
const TreeNode = Tree.TreeNode;
const gData = [];

class ProductTree extends PureComponent {
  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  };

  componentDidMount() {
    this.getStaff()
  }

  getStaff = async (id = 1) => {
    const {handleId} = this.props;
    let data = await request(`/api/personnel/department/${id}/employee`);
    handleId(id, data)
  };
  onSelect = (selectedKeys, info) => {
    const id = selectedKeys[0] * 1;
    if (!isNaN(id)) {
      this.getStaff(id)
    }
  };

  render() {
    const treeData = tree(this.props.treeData);
    return (
      <Tree
        defaultExpandedKeys={['0-0-0', '0-0-1']}
        defaultSelectedKeys={['0-0-0', '0-0-1']}
        onDragEnter={this.onDragEnter}
        onDrop={this.onDrop}
        onSelect={this.onSelect}
      >
        {this.renderTreeNodes(treeData)}
      </Tree>
    );
  }
}

@connect(state => (
    {
      branch: state.personal_info.branch
    }
  )
)
export default class RoleManage extends PureComponent {
  state = {
    targetKeys: [],
    staffList: '',
    branchId: '',
    username: [],
    name: '',
    id: '',
    forbid: true,
    roleStaffList: '',
  }
  // 部门员工数据处理
  handleId = (branchId, staffList) => {
    this.setState({
      staffList,
      branchId,
    })
  }
  // 角色员工列表
  getRoleList = async (roleId) => {
    const {data} = await request(`/api/role/${roleId}/employee`);
    // const targetKeys = data.map(item => item.name)
  }

  componentDidMount() {
    const {location, dispatch, match: {params: {id: roleId}}} = this.props;
    if (location.query) {
      const name = location.query.mes;
      this.setState({
        name,
      })
      window.localStorage.setItem('mes', name);
    }
    this.getRoleList(roleId);
    // 组织架构树
    dispatch({
      type: 'personal_info/branch',
    });
  }

  componentDidUpdate() {

  }

  success = (text) => {
    message.success(`${text}`, 2);
  };
  // 添加员工到你角色
  addStaffToRole = async (username) => {
    const {match: {params: {id}}} = this.props;
    let res = await request(`/api/role/${id}/employee`, {
      method: 'POST',
      body: username,
    })
    window.history.go(-1);
    message.success(`${res.message}`);
  }
  filterOption = (inputValue, option) => {
    return option.title.indexOf(inputValue) > -1;
  }
  handleChange = (obj, targetKeys) => {
    console.info('targetKeys2', targetKeys)
    const {branchId} = this.state;
    const username = [];
    obj.forEach(item => {
      for (let i = 0; i < targetKeys.length; i++) {
        if (item.key === targetKeys[i]) {
          username.push(item.description)
        }
      }
    });
    if (targetKeys.length) {
      this.setState({
        forbid: false
      })
    }
    this.setState({targetKeys, username});
  };
  addRoleStaff = () => {
    const {username} = this.state;
    this.addStaffToRole(username);
  }

  render() {
    const {targetKeys, name, forbid} = this.state;
    console.info('targetKeys', targetKeys);
    const staffname = name ? name : window.localStorage.getItem('mes');
    const treeData = this.props.branch;
    if (treeData) {
      treeData.forEach((item) => {
        item['key'] = item.id;
        item['title'] = item.name;
      });
    }
    const mockData = [];
    const {staffList} = this.state;
    if (staffList) {
      staffList.data.forEach(item => {
        const data = {
          key: item.id.toString(),
          title: item.name,
          description: item.username,
        };
        mockData.push(data);
      })
    }
    return (
      <PageHeaderLayout>
        <Row gutter={16} className={styles.dataTree}>
          <Col span={6}>
            <Card title="" bordered={false}>
              <p>
                <span>角色名称：</span>
                <span>{staffname}</span>
              </p>
              {
                treeData ? <ProductTree treeData={treeData} handleId={this.handleId}></ProductTree> : ''
              }
            </Card>
          </Col>
          <Col span={18}>
            <Card title="" bordered={false}>
              <div style={{position: 'relative'}} className={styles.transfer}>
                <Transfer
                  className={common.middle}
                  listStyle={{
                    width: '40%',
                    height: 300,
                    textAlign: 'left'
                  }}
                  operations={['添加', '移除']}
                  titles={['员工列表', '添加权限列表']}
                  dataSource={mockData ? mockData : ''}
                  searchPlaceholder="请输入员工姓名"
                  showSearch
                  filterOption={this.filterOption}
                  targetKeys={targetKeys ? targetKeys : ''}
                  onChange={this.handleChange.bind(this, mockData)}
                  render={item => item.title}
                />
              </div>
              <div className={styles.handle}>
                <Button type="primary" onClick={this.addRoleStaff} disabled={forbid}>保存</Button>
                <Button onClick={() => (window.history.go(-1))}>取消</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>
    )
  }
}
