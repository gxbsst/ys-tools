export const clew = {
  clean(can, clewInfo) {
    return true
    && can(clewInfo.handlerNo) //当前处理人
    && [2, 5].includes(clewInfo.clewStatus) //待清洗状态
    && can([3001003, 4001005, 4002003, 5005001, 5006001]) //待清洗tab权限
    // &&
    // (
    //   (clewInfo.clewStatus === 2 && can(3001003)) || //售前清洗
    //   (
    //     clewInfo.clewStatus === 5 && //直销待清洗
    //     (
    //       (clewInfo.fromSource === 2 && (
    //         (clewInfo.clewBizType === 1 && can(5005002)) || //到店常规清洗
    //         (clewInfo.clewBizType === 2 && can(5005002)) //到店订单清洗
    //       )) || //到店清洗
    //       (clewInfo.fromSource === 1 && ( //新零售清洗
    //         (clewInfo.clewBizType === 2 && can(4001005)) || //新零售常规清洗
    //         (clewInfo.clewBizType === 1 && can(4002003)) //新零售订单清洗
    //       ))
    //     )
    //   )
    // )
  },
  activate(can, clewInfo) { //激活
    return true
    && [3, 8].includes(clewInfo.clewStatus) //已废弃
    && can([3001001, 4001001, 4002001, 5005001, 5006001]) //售前主管\新零售线索负责人|订单组领导|到店领导 -- 依据完整线索库权限
    && ( //TODO@human: 到店常规线索库tab包含申领操作，所以权限不一致
      (can([3001001]) && clewInfo.clewStatus == 3) || //售前已废弃|售前主管
      (clewInfo.clewStatus == 8 && (
        (can([4001001]) && clewInfo.fromSource == 1 && clewInfo.clewBizType == 2) || //新零售常规组 已废弃|线索负责人
        (can([4002001]) && clewInfo.fromSource == 1 && clewInfo.clewBizType == 1) || //新零售订单组 已废弃|订单组主管
        (can([5005001]) && clewInfo.fromSource == 2 && clewInfo.clewBizType == 1) || //到店 已废弃|到店主管
        (can([5006001]) && clewInfo.fromSource == 2 && clewInfo.clewBizType == 2) //到店 已废弃|到店主管
      ))
    )
  },
  abandon(can, clewInfo) { //废弃
    return true
    && [2, 5].includes(clewInfo.clewStatus) //待清洗
    && !(clewInfo.fromSource == 1 && clewInfo.clewBizType == 2) //非新零售常规组
    && can([3001003, 4002003, 5005002, 5006002], clewInfo.handlerNo) //售前客服|新零售订单组|到店 清洗权限 & 当前处理人
  },
  arraign(can, clewInfo) { //提审
    return true &&
      clewInfo.clewStatus == 5 && //直销待清洗
      clewInfo.fromSource == 1 && //新零售
      clewInfo.clewBizType == 2 && //常规组
      can([4001005], clewInfo.handlerNo) //新零售常规组清洗权限 & 当前处理人
  },
  rolloutPre(can, clewInfo) { //售前转出
    return true &&
      clewInfo.clewStatus == 2 && //售前待清洗
      can([3001003], clewInfo.handlerNo) //售前清洗权限 & 当前处理人
  },
  rolloutSale(can, clewInfo) { //直销转出
    return true &&
      clewInfo.clewStatus == 5 && //直销待清洗
      !(clewInfo.fromSource == 1 && clewInfo.clewBizType == 2) && //非新零售常规组
      can([4002003, 5005002, 5006002], clewInfo.handlerNo) //新零售订单组|到店 清洗权限 & 当前处理人
  },
}
