import React, { PureComponent } from 'react';
import { routerRedux } from 'dva/router';
import { Card, Form, Input, Button, message } from 'antd';
import qs from 'qs';
import { connect } from 'dva';
import can from '../../decorators/Can';
import ApprovalFlow from './ApprovalDetail/ApprovalFlow';
import ClueCleanDetail from './ApprovalDetail/ClueCleanDetail';
import ISSendListDetail from './ApprovalDetail/ISSendListDetail';
import OSRejectDetail from './ApprovalDetail/OSRejectDetail';
import GiveListDetail from './ApprovalDetail/GiveListDetail';
import NoRepayInvoiceApplyDetail from './ApprovalDetail/NoRepayInvoiceApplyDetail';
import GuaranteeOpenDetail from './ApprovalDetail/GuaranteeOpenDetail';
import autodata from '../../decorators/AutoData';
import styles from './ApprovalDetails.less';

const FormItem = Form.Item,
  { TextArea } = Input;

@autodata('/api/processes/:id')
@connect(({ approval, loading }) => ({
  approval,
  submitting: loading.effects['approval/approve']
}))
@can()
export default class ApprovalDetails extends PureComponent {
  state = {
    remark: '',
    cardLoading: true,
    currAction: -2
  };

  componentWillReceiveProps(nextProps) {
    const { setHeaderProps, $data: { data } } = nextProps;
    if (data) {
      setHeaderProps({
        title: [
          `审批流ID：${data.process.id}`,
          `审批类型: ${data.process.processName}`,
          `申请人：${data.process.applyRealName}`,
          `申请时间：${data.process.createTime}`
        ]
      });
      this.setState({
        cardLoading: false
      });
    }
  }

  handleChange = e => {
    this.setState({
      remark: e.target.value
    });
  };

  approveEvent = (id, result) => {
    this.setState({
      currAction: result
    });
    const { dispatch } = this.props;
    let { remark } = this.state;
    if (this.state.remark === '' && result !== 0) {
      message.error('请输入审核备注');
    } else if (this.state.remark.split('').length > 300) {
      message.error('审核备注不能超过300字');
    } else {
      if (this.state.remark === '' && result === 0) {
        remark = '通过';
      }
      const params = {
        id,
        remark,
        result
      };
      dispatch({
        type: 'approval/approve',
        payload: params
      }).then(res => {
        if (!res.code) {
          const redirectUrl = qs.parse(this.props.location.search.substr(1))
            .redirect;
          if (redirectUrl) {
            dispatch(routerRedux.push(redirectUrl));
          } else {
            dispatch(
              routerRedux.push(
                '/approval/my-approval/wait-approval?type=examine'
              )
            );
          }
        }
      });
    }
  };

  render() {
    const approve = 7002002; //审批操作
    const { can } = this.props;
    const { $data: { data } } = this.props;
    const { cardLoading } = this.state;
    let detailContent = null;
    if (!data) return null;
    switch (data.process.processId) {
      case 1:
        //线索清洗审批流
        detailContent = (
          <ClueCleanDetail data={data.data} id={data.process.businessId} />
        );
        break;
      case 2:
        //IS派单审批流
        detailContent = (
          <ISSendListDetail data={data.data} id={data.process.businessId} />
        );
        break;
      case 3:
        //OS驳回流程
        detailContent = (
          <OSRejectDetail data={data.data} id={data.process.businessId} />
        );
        break;
      case 4:
        //没有回款时的发票申请（后关联业务）
        detailContent = <NoRepayInvoiceApplyDetail data={data.data} />;
        break;
      case 5:
        //担保开通流程
        detailContent = <GuaranteeOpenDetail data={data.data} />;
        break;
      case 6:
        //提单流程审批
        detailContent = <GiveListDetail data={data.data} />;
        break;
    }

    return (
      <div>
        {detailContent && (
          <ApprovalFlow
            isEnd={data.process.task === 'end'}
            history={data.history}
            process={data.process}
          />
        )}
        <Card loading={cardLoading}>
          {detailContent}
          {detailContent &&
            data.process.hasApproval &&
            can(approve) && (
              <Card>
                <Form>
                  <FormItem>
                    <TextArea
                      rows={3}
                      placeholder="请输入审核备注"
                      onChange={this.handleChange}
                    />
                  </FormItem>
                  <FormItem className={styles.allButtonWrapper}>
                    <Button
                      type="primary"
                      className={styles.button}
                      onClick={() => this.approveEvent(data.process.id, 0)}
                      loading={
                        this.state.currAction === 0 && this.props.submitting
                      }
                    >
                      通过
                    </Button>
                    <Button
                      className={styles.button}
                      onClick={() => this.approveEvent(data.process.id, 1)}
                      loading={
                        this.state.currAction === 1 && this.props.submitting
                      }
                    >
                      驳回
                    </Button>
                    {data.process.processId === 1 && (
                      <Button
                        type="danger"
                        className={styles.button}
                        onClick={() => this.approveEvent(data.process.id, -1)}
                        loading={
                          this.state.currAction === -1 && this.props.submitting
                        }
                      >
                        废弃
                      </Button>
                    )}
                  </FormItem>
                </Form>
              </Card>
            )}
        </Card>
      </div>
    );
  }
}
