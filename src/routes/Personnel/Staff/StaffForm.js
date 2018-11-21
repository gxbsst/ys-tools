import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import moment from 'moment/moment';
import { StaffFinder, FormItemGroup } from '../../../components';
import { RadioGroup } from '../../../components/Helpers';
import { MAX_GUARANTEE_AMOUNT } from '../../../config';
import { JOB_STATUS, LEADER_TYPE } from '../../../enums';
import { toSafeNumber } from '../../../utils';

const guaranteeNormalize = (value) => toSafeNumber(value, null, MAX_GUARANTEE_AMOUNT);

export default class StaffForm extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    staff: PropTypes.object,
    organization: PropTypes.bool,
  };

  onEmailChange = ({ target: { value } }) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ username: (value || '').split('@')[0] });
  };

  render() {
    const { staff = {}, leader, form, organization = false } = this.props;
    const { data = {}, loading } = staff;
    const defaultLeaderId = _.get(leader, 'data.id');
    const { email, username, name, mobile, position, isOnJob = 0, isLeader = false, leaderId, joinTime, leftTime, guaranteeAmount } = data;
    const items = [
      { name: 'email', label: '邮箱地址', value: email, max: 30, required: true, type: 'email', message: '请输入正确的邮箱地址', onChange: this.onEmailChange },
      { name: 'username', label: '登录帐号', value: username, required: true, disabled: true },
      { name: 'name', label: '员工姓名', value: name, max: 20, required: true },
      { name: 'mobile', label: '手机号码', value: mobile, max: 20, required: true },
      { name: 'position', label: '职位名称', value: position, max: 20, required: true },
      { name: 'isOnJob', label: '在职状态', value: isOnJob, component: RadioGroup, items: JOB_STATUS },
      { name: 'joinTime', label: '入职时间', value: joinTime ? moment(joinTime) : null, component: DatePicker, format: 'YYYY-MM-DD', required: true },
      { name: 'leftTime', label: '离职时间', value: leftTime ? moment(leftTime) : null, component: DatePicker, format: 'YYYY-MM-DD' },
      { name: 'guaranteeAmount', label: '担保额度', value: guaranteeAmount, message: '请输入正确的担保额度', options: { normalize: guaranteeNormalize } },
    ];
    if (organization) {
      items.push(
        { name: 'isLeader', label: '组织负责人', value: isLeader, component: RadioGroup, items: LEADER_TYPE },
        { name: 'leaderId', label: '直接上级', value: leaderId || defaultLeaderId, component: StaffFinder, required: true, message: '请选择有效的员工信息' },
      );
    }
    return <FormItemGroup items={items} cols={2} form={form} loading={loading}/>;
  }
}
