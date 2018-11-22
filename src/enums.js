import React from 'react';
import {Tag} from 'antd';
import {Stars} from './components/Helpers';
import _ from 'lodash';

export const filters = (array, ...conditions) => {
  const items = [];
  _.forEach(_.flattenDeep(conditions), (condition) => {
    items.push.apply(items, _.filter(array, condition));
  });
  return items;
};

export const fromValues = (values = [], key = 'value') => {
  return values.map(value => ({[key]: value}));
};

export const PRODUCT_LINE = [
  {value: 1, label: '新零售'},
  {value: 2, label: '到店'},
];

export const GENDER = [
  {value: 1, label: '男'},
  {value: 2, label: '女'},
];

export const PRODUCT_TYPE = [
  {value: 1, label: '软件产品'},
  {value: 2, label: '硬件产品'},
  {value: 3, label: '增值服务'},
];

export const CUSTOMER_SEARCH_FIELD = [
  {value: 'customerName', label: '客户名称'},
  {value: 'mobile', label: '电话号码'},
  {value: 'linkName', label: '联系人'},
  {value: 'wechat', label: '微信'},
  {value: 'qq', label: 'QQ'},
  {value: 'email', label: '邮箱'},
  {value: 'shopName', label: '商户名'},
];

export const PAYMENT_ACCOUNT = [
  {value: 1, label: '微盟银行', account: '********3536'},
  {value: 2, label: '盟耀银行', account: '********0147'},
  {value: 3, label: '微盟支付宝', account: 'weimob_wm01@126.com'},
  {value: 4, label: '盟耀支付宝', account: 'weimob_my@163.com'},
  {value: 5, label: '微盟现金'},
  {value: 6, label: '盟耀现金'},
];

export const PAYMENT_MODE = [
  {value: 1, label: '银行转账', children: filters(PAYMENT_ACCOUNT, fromValues([1, 2]))},
  {value: 2, label: '支票', children: filters(PAYMENT_ACCOUNT, fromValues([1, 2]))},
  {value: 3, label: 'POS机', children: filters(PAYMENT_ACCOUNT, fromValues([1, 2]))},
  {value: 4, label: '承兑汇票', children: filters(PAYMENT_ACCOUNT, fromValues([1, 2]))},
  {value: 5, label: '支付宝', children: filters(PAYMENT_ACCOUNT, fromValues([3, 4]))},
  {value: 6, label: '现金', children: filters(PAYMENT_ACCOUNT, fromValues([5, 6]))},
];

export const PAYMENT_STATUS = [
  {value: 1, label: '正常支付'},
  {value: 2, label: '逾期未付'},
];

export const PAID_STATUS = [
  {value: 0, label: '未回款'},
  {value: 1, label: '部分回款'},
  {value: 2, label: '回款完毕'},
];

export const ASSOCIATE_STATUS = [
  {value: 0, label: '未关联回款'},
  {value: 1, label: '已关联回款'},
];

export const CONTRACT_STATUS = [
  {value: 0, label: '正常'},
  {value: 1, label: '作废'},
];

export const CONTRACT_TYPE = [
  {value: 0, label: '非标准合同'},
  {value: 1, label: '标准合同'},
];
// 版本
export const VERSIONS = [
  {value: 1, label: '标准版'},
  {value: 2, label: '高级版'},
  {value: 3, label: '豪华版'},
  {value: 4, label: '至尊版'},
]

export const CLEW_STATUS = [
  {value: -1, label: '废弃'},
  {value: 0, label: '初始导入'},
  {value: 1, label: '待审核'},
  {value: 2, label: '已进入公海'},
];

export const CHANCE_STATUS = [
  {value: 1, label: 'OS公海'},
  {value: 2, label: 'IS私海'},
  {value: 3, label: '申领库'},
  {value: 4, label: '转客保'},
];

export const ORDER_STATUS = [
  {value: 0, label: '创建'},
  {value: 1, label: '软件开通'},
  {value: 2, label: '开通审核中'},
  {value: 3, label: '服务待开通'},
  {value: 4, label: '服务已开通'},
  {value: 5, label: '服务过期'},
  {value: 6, label: '已作废'},
  {value: 7, label: '硬件已完成'},
];

export const ADD_ORDER_STATUS = [
  {value: 0, label: '创建'},
  {value: 4, label: '已开通'},
  {value: 5, label: '已过期'},
];

export const ORDER_STATUS_BUSI = [
  {value: 3, label: '服务待开通'},
  {value: 4, label: '服务已开通'},
  {value: 5, label: '服务过期'},
  {value: 6, label: '已作废'},
];

