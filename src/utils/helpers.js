import _ from 'lodash';
import Call from '../components/CallCenter/Call';
import {Currency, Email} from '../components/Helpers';
import {bytes, dateFormat, percent, getEnumProperty, enums} from './index';
import {CHANCE_OPTYPE} from '../enums';
import {Fragment} from 'react';

// 货币格式化
export const getCurrency = (value) => <Currency value={value}/>;

// 性别
export const getGender = (value) => getEnumProperty('GENDER', value);

// 业务类型
export const getBusinessType = (value) => getEnumProperty('BUSINESS_TYPE', value);

// 产品类型
export const getProductType = (value) => _.isNumber(value) ? getEnumProperty('PRODUCT_TYPE', value) : value;

// 线索、机会、客户来源
export const getSource = (value, {firstFromSourceName, secondFromSourceName}) => `${firstFromSourceName} / ${secondFromSourceName}`;

// 购买及赠送时长
export const getServiceDuration = (value, record) => {
  let {chargeMode, chargeUnit, itemType, buyStoreCount, giftStoreCount, buyWechatCount, giftWechatCount, dredgeTimes, giftTimes} = record;
  let giftUnit = 4;
  let charge = <span className="text-gray">无</span>;
  let gift = <span className="text-gray">无</span>;
  switch (itemType) {
    case 3:
      if (buyStoreCount) charge = `${buyStoreCount}${getChargeUnit(1)}`;
      if (giftStoreCount) gift = `${giftStoreCount}${getChargeUnit(1)}`;
      break;
    case 4:
      if (buyWechatCount) charge = `${buyWechatCount}${getChargeUnit(1)}`;
      if (giftWechatCount) gift = `${giftWechatCount}${getChargeUnit(1)}`;
      break;
    default:
      if (dredgeTimes) {
        if (chargeMode === 1 && !(dredgeTimes % 12)) {
          dredgeTimes /= 12;
          chargeUnit = 3;
        }
        charge = `${dredgeTimes}${getChargeUnit(chargeUnit)}`;
      }
      if (giftTimes) {
        if (!(giftTimes % 12)) {
          giftTimes /= 12;
          giftUnit = 3;
        }
        gift = `${giftTimes}${getChargeUnit(giftUnit)}`;
      }
      break;
  }
  return <Fragment>{charge} / {gift}</Fragment>;
};

// 在职状态
export const getJobStatus = (value) => getEnumProperty('JOB_STATUS', value);

// 在职状态（Tag展示）
export const getJobStatusTag = (value) => getEnumProperty('JOB_STATUS', value, 'tag');

// 客户状态
export const getCustomerStatus = (value) => getEnumProperty('CUSTOMER_STATUS', value);

// 客户状态（Tag展示）
export const getCustomerStatusTag = (value) => getEnumProperty('CUSTOMER_STATUS', value, 'tag');

//来源标签
export const getFromSource = (value) => getEnumProperty('PRODUCT_LINE', value);

//经营状态
export const getManageStatus = (value) => getEnumProperty('MANAGE_STATUS', value);

//日志类型
export const getOpTypes = (value) => getEnumProperty('LOG_TYPE', value);

//漏斗等级
export const getFunnelRank = (value) => getEnumProperty('FUNNEL_GRADE', value);

// 客户状态
export const getPaidStatus = (value) => getEnumProperty('PAID_STATUS', value);

// 合同状态
export const getContractStatus = (value) => getEnumProperty('CONTRACT_STATUS', value);

// 合同类型
export const getContractType = (value) => getEnumProperty('CONTRACT_TYPE', value);

// 付款执行状态
export const getPaymentStatus = (value) => getEnumProperty('PAYMENT_STATUS', value);

// 回款关联状态
export const getAssociateStatus = (value) => getEnumProperty('ASSOCIATE_STATUS', value);

// 订单开通状态
export const getOrderStatus = (value) => getEnumProperty('ORDER_STATUS', value);
// 增值服务状态
export const getAddOrderStatus = (value) => getEnumProperty('ADD_ORDER_STATUS', value);
// 业务状态（业务开通列表）
export const getOrderStatusBusi = (value) => getEnumProperty('ORDER_STATUS_BUSI', value);

// 线索状态
export const getClewStatus = (value) => getEnumProperty('CLEW_STATUS', value);

// 机会状态
export const getChanceStatus = (value) => getEnumProperty('CHANCE_STATUS', value);

