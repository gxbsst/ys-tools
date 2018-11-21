import React, { PureComponent } from 'react';
import { Table, Modal, message } from 'antd';
import { connect } from 'dva';
import DescriptionList from '../../components/DescriptionList';
import { getBackpayStatus } from '../../utils/helpers';

const { Description } = DescriptionList;

@connect(state => ({
  invoice: state.invoice
}))
export default class InvoiceLinkBusiness extends PureComponent {
  state = {
    productMoney: 0,
    servicePrice: 0,
    selectedRowKeys: [],
    business: []
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/linkBusiness',
      payload: this.props.linkInvoiceId
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      'invoice' in nextProps &&
      nextProps.invoice.isModalClose &&
      this.props.invoice.isModalClose !== nextProps.invoice.isModalClose
    ) {
      if (nextProps.invoice.isModalClose) {
        this.props.handleLinkBusinessCancel();
      }
    }
  }

  handleLinkBusinessOk = () => {
    if (this.state.business.length > 0) {
      const { dispatch } = this.props;
      const params = {
        business: this.state.business,
        id: this.props.linkInvoiceId
      };
      dispatch({
        type: 'invoice/saveLinkBusi',
        payload: params
      }).then(res => {
        if (!res.code) {
          this.props.handleLinkBusinessCancel();
          this.props.reload();
        }
      });
    } else {
      this.props.handleLinkBusinessCancel();
    }
  };

  render() {
    const columns = [
      {
        title: '产品类型',
        dataIndex: 'productType',
        key: 'productType'
      },
      {
        title: '产品名称',
        dataIndex: 'productName',
        key: 'productName'
      },
      {
        title: '产品金额',
        dataIndex: 'productAmount',
        key: 'productAmount',
        render: text => {
          return `￥${text}`;
        }
      },
      {
        title: '服务金额',
        dataIndex: 'serviceAmount',
        key: 'serviceAmount',
        render: text => {
          return `￥${text}`;
        }
      },
      {
        title: '回款状态',
        dataIndex: 'backPayStatus',
        key: 'backPayStatus',
        render: getBackpayStatus
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
        key: 'createUserName'
      }
    ];
    const { selectedRowKeys } = this.state;
    let tempSelectedRowKeys = selectedRowKeys,
      tempBusiness = [];
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        tempSelectedRowKeys = selectedRowKeys;
        let tempProductMoney = 0,
          tempServiceMoney = 0;
        for (const oneRow of selectedRows) {
          tempProductMoney += oneRow.productAmount;
          tempServiceMoney += oneRow.serviceAmount;
          tempBusiness.push(oneRow.id);
        }
        this.setState({
          productMoney: tempProductMoney,
          servicePrice: tempServiceMoney,
          selectedRowKeys: tempSelectedRowKeys,
          business: tempBusiness
        });
      },
      onSelect: (record, selected, selectedRows) => {
        let totalMoney = 0;
        for (const oneRow of selectedRows) {
          totalMoney += oneRow.productAmount + oneRow.serviceAmount;
        }
        if (this.props.invoiceAmount < Number(totalMoney.toFixed(2))) {
          message.info('发票不够关联此业务');
          tempSelectedRowKeys.pop();
          tempBusiness.pop();
          const tempSelectedRows = selectedRows;
          tempSelectedRows.pop();
          let tempProductMoney = 0,
            tempServiceMoney = 0;
          for (const oneRow of tempSelectedRows) {
            tempProductMoney += oneRow.productAmount;
            tempServiceMoney += oneRow.serviceAmount;
          }
          this.setState({
            selectedRows: tempSelectedRowKeys,
            business: tempBusiness,
            productMoney: tempProductMoney,
            servicePrice: tempServiceMoney
          });
        }
      },
      onSelectAll: (selected, selectedRows) => {
        let totalMoney = 0;
        for (const oneRow of selectedRows) {
          totalMoney += oneRow.productAmount + oneRow.serviceAmount;
        }
        if (this.props.invoiceAmount < Number(totalMoney.toFixed(2))) {
          message.info('发票不够关联所有业务，请重新选择！');
          this.setState({
            productMoney: 0,
            servicePrice: 0,
            selectedRowKeys: [],
            business: []
          });
        }
      }
    };
    const { linkBusinessModalVisible } = this.props,
      { productMoney, servicePrice } = this.state,
      { invoice: { linkBusi, confirmLoading } } = this.props;
    return (
      <Modal
        title="关联业务"
        visible={linkBusinessModalVisible}
        onOk={this.handleLinkBusinessOk}
        confirmLoading={confirmLoading}
        onCancel={this.props.handleLinkBusinessCancel}
        destroyOnClose
        width="800px"
      >
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={linkBusi.bizList}
          size="small"
          pagination={false}
          style={{ marginBottom: '16px' }}
          rowKey="id"
        />
        <DescriptionList size="large" col={2}>
          <Description term="产品金额">{`￥${productMoney.toFixed(
            2
          )}`}</Description>
          <Description term="服务金额">{`￥${servicePrice.toFixed(
            2
          )}`}</Description>
          <Description term="已开票金额">{`￥${
            linkBusi.relAmount
          }`}</Description>
          <Description term="当前开票金额">
            {`￥${(productMoney + servicePrice).toFixed(2)}`}
          </Description>
        </DescriptionList>
      </Modal>
    );
  }
}
