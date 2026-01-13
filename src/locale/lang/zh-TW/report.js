export default {
  workspace: {
    noPower: '暫無查看權限',
    templateColumns: {
      templateName: '業務流程名稱',
      smallType: '所屬類型',
      ticketCounts: '工單總數',
      waitAcceptCounts: '待接單工單',
      waitDoingCounts: '待處理工單',
      doneCounts: '已完結工單',
      abolishCounts: '廢止工單',
      timeOutProcessCounts: '流程超時',
      timeOutProcessRate: '工單按時完工率',
      timeOutStepCounts: '步驟超時',
      timeOutStepRate: '步驟按時完工率',
      delayTicketCounts: '延期次數',
      transferTicketCounts: '轉派次數',
      returnTicketCounts: '退回次數',
      hangUpTicketCounts: '掛起次數'
    },
    templateReport: '模板分析報表',

    goBack: '返回上級',
    ticketColumns: {
      date: '時間',
      addTicket: '工單總數',
      doneTicket: '已完結工單',
      closeTicket: '廢止工單',
      timeoutTicket: '流程超時',
      timeoutStep: '步驟超時',
      delayTicket: '延期次數',
      assignTicket: '轉派次數',
      returnTicket: '退回次數',
      hangTicket: '掛起次數'
    },
    ticketReport: '工單分析報表',

    username: '人員姓名',
    namePlaceholder: '請輸入人員姓名',
    userColumns: {
      username: '人員姓名',
      phone: '聯繫方式',
      dealTicketCount: '處理工單總數',
      dealCount: '現場辦理工單數',
      assistDealCount: '現場協辦工單數',
      acceptTicketTime: '接單平均用時',
      dealTicketTime: '處理工單平均用時',
      arriveTime: '到達現場平均用時',
      timeOutStepCount: '步驟超時',
      timeOutStepRate: '步驟按時完工率',
      applyClosehCount: '廢止次數',
      applyDelayCount: '延期次數',
      applyAssignCount: '轉派次數',
      applyReturnCount: '退回次數',
      applyHangCount: '掛起次數',
      pressCount: '被催辦次數'
    },
    userReport: '人員效率報表',

    reportColumns: {
      index: '序號',
      ticketName: '工單標題',
      ticketNo: '工單編號',
      helpStepName: '協辦申請步驟',
      helpApplicant: '協辦申請人',
      currentOperatorNames: '協辦人',
      helpOperateTime: '協辦時間',
      approver: '審批人',
      helpReason: '協辦原因',

      closeStepName: '廢止申請步驟',
      closeApplicant: '廢止申請人',
      closeOperateTime: '廢止時間',
      closeReason: '廢止原因',

      returnStepName: '退回申請步驟',
      returnApplicant: '退回申請人',
      returnName: '退回至',
      returnUser: '退回後處理人',
      returnOperateTime: '退回時間',
      returnReason: '退回原因',

      hangStepName: '掛起申請步驟',
      hangApplicant: '掛起申請人',
      hangOperateTime: '掛起時間',
      endHangTime: '掛起結束時間',
      hangReason: '掛起原因',

      delayStepName: '延期申請步驟',
      agingTime: '步驟時限',
      addAging: '延期時長',
      delayApplicant: '延期申請人',
      stepDeadlineTime: '原截止時間',
      stepDelayTime: '延期至',
      delayReason: '延期原因',

      assignStepName: '轉派申請步驟',
      assignApplicant: '轉出人',
      assignOperateTime: '轉派時間',
      assignTo: '轉派給',
      assignReason: '轉派原因',

      pressStepName: '催辦申請步驟',
      pressApplicant: '催辦人',
      pressOperateTime: '催辦時間',
      pressReason: '催辦原因',
      action: '操作'
    },

    titleColumns: {
      assist: '協辦工單',
      close: '廢止工單',
      delay: '延期工單',
      assign: '轉派工單',
      hang: '掛起工單',
      return: '退回工單',
      press: '催辦工單',
      dealTicketCount: '處理工單總數',
      dealCount: '現場辦理工單數',
      assistDealCount: '現場協辦工單數'
    },

    toDetail: '查看詳情',
    hanging: '掛起中',

    doneTicket: '已完結工單',
    toArriveTicket: '待接單工單',
    todoTicket: '待處理工單',
    allTicket: '所有工單',
    ticketManage: '工單管理',

    timeoutStep: '超時步驟',
    timeoutColumns: {
      index: '序號',
      stepName: '步驟名稱',
      title: '工單名稱',
      ticketNo: '工單編號',
      outTime: '超時時長',
      handler: '處理人',
      stepAging: '步驟時限',
      action: '操作'
    }
  }
};
