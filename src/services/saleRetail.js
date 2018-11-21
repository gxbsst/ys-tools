import { stringify } from 'qs';
import request from '../utils/request';

export async function queryHighSeaList(data) { // 获取公海列表
  return request(`/api/chances?${stringify(data)}`);
}
export async function querySelectOptions(data) { // 获取选项数据
  const { type, ...params } = data;
  switch (type) {
    // 漏斗等级
    case 'levels':
      return request('/api/chances/levels');
    // 跟进记录联系人
    case 'followRecordsContacts': {
      const { id } = params;
      return request(`/api/chances/${id}/link`);
    }
    // 分配联系人
    case 'allotPerson': {
      const { id } = params;
      return request('/api/personnel/employee/subordinate');
    }
    case 'product': {
      const { id } = params;
      return request(`/api/directory/${id}/product`);
    }
    // 驳回理由
    case 'rejectReason':
      return { code: 0, data: [{ value: '信息虚假', label: '信息虚假' }, { value: '信息不完整', label: '信息不完整' }, { value: '意向不成熟', label: '意向不成熟' }] };
    // 筛选状态
    case 'status':
      return { code: 0, data: [{ value: 0, label: '待清洗' }, { value: 1, label: '待审核' }, { value: 2, label: '已废弃' }] };
    default:
      return { code: -1, message: '无此选项数据' };
  }
}
export async function applyChance(data) { // 申领机会
  const { id, ...params } = data;
  return request(`/api/chances/batchApply`, {
    method: 'POST',
    body: data,
  });
}
export async function batchAllocation(data) { // 分配机会
  const { id, ...params } = data;
  return request(`/api/chances/batchAllocation`, {
    method: 'POST',
    body: data,
  });
}

export async function rejectChance(data) { // 驳回机会
  const { id, ...params } = data;
  return request(`/api/chances/reject`, {
    method: 'PUT',
    body: data,
  });
}
export async function addFollowRecord(data) { // 新加跟进记录(编辑)
  const { chanceId, ...params } = data;
  return request(`/api/chances/${chanceId}/follow`, {
    method: 'POST',
    body: params,
  });
}
export async function addContactRecord(data) { // 新加联系记录
  const { id, ...params } = data;
  return request(`/api/chances/${id}/linkLog`, {
    method: 'POST',
    body: params,
  });
}
export async function addVisitRecord(data) { // 新加拜访记录
  const { id, ...params } = data;
  return request(`/api/chances/${id}/visitLog`, {
    method: 'POST',
    body: params,
  });
}

export async function queryChanceDetail(data) { // 获取基本信息,机会详情
  return request(`/api/chances/${data.id}`);
}
export async function queryContactsInfo(data) { // 获取联系人信息,机会详情
  return request(`/api/chances/${data.id}/link`);
}
export async function queryStoresInfo(data) { // 获取门店信息,机会详情
  return request(`/api/chances/${data.id}/stores`);
}
export async function queryIntentionInfo(data) { // 获取意向信息,机会详情
  return request(`/api/chances/${data.id}/intention`);
}

export async function queryRecordsList(data) { // 获取日志
  const { tab, id, ...params } = data;
  switch (tab) {
    case 'contactRecords': // 联系记录
      return request(`/api/chances/${id}/linkLog?${stringify(params)}`);
    case 'chanceRecords': // 机会日志
      return request(`/api/chances/${id}/logs?${stringify(params)}`);
    case 'linkRecords': // 线索日志
      return request(`/api/chances/${id}/clewLogs?${stringify(params)}`);
    case 'followRecords': // 跟进记录
      return request(`/api/chances/${id}/follow?${stringify(params)}`);
    case 'visitRecords': // 拜访记录
      return request(`/api/chances/${id}/visitLog?${stringify(params)}`);
    case 'pushOrderRecords': // 提单记录
      return request(`/api/billingReceipts/chanceBillingList/${id}?${stringify(params)}`);
    default: return { code: -1, message: '无此日志' };
  }
}
export async function queryMyRelativeBusiness(data) {
  return request(`/api/billingReceipts/billingMain/${data.id}/1`);
}
export async function queryContractsPayModes(data) {
  return request(`/api/contracts/${data.id}/payModes`);
}
export async function queryContractsOrderItems(data) {
  return request(`/api/contracts/orderItems?${stringify(data)}`);
}
export async function queryContractsBasic(data) {
  return request(`/api/contracts/findContractMsg?${stringify(data)}`);
}
export async function queryContractsAttachments(data) {
  return request(`/api/contracts/${data.id}/attachments`);
}
export async function queryPushOrderDetail(data) { // 获取提单信息
  return request(`/api/processes/bill/${data.id}`);
}
export async function editChanceDetail(data) { // 编辑机会信息
  return request('/api/chances/save', {
    method: 'POST',
    body: data,
  });
}
export async function pushOrderConfirmBasic(data) { // 确认提单
  return request('/api/billingReceipts/billingUninOrder', {
    method: 'POST',
    body: data,
  });
}
export async function pushOrderIntentionConfirm(data) { // 确认提单意向
  const { chanceID, ...params } = data;
  return request(`/api/chances/${chanceID}/intention`, {
    method: 'POST',
    body: params,
  });
}

export async function removePushOrder(data) { // 删除提单
  return request('/orders/remove', {
    method: 'POST',
    body: data,
  });
}
export async function pushPushOrder(data) { // 提审提单
  return request('/orders/push', {
    method: 'POST',
    body: data,
  });
}

export async function abandonChance(data) { // 放弃机会
  const { id, ...params } = data;
  return request(`/api/chances/${id}/abandon`, {
    method: 'PUT',
    body: params,
  });
}
export async function queryPrivateSeaList(data) { // 获取私海数据
  return request(`/api/chances/privates?${stringify(data)}`);
}

export async function queryWaitAudit(data) { // 获取私海待审核
  return request(`/api/chances/privates/waitAudit?${stringify(data)}`);
}

export async function queryOSWaitAudit(data) { // 获取到店，OS私海待审核
  return request(`/api/chances/privates/billing/waitAudit?${stringify(data)}`);
}

export async function approval(data) { // 审批操作
  const { id, ...params } = data;
  return request(`/api/processes/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function queryCustomersList(data) { // 获取客户列表
  return request(`/api/customer/customers?${stringify(data)}`);
}

export async function addBusiness(data) { // 新开业务
  return request('/api/business/add', {
    method: 'POST',
    body: data,
  });
}

export async function queryPrivateSeaConfig(data) { //私海配置
  const {fromSource, type} = data;
  return request(`/api/basic/privateSea/${fromSource}/${type}`);
}
