/* eslint-disable no-param-reassign */
import React, { PureComponent } from 'react';
import { Button, Popconfirm, Table, message } from 'antd';
import PayedWayModal from './PayedWayModal';
import { accAdd, accMul } from "../../../../utils/helpers";

const emptyContactItem = {
  payCondition: '',
  amount: 0,
  payTime: '',
  payScale: 0,
  remark: '',
};

export default class PayedWayForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.value,
      business: props.business,
      showModal: false,
    };
    this.index = 0;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.value,
      business: nextProps.business,
    });
  }

  getRowByKey(key) {
    return this.state.data.filter(item => item.key === key)[0];
  }

  remove(key) {
    const newData = this.state.data.filter(item => item.key !== key);
    this.setState({ data: newData });
    this.props.onChange(newData);
  }

  saveRow(data) {
    const newData = [...this.state.data];
    let curAmount = accAdd(newData.reduce((amount, cur) => accAdd(amount, parseFloat(cur.amount)), 0), parseFloat(data.amount));
    if (curAmount > this.state.business.amount) {
      // console.info(curAmount, this.state.business.amount)
      message.error('付款金额已超过总金额');
      return;
    }
    if (data.isNew) {
      delete data.isNew;
      newData.push(data);
    } else {
      const targetIndex = newData.findIndex(item => item.key === data.key);
      newData[targetIndex] = { ...data };
    }
    this.setState({ data: newData, showModal: false });
    this.props.onChange(newData);
  }

  showModal(type, data) {
    switch (type) {
      case 'new':
        this.setState({ showModal: true, currentSelect: { ...emptyContactItem, isNew: true, key: `NEW_TEMP_ID_${this.index}` } });
        this.index += 1;
        return;
      default:
        this.setState({ showModal: true, currentSelect: { ...emptyContactItem, isNew: true, key: `NEW_TEMP_ID_${this.index}` } });
        this.index += 1;
    }
  }

  render() {
    const columns = [
      {
        title: '付款条件',
        dataIndex: 'payCondition',
        key: 'payCondition',
        width: 75,
        render: (text) => {
          return (
            <span>{text === 'full' ? '全额' : '分期'}</span>
          );
        },
      }, {
        title: '付款金额',
        dataIndex: 'amount',
        key: 'amount',
        width: 100,
      }, {
        title: '付款占比',
        dataIndex: 'payScale',
        key: 'payScale',
        width: 100,
        render: (text) => <span>{accMul(text, 100)}%</span>
      }, {
        title: '付款日期',
        dataIndex: 'payTime',
        key: 'payTime',
        width: 100,
      }, {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 100,
      }, {
        title: '操作',
        key: 'action',
        width: 50,
        render: (text, record) => {
          return (
            <span>
            <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
              <a>删除</a>
            </Popconfirm>
          </span>
          );
        },
      }];
    const modalProps = {
      visible: true,
      title: this.state.currentSelect && this.state.currentSelect.isNew ? '新增' : '编辑',
      onCancel: () => this.setState({ showModal: false }),
    }
    const newData = [...this.state.data];
    let curAmount = newData.reduce((amount, cur) => accAdd(amount, parseFloat(cur.amount)), 0);
    return (
      <div>
        <Button
          type="dashed"
          onClick={() => {
            if (this.state.business.ids.length === 0) {
              message.error('请选择业务');
            } else if (curAmount == this.state.business.amount){
              message.error('已分配完成');
            } else {
              this.showModal('new');
            }
          }}
          icon="plus"
        >
          添加付款
        </Button>
        {
          this.state.data.length > 0 &&
          <Table
            columns={columns}
            dataSource={this.state.data}
            pagination={false}
          />
        }
        { this.state.showModal && <PayedWayModal item={this.state.currentSelect} onOK={this.saveRow.bind(this)} {...modalProps} amount={this.state.business.amount} /> }
      </div>
    );
  }
}
