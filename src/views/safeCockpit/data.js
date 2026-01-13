export function getAllModuleList() {
  const allModuleList = [
    {
      name: '周界报警',
      buttonCode: 'perimeterAlarm'
    },
    {
      name: '门禁视频',
      buttonCode: 'accessVideo'
    },
    {
      name: '安全手环',
      buttonCode: 'safetyBracelets'
    },
    {
      name: '温测基本情况',
      buttonCode: 'temperatureInfo'
    },
    {
      name: '危险作业工单',
      buttonCode: 'hazardousOrder'
    },
    {
      name: '执行力管控',
      buttonCode: 'executionControl'
    },
    {
      name: 'AI识别分析',
      buttonCode: 'aiAlarmAnalysis'
    },
    {
      name: '环境安全',
      buttonCode: 'envSafe'
    },
    {
      name: '风险管理',
      buttonCode: 'riskManagement'
    },
    {
      name: '危险品管理',
      buttonCode: 'dangerousManage'
    }
  ];
  allModuleList.forEach((item, i) => {
    item.moduleType = '2';
    item.isShow = '1';
    item.sort = i + 1
  });
  return allModuleList;
}
