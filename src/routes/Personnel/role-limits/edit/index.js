import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Button,
  Row,
  Col,
  Card,
  Select,
  Tabs,
  Radio,
  Tree,
  Cascader,
  Form,
  Input,
  message,
  Checkbox
} from 'antd';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import { redraw } from '../../common/index';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import withSetProps from '../../../../decorators/WithSetProps';
import request from '../../../../utils/request';
import { tree } from '../../../../utils/index';
import city from '../../../../utils/city';
import { Region } from '../../../../components/Cascader';
import common from '../../common/index.less';
import styles from './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const RadioGroup = Radio.Group;

@withSetProps(false)
class ControlledTree extends PureComponent {
  renderTreeNodes = (data) => {
    return data.map((item) => {
      const { code: key, name: title, children } = item;
      const nodeProps = { key, title };
      if (children) {
        return (
          <TreeNode {...nodeProps}>
            {this.renderTreeNodes(children)}
          </TreeNode>
        );
      }
      return <TreeNode {...nodeProps} />;
    });
  };
  onCheck = ({ checked, halfChecked }) => {
    const { setProps } = this.props;
    setProps({
      permissionCodeList: checked
    }, false);
    this.props.handleTree(checked);
  };

  componentDidMount() {
    const { permissionCodeList } = this.props;
    this.props.handleTree(permissionCodeList);
  }

  componentDidUpdate() {
    const { permissionCodeList, hashId } = this.props;
    console.info('hashId', hashId);
    hashId !== 'new' && this.props.handleTree(permissionCodeList);
  }

  cleanTree = () => {
    const { setProps } = this.props;
    setProps({
      permissionCodeList: []
    }, false);
    this.props.handleTree([]);
  };
  refresh = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'personal_info/getRoleTree'
    });
  };

  render() {
    const roleTree = this.props.roleTree;
    const { permissionCodeList } = this.props;
    console.info('tree permissionCodeList: ', permissionCodeList);
    return (
      <div>
        <div style={{ marginTop: -24 }}>
          <Button size="small" type="primary" onClick={this.cleanTree} style={{ marginRight: 10 }}>清空</Button>
          <Button size="small" type="primary" onClick={this.refresh}>刷新</Button>
        </div>
        <Tree
          checkable
          checkStrictly
          checkedKeys={permissionCodeList}
          onCheck={this.onCheck}
        >
          {this.renderTreeNodes(roleTree)}
        </Tree>
      </div>
    );
  }
}

