export default {
  workspace: {
    noPower: 'No viewing permission',
    templateColumns: {
      templateName: 'Business Process Name',
      smallType: 'belonging type',
      ticketCounts: 'Total number of work orders',
      waitAcceptCounts: 'Pending work order',
      waitDoingCounts: 'Pending work order',
      doneCounts: 'Completed work order',
      abolishCounts: 'Abolish work order',
      timeOutProcessCounts: 'Process timeout',
      timeOutProcessRate: 'On-time completion rate of work orders',
      timeOutStepCounts: 'Step timeout',
      timeOutStepRate: 'Step completion rate on time',
      delayTicketCounts: 'Delay times',
      transferTicketCounts: 'Transfer times',
      returnTicketCounts: 'return times',
      hangUpTicketCounts: 'Hang up times'
    },
    templateReport: 'Template Analysis Report',

    goBack: 'Return to the superior',
    ticketColumns: {
      date: 'time',
      addTicket: 'Total number of work orders',
      doneTicket: 'Completed ticket',
      closeTicket: 'Abolish ticket',
      timeoutTicket: 'Process timeout',
      timeoutStep: 'Step timeout',
      delayTicket: 'Delay times',
      assignTicket: 'Number of transfers',
      returnTicket: 'return times',
      hangTicket: 'Hang up times'
    },
    ticketReport: 'Ticket Analysis Report',

    username: 'personal name',
    namePlaceholder: 'Please enter the name of the person',
    userColumns: {
      username: 'personal name',
      phone: 'Contact information',
      dealTicketCount: 'Total number of tickets processed',
      dealCount: 'Number of work orders handled on site',
      assistDealCount: 'Number of on-site assistance work orders',
      acceptTicketTime: 'Average order receiving time',
      dealTicketTime: 'Average time spent processing tickets',
      arriveTime: 'Average time to arrive at the scene',
      timeOutStepCount: 'Step timeout',
      timeOutStepRate: 'Step completion rate on time',
      applyClosehCount: 'Abolition times',
      applyDelayCount: 'Delay times',
      applyAssignCount: 'Assignment times',
      applyReturnCount: 'Return times',
      applyHangCount: 'Hang times',
      pressCount: 'The number of reminders'
    },
    userReport: 'Personnel Efficiency Report',

    reportColumns: {
      index: 'serial number',
      ticketName: 'Ticket Title',
      ticketNo: 'Ticket number',
      helpStepName: 'co-organization application steps',
      helpApplicant: 'Associate applicant',
      currentOperatorNames: 'co-organizer',
      helpOperateTime: 'co-organization time',
      approver: 'Approver',
      helpReason: 'Co-organization reason',

      closeStepName: 'Abolish application step',
      closeApplicant: 'Repeal the applicant',
      closeOperateTime: 'Repeal time',
      closeReason: 'Reason for closing',

      returnStepName: 'Return to the application step',
      returnApplicant: 'Return Applicant',
      returnName: 'Return to',
      returnUser: 'Processor after return',
      returnOperateTime: 'return time',
      returnReason: 'Return reason',

      hangStepName: 'hang application step',
      hangApplicant: 'hang applicant',
      hangOperateTime: 'Hang up time',
      endHangTime: 'Hang up end time',
      hangReason: 'Hang up reason',

      delayStepName: 'delay application step',
      agingTime: 'step time limit',
      addAging: 'Delay duration',
      delayApplicant: 'Delay Applicant',
      stepDeadlineTime: 'Original deadline',
      stepDelayTime: 'Delay to',
      delayReason: 'delay reason',

      assignStepName: 'Assignment application step',
      assignApplicant: 'Transfer-out person',
      assignOperateTime: 'Assign Time',
      assignTo: 'assigned to',
      assignReason: 'Assignment reason',

      pressStepName: 'Reminder application step',
      pressApplicant: 'reminder',
      pressOperateTime: 'Reminder time',
      pressReason: 'Reason for reminder',
      action: 'operation'
    },

    titleColumns: {
      assist: 'Assist work order',
      close: 'Abolish work order',
      delay: 'Delay work order',
      assign: 'Assign Work Order',
      hang: 'Hang up work order',
      return: 'Return work order',
      press: 'Remind work order',
      dealTicketCount: 'Total number of tickets processed',
      dealCount: 'Number of work orders handled on site',
      assistDealCount: 'Number of on-site assistance deals'
    },

    toDetail: 'View Details',
    hanging: 'hanging',

    doneTicket: 'Completed ticket',
    toArriveTicket: 'Pending ticket',
    todoTicket: 'Ticket to be processed',
    allTicket: 'All tickets',
    ticketManage: 'Ticket management',

    timeoutStep: 'Timeout step',
    timeoutColumns: {
      index: 'serial number',
      stepName: 'step name',
      title: 'work order name',
      ticketNo: 'Ticket number',
      outTime: 'Timeout duration',
      handler: 'handler',
      stepAging: 'Step time limit',
      action: 'operation'
    }
  }
};
