// 设备运行状态
export const deviceOnlineObj = {
  '1': '在线',
  '0': '离线',
  '-1': '非IOT'
};

// 设备运行状态
export const deviceStatusObj = {
  0: '待报废',
  1: '报废',
  2: '正常使用',
  3: '待修理',
  4: '闲置'
};

//历史数据tab切换
export const  tabs = [
    {
      label: 'SV5',
      value: 'SV5'
    },
    {
      label: 'SV10',
      value: 'SV10'
    },
    {
      label: 'SV30',
      value: 'SV30'
    }
  ]

  //折线图模型
export const optionModel = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '18%',
      bottom: '15%',
      containLabel: true
    }
  ],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },

  tooltip: {
    zIndex: 9999,
    appendToBody: true,
    trigger: 'axis'
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      },
      boundaryGap: false
    }
  ],
  yAxis: [
    {
      type: 'value',
      axisTick: {
        show: true
      },
      axisLine: {
        show: true
      },
      splitLine: {
        show: false
      }
    }
  ],
  series: []
};

//图表表头
export const column = [
  {
    title: '时间',
    dataIndex: 'collectionTime',
    width: 140
  },
  {
    title: '今日',
    dataIndex: 'activedData',
    width: 100
  },
  {
    title: '昨日',
    dataIndex: 'yesterdayData',
    width: 100
  },
  {
    title: '上月今日',
    dataIndex: 'lastMonthDayData',
    width: 100
  }
]
