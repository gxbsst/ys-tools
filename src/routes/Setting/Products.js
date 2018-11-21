import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Row, Col, Card, Tabs, Popconfirm, message } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import can from '../../decorators/Can';
import ProductsTree from './_ProductsTree';
import ProductList from './Table/ProductList';
import ProductDirCreateModal from './Modal/ProductDirCreateModal';
import ProductDirMigrateModal from './Modal/ProductDirMigrateModal';
import SoftwareProductModal from './Modal/EditSoftwareProductModal';
import HardwareProductModal from './Modal/EditHardwareProductModal';
import IncrementProductModal from './Modal/EditIncrementProductModal';
import styles from './Products.less';

const { TabPane } = Tabs;

const optionMap = {
  read: '查看',
  create: '新建',
  update: '编辑',
}
const productMap = {
  software: '软件',
  hardware: '硬件',
  increment: '增值服务',
}

@connect(state => ({
  products: state.products,
}))
@can([12001001])
export default class Products extends PureComponent {
  state = {
    visible: 0,
    selectedKeys: [],
    selectedRoot: false,
    type: 'software',
    option: 'create',
    selectedPath: '',
    product: {},
    softwareList: [],
    hardwareList: [],
    incrementList: [],
    softwarePagination: {},
    hardwarePagination: {},
    incrementPagination: {},
  }

  componentDidMount() {
    this.fetchProductList();
  }
  onListChange = (pagination) => {
    const { current: page, pageSize} = pagination;
    this.fetchProductList({ pagination: {page, pageSize}});
  }
  tabChange = async (type) => {
    await this.setState({type});
    this.fetchProductList();
  }
  refreshProductDirs = () => {
    const {dispatch} = this.props;
    dispatch({
      type: 'products/getProductDir',
    });
    this.setState({selectedKeys: []});
  }
  fetchProductList = ({key, pagination = {}} = {}) => {
    const { dispatch } = this.props;
    const { selectedKeys } = this.state;
    const type = key || this.state.type;
    this.setState({
      [`${type}List`]: [],
      [`${type}Pagination`]: {},
    })
    dispatch({
      type: 'products/fetchProductList',
      payload: {
        id: ~~selectedKeys,
        type: ['', 'software', 'hardware', 'increment'].indexOf(type),
        ...pagination,
      }
    }).then((res) => {
      if (res.code) return;
      const { totalCount: total, page: current, pageSize } = res.pagination;
      this.setState({
        [`${type}List`]: res.data,
        [`${type}Pagination`]: {current, pageSize, total},
      })
    });
  }
  handleCancel = () => {
    this.setState({
      visible: 0,
    })
  }
  newProduct = (code) => {
    return () => {
      this.setState({
        product: {},
        visible: code,
        option: 'create',
      })
    }
  }

  onOptionClick = (code) => {
    return async (record, option) => {
      await this.setState({
        product: record,
        option,
      })
      this.setState({
        visible: code,
      })
    }
  }
  handleOk = (code) => {
    const { dispatch } = this.props;
    const { selectedKeys } = this.state;
    switch (code) {
      case -1: //添加产品目录
        return (data) => {
          dispatch({
            type: 'products/addDir',
            payload: {...data, parentId: selectedKeys[0], type: this.state.selectedType},
          }).then(res => {
            if (!res.code) {
              this.refreshProductDirs();
              this.handleCancel();
            } else {
              message.error(res.message);
            }
          })
        };
      case -2: //转移产品目录
        return (data) => {
          dispatch({
            type: 'products/migrateDir',
            payload: {...data, id: selectedKeys[0], type: this.state.parentType},
          }).then(res => {
            if (res) {
              this.refreshProductDirs();
              this.handleCancel();
            }
          })
        };
      case -3: //删除产品目录
        return () => {
          dispatch({
            type: 'products/deleteDir',
            payload: selectedKeys[0],
          }).then(res => {
            if (!res.code) {
              message.success(res.message);
              this.refreshProductDirs();
              this.fetchProductList();
            }
          })
        };
      case 1: //software
      case 2: //hardware
      case 3: //increment
        //新建,查看,编辑产品
        return (data) => {
          const { option } = this.state;
          if (option === 'read') {
            this.setState({
              visible: 0
            })
          } else {
            const { softwareSeries, ...restData } = data;
            dispatch({
              type: `products/${option}Product`,
              payload: {
                ...restData,
                softwareSeries,
                // softwareSeries: softwareSeries ? softwareSeries[1] : undefined,
                type: ['', 'software', 'hardware', 'increment'].indexOf(this.state.type)
              },
            }).then(res => {
              if (!res || res.code) return;
              this.setState({
                visible: 0
              })
              this.fetchProductList();
            });
          }
        };
    }
  }