@connect(state => ({
    roleTree: state.personal_info.roleTree,
    cityList: state.personal_info.cityList
  })
)
@Form.create()
export default class RoleEdit extends PureComponent {
  state = {
    value: 1,
    cityList: '',
    cityNameList: [],
    selected: [],
    CodeList: '',
    clickStatus: true,
    roledetail: '',
    checkedTree: '',
    productList: '',
    areaCode: '',
  };
  onChangeradio = (e) => {
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
    });
  };
  roleDetails = async (id) => {
    let cityNameList = this.state.cityNameList.slice();
    let { data } = await request(`/api/role/${id}`);
    // cityNameList.push(...data.extAttr.cityList)
    this.setState({
      roledetail: data,
      cityNameList,
      checkedTree: data.permissionCodeList,
      productList: data.extAttr.productList
    });
  };

  componentDidMount() {
    const { dispatch, match: { params: { id } } } = this.props;
    console.info('这是', id);
    dispatch({
      type: 'personal_info/getRoleTree'
    });
    if (id !== 'new') {
      this.roleDetails(id);
    }
  };

  onChangeCity = (value, cityList) => {
    console.info('cityList', cityList);
    this.setState({
      cityList,
      areaCode: value
    });
  };
  // 添加城市到数组
  addCity = () => {
    let { cityNameList, cityList } = this.state;
    cityNameList = cityNameList.slice();
    if (cityNameList[cityNameList.length - 1] !== cityList) {
      cityNameList.push(cityList);
      this.setState({
        cityNameList,
      });
    }
  };
  // 移除城市
  removeCity = () => {
    let { selected, cityNameList } = this.state;
    cityNameList = cityNameList.slice();
    for (let i = cityNameList.length - 1; i >= 0; i--) {
      for (let m = selected.length - 1; m >= 0; m--) {
        if (cityNameList[i] === selected[m]) {
          cityNameList.splice(i, 1);
        }
      }
    }
    this.setState({
      cityNameList,
      selected: []
    });
  };

  selectedCity(item, e) {
    let { selected } = this.state;
    selected = selected.slice();
    const state = e.target.getAttribute('state');
    console.info('state的值', state);
    if (state !== 1) {
      selected.push(item);
      this.setState({
        selected,
      });
      e.target.style.backgroundColor = '#bae7ff';
      e.target.setAttribute('state', 1);
      console.log('点击以后的状态值', e.target.getAttribute('state'));
    } else {
      selected.splice(selected.indexOf(item), 1);
      this.setState({
        selected,
      });
      e.target.style.backgroundColor = '#fff';
      e.target.setAttribute('state', 0);
    }
  }

  handleTree = (CodeList) => {
    console.info('子组件传递的数据', CodeList);
    this.setState({ CodeList });
  };
  info = (text) => {
    message.info(text);
  };
  handleSubmit = (e) => {
    e.preventDefault();
    const { form, dispatch, match: { params: { id } } } = this.props;
    let { CodeList: permissionCodeList, cityNameList, cityNameList: { areaCode }, checkedTree } = this.state;
    console.info('CodeList', cityNameList);
    const cityList = cityNameList.map(({ areaCode }) => areaCode);
    const params = {};
    form.validateFieldsAndScroll((err, { productList = [], name, remark }) => {
      productList = _.isArray(productList) ? productList : [productList];
      if (!err) {
        _.merge(params, {
          extAttr: { productList, cityList },
          name,
          remark,
          permissionCodeList
        });
        if (id !== 'new') {
          dispatch({
            type: 'personal_info/editRole',
            params: Object.assign({}, params, { id })
          }).then(() => {
            window.history.go(-1);
          });
        } else {
          permissionCodeList.length &&
          dispatch({
            type: 'personal_info/addRole',
            params
          }).then((res) => {
            window.history.go(-1);
          })
        }
      }
    });

  };
  // 取消表单提交
  cancle = () => {
    this.props.form.resetFields();
    window.history.go(-1);
  };
  // 刷新
  refresh = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'personal_info/getRoleTree'
    });
  };
  width = { width: '80%' };

  render() {
    const { match: { params: { id } }, form: { getFieldDecorator, validateFieldsAndScroll, getFieldsError } } = this.props;
    const { roledetail, checkedTree, cityNameList, productList } = this.state;
    const idIsNumber = /^\d+$/.test(id);
    const { roleTree } = this.props;
    const roleTreeList = tree(roleTree, '0', { key: 'code', parentKey: 'parentCode' });
    // const {checkedTree} = this.state
    // const {cityNameList} = this.state;
    console.info('productList', productList);
    const formItemLayout = {
      labelCol: {
        xs: { span: 3 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
      },
    };
    console.log('permissionCodeList: ', checkedTree);
    return (
      <PageHeaderLayout>
        <Row gutter={24}>
          <Col span={6} className={styles.role_left} style={{ overflow: 'hidden' }}>
            <Card className={common.card}>
              <div className={common.marginTop}>
                {
                  roleTreeList ? <ControlledTree roleTree={roleTreeList} originalData={roleTree}
                                                 dispatch={this.props.dispatch}
                                                 permissionCodeList={idIsNumber ? checkedTree : []}
                                                 hashId={id}
                                                 handleTree={this.handleTree}></ControlledTree> : ''
                }
              </div>
            </Card>
          </Col>
          <Col span={18} style={{ marginBottom: 24 }} className={styles.role_right}>
            <Form layout='inline' onSubmit={this.handleSubmit}>
              <Card className={common.card}>
                <div className={styles.role_detail}>
                  <div className={styles.item}>
                    <FormItem
                      style={this.width} {...formItemLayout} label={`角色名称`}>
                      {
                        getFieldDecorator('name', {
                          rules: [{ required: true, message: '请输入角色名称' }],
                          initialValue: idIsNumber ? roledetail.name : ''
                        })(
                          <Input type="text" placeholder="角色名称" className={styles.addorginput}/>
                        )
                      }
                    </FormItem>
                  </div>
                  <div className={styles.item}>
                    <FormItem
                      style={this.width} {...formItemLayout} label={`角色备注`}>
                      {
                        getFieldDecorator('remark', {
                          initialValue: idIsNumber ? roledetail.remark : ''
                        })(
                          <TextArea placeholder="角色备注" autosize={{ minRows: 2, maxRows: 6 }}/>
                        )
                      }
                    </FormItem>
                  </div>
                </div>
              </Card>
              {/*<div className={styles.line}></div>*/}
              <Card className={`${styles.limitInfo} ${common.card}`}>
                <div>
                  <div>
                    <Tabs tabPosition='left' className={styles.selecttabs}>
                      <TabPane tab="产品线" key="1">
                        <FormItem>
                          {
                            getFieldDecorator('productList', {
                              rules: [{ required: true, message: '请选择产品分类' }],
                              initialValue: idIsNumber ? productList : '1'
                            })(
                              <Checkbox.Group style={{ width: '100%' }}>
                                <div>
                                  <Checkbox value='1'>新零售</Checkbox>
                                  <Checkbox value='2'>到店</Checkbox>
                                </div>
                              </Checkbox.Group>
                            )
                          }
                        </FormItem>
                      </TabPane>
                      <TabPane tab="地区" key="2">
                        <div>
                        <span className={`${common.columnsTwo} ${common.left}`}>
                        地区：
                        </span>
                          <div className={`${common.columnsTwo} ${common.right} ${styles.rightbox}`}>
                            <Region onChange={(value, clew) => this.onChangeCity(value, clew)}/>
                            <div className={styles.operate}>
                              <Button type="primary" size="small" className={styles.ensure}
                                      onClick={this.addCity}>添加</Button>
                              <Button type="danger" size="small" onClick={this.removeCity}>移除</Button>
                            </div>
                            <div className={styles.checked_box}>
                              {
                                cityNameList.map((item) => (
                                  <div key={item.areaCode} className={styles.space}
                                       onClick={this.selectedCity.bind(this, item)}>{item.mergerName}</div>
                                ))
                              }
                            </div>
                          </div>
                        </div>
                      </TabPane>
                    </Tabs>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <FormItem>
                      <Button type="primary" htmlType="submit" style={{ marginRight: 20 }}>确定</Button>
                      <Button onClick={this.cancle}>取消</Button>
                    </FormItem>
                  </div>
                </div>
              </Card>
            </Form>
          </Col>
        </Row>
      </PageHeaderLayout>
    );
  }
}
