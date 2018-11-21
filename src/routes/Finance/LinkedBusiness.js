import React, { PureComponent } from 'react';
import { Table, Modal, message } from 'antd';
import { connect } from 'dva';
import DescriptionList from '../../components/DescriptionList';

const { Description } = DescriptionList;

@connect(state => ({
  repay: state.repay
}))
export default class LinkedBusiness extends PureComponent {
  state = {
    bizId: [],
    currentLinkMoney: 0,
    selectedRowKeys: []
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'repay/linkBusiness',
      payload: this.props.linkRepayId
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      'repay' in nextProps &&
      nextProps.repay.isModalClose &&
      this.props.repay.isModalClose !== nextProps.repay.isModalClose
    ) {
      if (nextProps.repay.isModalClose) {
        this.props.handleLinkBusinessCancel();
      }
    }
  }

  handleLinkBusinessOk = () => {
    if (this.state.bizId.length > 0) {
      if (
        this.props.payAmount -
          this.props.relAmount -
          this.state.currentLinkMoney <
        0
      ) {
        message.info('回款已不够关联，排在最后的业务将部分回款');
      }
      const { dispatch } = this.props;
      const params = {
        bizId: this.state.bizId,
        id: this.props.linkRepayId
      };
      dispatch({
        type: 'repay/saveLinkBusi',
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
        title: '已回款金额',
        dataIndex: 'paymentAmount',
        key: 'paymentAmount',
        render: text => {
          return `￥${text}`;
        }
      },
      {
        title: '产品费欠款',
        dataIndex: 'productAmountRemain',
        key: 'productAmountRemain',
        render: text => {
          return `￥${text}`;
        }
      },
      {
        title: '服务费欠款',
        dataIndex: 'serviceAmountRemain',
        key: 'serviceAmountRemain',
        render: text => {
          return `￥${text}`;
        }
      },
      {
        title: '业务创建人',
        dataIndex: 'createUser',
        key: 'createUser'
      }
    ];

    const { selectedRowKeys } = this.state;
    let tempSelectedRowKeys = selectedRowKeys,
      tempBizId = [];
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        tempSelectedRowKeys = selectedRowKeys;
        let tempMoney = 0;
        for (let i = 0; i < selectedRows.length; i++) {
          tempBizId.push(selectedRows[i].id);
          tempMoney +=
            selectedRows[i].productAmountRemain +
            selectedRows[i].serviceAmountRemain;
        }
        this.setState({
          bizId: tempBizId,
          currentLinkMoney: tempMoney,
          selectedRowKeys: tempSelectedRowKeys
        });
      },
      onSelect: (record, selected, selectedRows) => {
        let totalMoney = 0,
          totalMoneyLessOne = 0;
        for (const oneRow of selectedRows) {
          totalMoney += oneRow.productAmountRemain + oneRow.serviceAmountRemain;
        }
        if (selectedRows.length > 1) {
          totalMoneyLessOne =
            totalMoney -
            selectedRows[selectedRows.length - 2].productAmountRemain -
            selectedRows[selectedRows.length - 2].serviceAmountRemain;
        }
        if (
          this.props.payAmount -
            this.props.relAmount -
            Number(totalMoney.toFixed(2)) <
          0
        ) {
          if (selectedRows.length === 1) {
            message.info('回款已不够关联，排在最后的业务将部分回款');
            this.setState({
              currentLinkMoney: this.props.payAmount - this.props.relAmount
            });
          } else if (
            this.props.payAmount - this.props.relAmount - totalMoneyLessOne >
            0
          ) {
            message.info('回款已不够关联，排在最后的业务将部分回款');
            this.setState({
              currentLinkMoney: this.props.payAmount - this.props.relAmount
            });
          } else {
            message.info('回款不够关联此业务！');
            tempSelectedRowKeys.pop();
            const tempSelectedRows = selectedRows;
            tempSelectedRows.pop();
            let tempMoney = 0;
            for (const oneRow of tempSelectedRows) {
              tempMoney +=
                oneRow.productAmountRemain + oneRow.serviceAmountRemain;
            }
            tempBizId.pop();
            this.setState({
              selectedRowKeys: tempSelectedRowKeys,
              bizId: tempBizId,
              currentLinkMoney: tempMoney
            });
          }
        }
      },
      onSelectAll: (selected, selectedRows) => {
        let totalMoney = 0;
        for (const oneRow of selectedRows) {
          totalMoney += oneRow.productAmountRemain + oneRow.serviceAmountRemain;
        }
        if (
          this.props.payAmount -
            this.props.relAmount -
            Number(totalMoney.toFixed(2)) <
            0 &&
          selectedRows.length > 1
        ) {
          message.info('回款不够关联所有业务，请重新选择！');
          this.setState({
            bizId: [],
            currentLinkMoney: 0,
            selectedRowKeys: []
          });
        }
        if (
          this.props.payAmount -
            this.props.relAmount -
            Number(totalMoney.toFixed(2)) <
            0 &&
          selectedRows.length === 1
        ) {
          message.info('回款已不够关联，排在最后的业务将部分回款');
          const businessId = [];
          businessId.push(selectedRows[0].id);
          this.setState({
            bizId: businessId,
            currentLinkMoney: this.props.payAmount - this.props.relAmount,
            selectedRowKeys: tempSelectedRowKeys
          });
        }
      }
    };
    const { repay: { confirmLoading, linkBusi } } = this.props,
      { bizId, currentLinkMoney } = this.state,
      { payAmount, relAmount } = this.props;
    return (
      <Modal
        title="关联业务"
        visible={this.props.linkBusinessModalVisible}
        onOk={this.handleLinkBusinessOk}
        confirmLoading={confirmLoading}
        onCancel={this.props.handleLinkBusinessCancel}
        destroyOnClose
        width="800px"
      >
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={linkBusi}
          size="small"
          pagination={false}
          rowKey="id"
          style={{ marginBottom: '16px' }}
        />
        <DescriptionList size="large" col={2}>
          <Description term="入账金额">{`￥${payAmount}`}</Description>
          <Description term="选中业务数量">{`${bizId.length}`}</Description>
          <Description term="已关联金额">{`￥${relAmount}`}</Description>
          <Description term="本次关联金额">{`￥${currentLinkMoney.toFixed(
            2
          )}`}</Description>
          <Description term="可关联金额">
            {this.props.payAmount -
              this.props.relAmount -
              Number(currentLinkMoney.toFixed(2)) >
            0
              ? `￥${(
                  this.props.payAmount -
                  this.props.relAmount -
                  currentLinkMoney
                ).toFixed(2)}`
              : '￥0'}
          </Description>
        </DescriptionList>
      </Modal>
    );
  }
}