  getParentPaths(parentId) {
    if (!parentId) return '';
    const parentNode = this.props.products.productDir.filter(item => item.id === parentId);
    if (parentNode.length) {
      return `${this.getParentPaths(parentNode[0].parentId)}${parentNode[0].name}/`;
    } else {
      return '';
    }
  }
  onProductTreeSelect = async (selectedKeys, info) => {
    const { name, parentId, type } = info.node.props;
    const parentPaths = this.getParentPaths(parentId);
    const selectedPath = parentPaths + name;
    await this.setState({
      selectedKeys,
      selectedPath,
      selectedType: type,
      selectedRoot: !!parentId,
    });
    this.fetchProductList();
  }
  onMigrateSelect = (value, node) => {
    this.setState({
      parentType: node.props.type,
    })
  }
  render() {
    const { products: { productDir, confirmLoading, loadingProductDir, loadingProductList }, can } = this.props;
    const { type, option, visible, product = {} } = this.state;
    const simpleTreeData = productDir.map((item) => ({...item, value: `${item.id}`, title: item.name}));
    const simpleFormat = {
      id: 'id',
      pId: 'parentId',
      rootPId: 0,
    };
    const listProps = (code) => ({
      type,
      pagination: this.state[`${type}Pagination`],
      onOptionClick: this.onOptionClick(code),
      dataSource: this.state[`${type}List`],
      loading: loadingProductList,
      onChange: this.onListChange,
    })

    const modalProps = (code) => ({
      option,
      id: product.id,
      confirmLoading,
      title: `${optionMap[option]}${productMap[type]}产品`,
      width: 800,
      visible: visible === code,
      onOk: this.handleOk(code),
      onCancel: this.handleCancel,
      destroyOnClose: true,
      treeData: simpleTreeData,
      treeDataSimpleMode: simpleFormat
    })
    return (
      <PageHeaderLayout>
        <Row gutter={10}>
          <Col lg={6} md={8} sm={24} xs={24}>
            <Card loading={loadingProductDir} bordered={false} className={styles.productTreeCard}>
              <Row gutter={0} className={styles.productTreebutton}>
                <Col xs={8}>
                  {
                    can(12001002) &&
                    <Button disabled={!~~this.state.selectedKeys} type="primary" onClick={() => this.setState({visible: -1})}>新建</Button>
                  }
                </Col>
                <Col xs={{span: 8}}>
                  {
                    can(12001004) &&
                    <Button disabled={!~~this.state.selectedKeys || !this.state.selectedRoot} type="default" onClick={() => this.setState({visible: -2})}>转移</Button>
                  }
                </Col>
                <Col xs={{span: 8}}>
                  {
                    can(12001003) &&
                    <Popconfirm title="确定删除此目录吗?" onConfirm={this.handleOk(-3)} okText="确定" cancelText="取消">
                      <Button disabled={!~~this.state.selectedKeys || !this.state.selectedRoot} type="danger">删除</Button>
                    </Popconfirm>
                  }
                </Col>
              </Row>
              <ProductsTree
                expandLevel={2}
                treeData={simpleTreeData}
                treeDataSimpleMode={simpleFormat}
                onSelect={this.onProductTreeSelect}
              />
            </Card>
          </Col>
          <Col lg={18} md={16} sm={24} xs={24}>
            <Card bordered={false} className={styles.productListCard}>
              <Tabs activeKey={this.state.type} onChange={this.tabChange}>
                <TabPane tab="软件产品" key="software">
                  <div style={{marginBottom: '16px'}}>
                    {
                      can(12001006) &&
                      <Button icon="plus" type="primary" onClick={this.newProduct(1)}>新建</Button>
                    }
                  </div>
                  <ProductList {...listProps(1)}/>
                </TabPane>
                <TabPane tab="硬件产品" key="hardware">
                  <div style={{marginBottom: '16px'}}>
                    {
                      can(12001006) &&
                      <Button icon="plus" type="primary" onClick={this.newProduct(2)}>新建</Button>
                    }
                  </div>
                  <ProductList {...listProps(2)}/>
                </TabPane>
                <TabPane tab="增值服务产品" key="increment">
                  <div style={{marginBottom: '16px'}}>
                    {
                      can(12001006) &&
                      <Button icon="plus" type="primary" onClick={this.newProduct(3)}>新建</Button>
                    }
                  </div>
                  <ProductList {...listProps(3)}/>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>

        <ProductDirCreateModal
          title="新建产品目录"
          visible={this.state.visible === -1}
          onOk={this.handleOk(-1)}
          onCancel={this.handleCancel}
          confirmLoading={confirmLoading}
          selectedPath={this.state.selectedPath}
        />
        {
          this.state.visible == -2 &&
          <ProductDirMigrateModal
            title="产品目录转移"
            visible={this.state.visible === -2}
            onOk={this.handleOk(-2)}
            onCancel={this.handleCancel}
            confirmLoading={confirmLoading}
            onSelect={this.onMigrateSelect}
            selectedPath={this.state.selectedPath}
            selectedKeys={this.state.selectedKeys}
            treeData={simpleTreeData}
            treeDataSimpleMode={simpleFormat}
          />
        }


        { this.state.visible == 1 && <SoftwareProductModal {...modalProps(1)}/> }

        { this.state.visible == 2 && <HardwareProductModal {...modalProps(2)}/> }

        { this.state.visible == 3 && <IncrementProductModal {...modalProps(3)}/> }

      </PageHeaderLayout>
    )
  }
}
