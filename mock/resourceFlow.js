const editResourceFlow = {
  code: 0,
  message: '编辑成功',
}
const getNewRetailFlow = {
  code: 0,
  data: {
    privateTime: 1,
    privateNum: 1,

    isApplyValidTime: 2,
    isApplyNum: 4,
    isOwnValidTime: 8,
    isOwnNum: 16,
    leaderApplyValidTime: 32,
    leaderApplyNum: 16,
    ISToOSTime: 8,

    osPrivateValidTime: 4,
    osPrivateNum: 2,
    type: 1,
  },
  message: "操作成功",
}

const getArrivalFlow = {
  code: 0,
  data: {
    privateTime: 1,
    privateNum: 2,

    osPrivateValidTime: 3,
    osPrivateNum: 2,
    ISToOSTime: 1,
    type: 2,
  },
  message: "操作成功",
}

export default {
  getNewRetailFlow,
  getArrivalFlow,
  editResourceFlow,
};
