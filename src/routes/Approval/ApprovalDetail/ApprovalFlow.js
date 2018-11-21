import React, { PureComponent } from 'react';
import { Card, Steps } from 'antd';
import styles from '../ApprovalDetails.less';

const { Step } = Steps;

export default class ApprovalFlow extends PureComponent {
  render() {
    const { history, process } = this.props;
    const desc = [];
    for (const oneRecord of history) {
      desc.push(
        <div className={styles.descWrapper} key={oneRecord.id}>
          <div>{oneRecord.examineRealName}</div>
          <div>{oneRecord.examineTime}</div>
          <div className={styles.whiteSpace}>
            {oneRecord.result === 0
              ? `通过${oneRecord.remark ? `:${oneRecord.remark}` : ''}`
              : oneRecord.result === 1
                ? `驳回${oneRecord.remark ? `:${oneRecord.remark}` : ''}`
                : oneRecord.result === -1
                  ? `废弃${oneRecord.remark ? `:${oneRecord.remark}` : ''}`
                  : `${oneRecord.remark ? oneRecord.remark : ''}`}
          </div>
          {!!oneRecord.guaranteeAmount && (
            <div>{`担保金额：￥${oneRecord.guaranteeAmount}`}</div>
          )}
        </div>
      );
    }
    const currDesc = (
      <div className={styles.descWrapper}>
        <div>{process.examineName}</div>
        <div style={{ color: 'blue' }}>待审核</div>
      </div>
    );
    return (
      <Card>
        <Steps
          progressDot
          current={history.length}
          style={{ overflow: 'auto', paddingTop: '2px' }}
        >
          {history.map((oneRecord, index) => {
            return (
              <Step
                title={oneRecord.taskName}
                description={desc[index]}
                key={oneRecord.id}
              />
            );
          })}
          {process.status === 2 && (
            <Step title={process.taskName} description={currDesc} />
          )}
          <Step title={process.status === 2 ? '完成' : process.taskName} />
        </Steps>
      </Card>
    );
  }
}
