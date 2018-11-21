import request from '../utils/request';

export async function publicClewsSearch(params) { //请求数据
  console.log(params)
  return request('/api/sources/clews', {
    method: 'GET',
    query: params,
  });
}


export async function publicClientSearch(params) {
  return request('/api/sources/customers', {
    method: 'GET',
    query: params,
  });
}
export async function publicChancesSearch(params) {
  return request('/api/sources/chances', {
    method: 'GET',
    query: params,
  });
}
export async function clewsUrgent(id) {
  return request(`/api/clews/${id}/urgent`, {
    method: 'GET',
  });
}
export async function changesUrgent(id) {
  console.log(id,3333);
  return request(`/api/chances/${id}/urgent`, {
    method: 'GET',
  });
}

export async function clientSearch(params) { //业务客户列表数据

  return request('/api/customer/search', {
    method: 'GET',
    body: params,
  });
}

export async function judgeOrderList(params){  //新建判单
  return request('/api/judgeOrders/orders', {
    method: 'GET',
    body: params,
  });
}
export async function judgeFavoree(params){  //受益人联想查询
  return request('/api/judgeOrders/users', {
    method: 'GET',
    query: params,
  });
}
export async function isJudge(params){  //判单
  return request('/api/judgeOrders', {
    method: 'POST',
    body: params,
  });
}

export async function historyJudgeOrder(params){ //历史判单
  return request('/api/judgeOrders', {
    method: 'GET',
    body: params,
  });
}
export async function contractsMag(params){ //合同管理列表
  return request('/api/contracts/list', {
    method: 'GET',
    body: params,
  });
}
export async function contractsMagLink(id){ //合同管理列表关联业务
  return request(`/api/contracts/${id}/orderItems`);
}

export async function contractBasicInfo(id){ //合同详情基本数据
  return request(`/api/contracts/${id}`);
}

export async function contractPayInfo(id){ //合同详情付款信息
  return request(`/api/contracts/${id}/payModes`);
}
export async function contractAccessory(id){ //合同详情详附件信息
  return request(`/api/contracts/${id}/attachments`);
}
export async function contractsIsDelete(id){ //合同作废
  return request(`/api/contracts/${id}`, {
    method:"delete"
  });
}
export async function fundApplyList(){ //认款申请列表
  return request(`/api/claimPayments`)
}
export async function fundApplyDetails(id){
  return request(`/api/applyPays/${id}`)
}
export async function backMoneyList(){ //回款列表
  return request(`/api/claimPayments/backPayments`)
}
export async function relateBackMoney(id){
  return request(`/api/claimPayments/${id}`)
}
export async function cancleBackMoney(id){ //确定取消关联回款
  return request(`/api/claimPayments/${id}`)
}