export const BUSINESS_TYPE = [
  {value: 0, label: '新开业务'},
  {value: 1, label: '续费业务'},
  {value: 2, label: '升级版本'},
  {value: 3, label: '增加门店'},
  {value: 4, label: '增加微信墙'},
];

export const MIEN_POSITION = [
  {value: 1, label: '登录页展示'},
  {value: 2, label: '首页展示'},
  {value: 3, label: '全部展示'},
];

export const JOB_STATUS = [
  {value: 0, label: '在职', tag: <Tag color="green" className="no-events">在职</Tag>},
  {value: 1, label: '离职', tag: <Tag className="text-gray no-events">离职</Tag>},
];

export const LEADER_TYPE = [
  {value: 1, label: '是'},
  {value: 0, label: '否'},
];

export const CUSTOMER_STATUS = [
  {value: 1, label: '活跃客户', tag: <Tag color="green" className="no-events">活跃</Tag>},
  {value: 2, label: '休眠客户', tag: <Tag className="text-gray no-events">休眠</Tag>},
];

export const CUSTOMER_LEVEL = [
  {value: 1, label: <Stars count={1}/>},
  {value: 2, label: <Stars count={2}/>},
  {value: 3, label: <Stars count={3}/>},
  {value: 4, label: <Stars count={4}/>},
  {value: 5, label: <Stars count={5}/>},
];

export const CALL_CENTER_SEAT_TYPE = [
  {value: 0, label: '普通座席'},
  {value: 1, label: '班长座席'},
];

export const CALL_CENTER_DEVICE_STATUS = [
  {value: 'idle', label: '空闲', badge: 'success'},
  {value: 'ringing', label: '响铃', badge: 'processing'},
  {value: 'busy', label: '通话', badge: 'error'},
];

export const CALL_CENTER_STAFF_STATUS = [
  {value: 'online', label: '空闲', badge: 'success'},
  {value: 'offline', label: '离线', badge: 'default'},
  {value: 'ring', label: '响铃', badge: 'processing'},
  {value: 'busy', label: '通话', badge: 'warning'},
  {value: 'neaten', label: '整理', badge: 'warning'},
  {value: 'pause', label: '置忙', badge: 'error'},
];

export const CALL_CENTER_STRATEGY = [
  {value: 'order', label: '顺序'},
  {value: 'rrmemory', label: '轮选'},
  {value: 'fewestcalls', label: '平均'},
  {value: 'random', label: '随机'},
  {value: 'skill', label: '技能优先'},
  {value: 'leastrecent', label: '最长空闲时间'},
  {value: 'ringall', label: '自动分配'},
];

export const CALL_CENTER = {
  SEAT_TYPE: CALL_CENTER_SEAT_TYPE,
  DEVICE_STATUS: CALL_CENTER_DEVICE_STATUS,
  STAFF_STATUS: CALL_CENTER_STAFF_STATUS,
  STRATEGY: CALL_CENTER_STRATEGY,
};

export const LOG_TYPE = [
  {value: 0, label: '未知'},
  {value: 1, label: '创建'},
  {value: 2, label: '分配'},
  {value: 3, label: '呼叫'},
  {value: 4, label: '清洗'},
  {value: 5, label: '转出'},
  {value: 6, label: '审核'},
  {value: 7, label: '申请审核'},
];

export const LINK_TYPE = [
  {value: 0, label: '未知'},
  {value: 1, label: '主决策人'},
  {value: 2, label: '其他'},
];

export const MANAGE_STATUS = [
  {value: 0, label: '初始化'},
  {value: 1, label: '开启'},
  {value: -1, label: '关闭'},
];

export const CUSTOMER_TYPE = [
  {value: 0, label: '未知'},
  {value: 1, label: '个人商户'},
  {value: 2, label: '公司'},
  {value: 3, label: '外资公司'},
  {value: 4, label: '连锁店'},
];
// Business
export const BUSINESS_STATUS = [
  {value: 0, label: '新开业务'},
  {value: 1, label: '升级系列'},
  {value: 2, label: '升级版本'},
  {value: 3, label: '增加门店'},
  {value: 4, label: '增加微信墙'},
  {value: 5, label: '升级续费'},
  {value: 6, label: '降级续费'},
  {value: 7, label: '正常续费'},
];