// 付款帐号（不带帐号信息）
export const getPaymentAccountBase = (value) => getEnumProperty('PAYMENT_ACCOUNT', value);

// 付款帐号
export const getPaymentAccount = (value) => {
  const {label = '', account} = _.isPlainObject(value) ? value : (_.find(enums('PAYMENT_ACCOUNT'), {value}) || {});
  return `${label}${account ? ` (${account})` : ''}`;
};
// 转换单位
export const convertUnit = (time) => {
  return time && ((time >= 12 && time % 12 === 0) ? `${time / 12}` : `${time}`);
}
// 获取拼接后的显示帐号
export const getMergerUserName = (name, username) => {
  if (name && username) {
    return `${name} ( ${username} )`;
  } else if (!username) {
    return name;
  } else {
    return username;
  }
};
export const checkParames = (obj) => {
  const values = _.values(obj);
  console.info('query', values);
  if (values.includes('') || values.includes(undefined)) {
    return false
  }
  return true
};

// 支付方式
export const getPaymentMode = (value) => getEnumProperty('PAYMENT_MODE', value);

// 带有帐号信息的列表数据
export const getPaymentModesWithAccount = (options = enums('PAYMENT_MODE')) => {
  return options.map(option => {
    const {label, account, children} = option;
    if (account) option = {...option, label: `${label} (${account})`};
    if (children) option = {...option, children: getPaymentModesWithAccount(children)};
    return option;
  });
};

// 格式化地区
export const getRegionMergerName = (value) => value.indexOf(',') !== -1 ? _.drop(value.split(',')).map(v => v).join(' / ') : value;

// 时间格式化
export const getDate = (value) => dateFormat(value);

// 百分比格式化
export const getPercent = (value) => percent(value);

// 文件大小格式化
export const getBytes = (value) => bytes(value);

// 电话
export const getCall = (value) => value ? <Call>{value}</Call> : null;

// QQ
export const getQQ = (value) => value;

// 微信
export const getWeChat = (value) => value;

// 邮箱
export const getEmail = (value) => <Email>{value}</Email>;

// 根据URL打开下载链接
export const download = (url) => () => window.open(url);

// 审批类型
export const getProcessType = (value) => getEnumProperty('PROCESS_TYPE', value);

// 审批状态
export const getApproveStatus = (value) => getEnumProperty('APPROVE_STATUS', value);

// 联系类型
export const getLinkType = (value) => getEnumProperty('LINK_TYPE', value);

//联系人状态
export const getLinkStatus = (value) => getEnumProperty('LINK_STATUS', value);

// 线索类型
export const getClewType = (value) => getEnumProperty('CLEW_TYPE', value);

// 客户类型
export const getCustomerType = (value) => getEnumProperty('CUSTOMER_TYPE', value);

// 业务类型
export const getBusinessStatus = (value) => getEnumProperty('BUSINESS_STATUS', value);

// 回款状态
export const getBackpayStatus = (value) => getEnumProperty('RECEIPT_STATUS', value);

// 付款条件
export const getPayCondition = (value) => getEnumProperty('PAY_CONDITION', value);

// 关联类型
export const getRelType = (value) => getEnumProperty('REL_TYPE', value);

// 开票类型
export const getInvoiceType = (value) => getEnumProperty('INVOICE_TYPE', value);

// 业务关联状态
export const getRelStatus = (value) => getEnumProperty('REL_STATUS', value);

// 开票状态
export const getInvoiceState = (value) => getEnumProperty('INVOICE_STATE', value);

// 关联客户
export const getAssociateCustomer = (value) => getEnumProperty('ASSOCIATE_CUSTOMER', value);

// 计价单位
export const getChargeUnit = (value) => getEnumProperty('CHARGE_UNIT', value) || '';

//机会日志类型
export const getChanceOpType = (value) => getEnumProperty('CHANCE_OPTYPE', value);
// 软件版本
export const getVersionsType = (value) => getEnumProperty('VERSIONS', value);

//浮点数加法
export const accAdd = (arg1, arg2) => {
  let r1, r2, m;
  const {Math} = window;
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  m = Math.pow(10, Math.max(r1, r2));
  return (arg1 * m + arg2 * m) / m;
};

//浮点数乘法
export const accMul  = (arg1, arg2) => {
  let m = 0, s1 = arg1.toString(),
    s2 = arg2.toString();
  try {
    m += s1.split('.')[1].length
  } catch (e) {

  }
  try {
    m += s2.split('.')[1].length
  } catch (e) {

  }
  return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
};
