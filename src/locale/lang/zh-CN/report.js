export default {
  workspace: {
    noPower: '暂无查看权限',
    templateColumns: {
      templateName: '业务流程名称',
      smallType: '所属类型',
      ticketCounts: '工单总数',
      waitAcceptCounts: '待接单工单',
      waitDoingCounts: '待处理工单',
      doneCounts: '已完结工单',
      abolishCounts: '废止工单',
      timeOutProcessCounts: '流程超时',
      timeOutProcessRate: '工单按时完工率',
      timeOutStepCounts: '步骤超时',
      timeOutStepRate: '步骤按时完工率',
      delayTicketCounts: '延期次数',
      transferTicketCounts: '转派次数',
      returnTicketCounts: '退回次数',
      hangUpTicketCounts: '挂起次数'
    },
    templateReport: '模板分析报表',

    goBack: '返回上级',
    ticketColumns: {
      date: '时间',
      addTicket: '工单总数',
      doneTicket: '已完结工单',
      closeTicket: '废止工单',
      timeoutTicket: '流程超时',
      timeoutStep: '步骤超时',
      delayTicket: '延期次数',
      assignTicket: '转派次数',
      returnTicket: '退回次数',
      hangTicket: '挂起次数'
    },
    ticketReport: '工单分析报表',

    username: '人员姓名',
    namePlaceholder: '请输入人员姓名',
    userColumns: {
      username: '人员姓名',
      phone: '联系方式',
      dealTicketCount: '处理工单总数',
      dealCount: '现场办理工单数',
      assistDealCount: '现场协办工单数',
      acceptTicketTime: '接单平均用时',
      dealTicketTime: '处理工单平均用时',
      arriveTime: '到达现场平均用时',
      timeOutStepCount: '步骤超时',
      timeOutStepRate: '步骤按时完工率',
      applyClosehCount: '废止次数',
      applyDelayCount: '延期次数',
      applyAssignCount: '转派次数',
      applyReturnCount: '退回次数',
      applyHangCount: '挂起次数',
      pressCount: '被催办次数'
    },
    userReport: '人员效率报表',

    reportColumns: {
      index: '序号',
      ticketName: '工单标题',
      ticketNo: '工单编号',
      helpStepName: '协办申请步骤',
      helpApplicant: '协办申请人',
      currentOperatorNames: '协办人',
      helpOperateTime: '协办时间',
      approver: '审批人',
      helpReason: '协办原因',

      closeStepName: '废止申请步骤',
      closeApplicant: '废止申请人',
      closeOperateTime: '废止时间',
      closeReason: '废止原因',

      returnStepName: '退回申请步骤',
      returnApplicant: '退回申请人',
      returnName: '退回至',
      returnUser: '退回后处理人',
      returnOperateTime: '退回时间',
      returnReason: '退回原因',

      hangStepName: '挂起申请步骤',
      hangApplicant: '挂起申请人',
      hangOperateTime: '挂起时间',
      endHangTime: '挂起结束时间',
      hangReason: '挂起原因',

      delayStepName: '延期申请步骤',
      agingTime: '步骤时限',
      addAging: '延期时长',
      delayApplicant: '延期申请人',
      stepDeadlineTime: '原截止时间',
      stepDelayTime: '延期至',
      delayReason: '延期原因',

      assignStepName: '转派申请步骤',
      assignApplicant: '转出人',
      assignOperateTime: '转派时间',
      assignTo: '转派给',
      assignReason: '转派原因',

      pressStepName: '催办申请步骤',
      pressApplicant: '催办人',
      pressOperateTime: '催办时间',
      pressReason: '催办原因',
      action: '操作'
    },

    titleColumns: {
      assist: '协办工单',
      close: '废止工单',
      delay: '延期工单',
      assign: '转派工单',
      hang: '挂起工单',
      return: '退回工单',
      press: '催办工单',
      dealTicketCount: '处理工单总数',
      dealCount: '现场办理工单数',
      assistDealCount: '现场协办工单数'
    },

    toDetail: '查看详情',
    hanging: '挂起中',

    doneTicket: '已完结工单',
    toArriveTicket: '待接单工单',
    todoTicket: '待处理工单',
    allTicket: '所有工单',
    ticketManage: '工单管理',

    timeoutStep: '超时步骤',
    timeoutColumns: {
      index: '序号',
      stepName: '步骤名称',
      title: '工单名称',
      ticketNo: '工单编号',
      outTime: '超时时长',
      handler: '处理人',
      stepAging: '步骤时限',
      action: '操作'
    }
  }
};
