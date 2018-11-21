import request from '../utils/request';

//回款管理
export async function queryRepayList(params) {
  if (params === '') {
    return request('/api/payment');
  } else {
    return request(`/api/payment${params}`);
  }
}

export async function deleteRepay(param) {
  return request(`api/payment/${param}`, {
    method: 'DELETE'
  });
}

export async function addRepay(params) {
  return request('/api/payment', {
    method: 'POST',
    body: params
  });
}

export async function editRepay(param) {
  return request(`api/payment/${param}`);
}

export async function saveEdit(params) {
  return request(`api/payment/${params.id}`, {
    method: 'PUT',
    body: delete params.id && params
  });
}

export async function linkBusiness(param) {
  return request(`api/payment/rel_business/${param}`);
}

export async function saveLinkBusi(params) {
  return request(`api/payment/biz_add/${params.id}`, {
    method: 'PUT',
    body: delete params.id && params
  });
}

export async function repayCancelLink(param) {
  return request(`api/payment/un_rel/${param}`, {
    method: 'DELETE'
  });
}

//发票管理
export async function deleteInvoice(param) {
  return request(`api/invoice/cannel_invoice/${param}`, {
    method: 'PUT'
  });
}

export async function queryInvoiceList(params) {
  if (params === '') {
    return request('/api/invoice/list');
  } else {
    return request(`/api/invoice/list?${params}`);
  }
}

export async function giveInvoice(params) {
  return request(`/api/invoice/${params.id}/make_invoice`, {
    method: 'PUT',
    body: delete params.id && params
  });
}

export async function invoiceLinkBusi(param) {
  return request(`/api/invoice/${param}/order_list`);
}

export async function invoiceCancelLink(param) {
  return request(`/api/invoice/cannel/${param}`, {
    method: 'PUT'
  });
}

export async function invoiceSaveLinkBusi(params) {
  return request(`/api/invoice/rel_business_save/${params.id}`, {
    method: 'PUT',
    body: delete params.id && params
  });
}

export async function queryDetail(param) {
  return request(`/api/invoice/${param}`);
}

//业务开通申请
export async function openService(param) {
  return request(`/api/business/${param}/establish`, {
    method: 'PUT'
  });
}

// export async function deleteService(param) {
//   return request("/api/business/" + param + "/cannel", {
//     method: "PUT"
//   });
// }

export async function queryBusiOpenList(params) {
  if (params === '') {
    return request('/api/busniess/list');
  } else {
    return request(`/api/busniess/list?${params}`);
  }
}

export async function cancelLink(param) {
  return request(`/api/invoice/cancel/${param}`, {
    method: 'PUT'
  });
}