export const RECEIPT_STATUS = [
  {value: -2, label: '待提单'},
  {value: -1, label: '提单审核中'},
  {value: 0, label: '未回款'},
  {value: 1, label: '部分回款'},
  {value: 2, label: '回款完毕'},
];

export const PAY_CONDITION = [
  {value: 'full', label: '全额'},
  {value: 'part', label: '分期'},
];

export const INVOICE_TYPE = [
  {value: 0, label: '增值税普通发票'},
  {value: 1, label: '增值税专用发票'},
];

export const PROCESS_TYPE = [
  {value: 1, label: '线索清洗审批'},
  {value: 2, label: 'IS派单审批'},
  {value: 3, label: 'OS驳回审批'},
  {value: 4, label: '提前开票审批'},
  {value: 5, label: '担保开通审批'},
  {value: 6, label: '提单审批'},
];

export const APPROVE_STATUS = [
  {value: 0, label: '审批通过'},
  {value: 1, label: '驳回'},
  {value: 2, label: '审批中'},
  {value: -1, label: '废弃'},
];

export const REL_STATUS = [
  {value: 0, label: '未关联业务'},
  {value: 1, label: '部分关联业务'},
  {value: 2, label: '关联业务'},
];

export const INVOICE_STATE = [
  {value: 0, label: '未开票'},
  {value: 1, label: '已开票'},
  {value: 2, label: '审核中'},
  {value: 3, label: '已作废'},
];

export const REL_TYPE = [
  {value: 0, label: '先关联业务'},
  {value: 1, label: '后关联业务'},
];

export const LINK_STATUS = [
  {value: 0, label: '有效'},
  {value: 1, label: '无效'},
];

export const CLEW_TYPE = [
  {value: 1, label: '新零售'},
  {value: 2, label: '到店'},
  {value: 3, label: '渠道加盟'},
  {value: 4, label: '定制开发'},
];

export const ASSOCIATE_CUSTOMER = [
  {value: 0, label: '未关联'},
  {value: 1, label: '已关联'},
];

export const CHARGE_MODE = [
  {value: 1, label: '按期限计费'},
  {value: 2, label: '按数量计费'},
];

export const CHARGE_UNIT = [
  {value: 1, label: '个'},
  {value: 2, label: '次'},
  {value: 3, label: '年'},
  {value: 4, label: '月'},
];

export const FUNNEL_GRADE = [
  {value: 1, label: '甲'},
  {value: 2, label: '乙'},
  {value: 3, label: '丙'},
  {value: 4, label: '丁'},
  {value: 5, label: '戊'},
];

export const CHANCE_OPTYPE = [
  {value: 0, label: '未知'},
  {value: 1, label: '机会创建'},
  {value: 2, label: '机会分配'},
  {value: 3, label: '申领至申领库'},
  {value: 4, label: '申领至客保'},
  {value: 5, label: '超时转出公海'},
  {value: 6, label: '放弃'},
  {value: 7, label: '呼叫'},
  {value: 8, label: '清洗|编辑'},
  {value: 9, label: '添加联系记录'},
  {value: 10, label: '提单'},
  {value: 11, label: '审核结果'},
];

export default {
  PRODUCT_LINE,
  GENDER,
  PRODUCT_TYPE,
  CUSTOMER_SEARCH_FIELD,
  PAYMENT_ACCOUNT,
  PAYMENT_MODE,
  PAYMENT_STATUS,
  PAID_STATUS,
  ASSOCIATE_STATUS,
  CONTRACT_STATUS,
  CONTRACT_TYPE,
  CLEW_STATUS,
  CHANCE_STATUS,
  ORDER_STATUS,
  ORDER_STATUS_BUSI,
  ADD_ORDER_STATUS,
  BUSINESS_TYPE,
  MIEN_POSITION,
  JOB_STATUS,
  LEADER_TYPE,
  CUSTOMER_STATUS,
  CUSTOMER_LEVEL,
  CALL_CENTER,
  LOG_TYPE,
  LINK_TYPE,
  MANAGE_STATUS,
  CUSTOMER_TYPE,
  BUSINESS_STATUS,
  RECEIPT_STATUS,
  PAY_CONDITION,
  INVOICE_TYPE,
  PROCESS_TYPE,
  APPROVE_STATUS,
  REL_STATUS,
  INVOICE_STATE,
  REL_TYPE,
  LINK_STATUS,
  CLEW_TYPE,
  ASSOCIATE_CUSTOMER,
  CHARGE_UNIT,
  FUNNEL_GRADE,
  CHANCE_OPTYPE,
  VERSIONS
};
