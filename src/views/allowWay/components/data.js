import * as echarts from 'echarts';

//头部
export const runFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true
  }
];
export const colorList = ['#5B8FF9', '#2BDEAB', '#28D6FE', '#FFA66D', '#E8684A'];
export const codConfig = {
  type: 'bar',
  barMaxWidth: 10
};
export const hxConfig = {
  type: 'line',
  smooth: true
};
export const lineMap = {
  '0': 'lineAPointDataList',
  '1': 'lineBPointDataList'
};
export const pointValueType = [
  { name: '实时', key: 'realPointValue' }
  // { name: '模型', key: 'modelPointValue' }
];
export const pointHistoryType = [
  { name: '历史', key: 'historyPointValue' }
  // { name: '模型', key: 'modelPointValue' }
];
//柱状图
export const codOptions = {
  grid: [
    {
      left: '16px',
      right: '65px',
      top: '5%',
      bottom: '5px',
      containLabel: true
    }
  ],
  color: ['#4285F4'],
  legend: {
    show: false,
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
  tooltip: {
    trigger: 'axis'
  },
  yAxis: [
    {
      type: 'category',
      data: []
    }
  ],
  xAxis: [
    {
      splitLine: {
        show: true
      },
      type: 'value',
      name: '',
      nameLocation: 'end',
      nameTextStyle: {
        verticalAlign: 'top',
        lineHeight: 26,
        color: '#00000073'
        // align: 'right'
      }
    }
  ],
  series: [
    {
      barMaxWidth: 10,
      data: [],
      type: 'bar'
    }
  ]
};
export const inWaterOption = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '15%',
      bottom: '15%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9', '#E8684A', '#9270CA', '#269A99', '#5AD8A6', '#F6BD16', '#6DC8EC', '#FF99C3'],
  legend: {
    type: 'scroll',
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: ['00:00', '06:00', '12:00', '18:00', '24:00']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'mg/L',
      nameTextStyle: {
        color: '#00000073',
        align: 'right'
      }
    }
  ],
  series: []
};
export const hxOption1 = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '15%',
      bottom: '15%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9', '#61DDAA', '#FF922B'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: ['00:00', '06:00', '12:00', '18:00', '24:00']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'mg/L',
      nameTextStyle: {
        color: '#00000073',
        align: 'right'
      }
    }
  ],
  series: []
};
export const hxOption2 = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '15%',
      bottom: '15%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9', '#61DDAA', '#FF922B'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: ['00:00', '06:00', '12:00', '18:00', '24:00']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'mg/L',
      nameTextStyle: {
        color: '#00000073',
        align: 'right'
      }
    }
  ],
  series: []
};
export const pollutantOption = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '10%',
      bottom: '6%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9', '#61DDAA', '#FF922B'],
  legend: {
    show: false,
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: ['00:00', '06:00', '12:00', '18:00', '24:00']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '%',
      nameTextStyle: {
        color: '#00000073',
        align: 'right'
      }
    }
  ],
  series: [
    {
      name: '去除率',
      data: [20, 28, 37, 38, 130],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorRgb('#709BF1', 0.8) },
          { offset: 1, color: colorRgb('#c1dffd', 0.1) }
        ])
      },
      type: 'line',
      smooth: true
    }
  ]
};
export const nitrogenOption = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '15%',
      bottom: '15%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9', '#61DDAA', '#FF922B'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: []
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '',
      nameTextStyle: {
        color: '#00000073',
        align: 'right'
      }
    }
  ],
  series: []
};
export const activeSludgeOption = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '19%',
      bottom: '18%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9', '#61DDAA', '#FF922B'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: ['00:00', '06:00', '12:00', '18:00', '24:00']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'mgNH3-N ·gVSS-1 ·h-1',
      interval: 30,
      nameTextStyle: {
        color: '#00000073',
        align: 'center',
        padding: [0, 0, 0, 65]
      }
    },
    {
      type: 'value',
      name: 'mg/L',
      interval: 36,
      nameTextStyle: {
        color: '#00000073',
        align: 'left'
      }
    }
  ],
  series: [
    {
      name: 'NH3-N',
      data: [20, 28, 37, 38, 130],
      type: 'line',
      smooth: true
    },
    {
      name: 'MLVSS',
      yAxisIndex: 1,
      data: [80, 89, 94, 100, 160],
      type: 'line',
      smooth: true
    }
  ]
};
export const barOption1 = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '19%',
      bottom: '18%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9', '#61DDAA', '#FF922B'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: ['00:00', '06:00', '12:00', '18:00', '24:00']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'mgPO4 3- -P ·gVSS-1 ·h-1',
      interval: 30,
      nameTextStyle: {
        align: 'center',
        padding: [0, 0, 0, 65],
        color: '#00000073'
      }
    },
    {
      type: 'value',
      name: 'mg/L',
      interval: 36,
      nameTextStyle: {
        color: '#00000073',
        align: 'left'
      }
    }
  ],
  series: [
    {
      name: 'P_RATE',
      data: [20, 28, 37, 38, 130],
      type: 'line',
      smooth: true
    },
    {
      name: 'MLVSS',
      yAxisIndex: 1,
      data: [80, 89, 44, 100, 160],
      type: 'line',
      smooth: true
    }
  ]
};
export const pointsData = {
  inWater: {
    tabs: [],
    columns: [
      {
        title: '时间',
        align: 'center',
        ellipsis: true,
        dataIndex: 'time'
      },
      {
        title: '实际值',
        align: 'center',
        ellipsis: true,
        dataIndex: 'real_water'
      },
      {
        title: '预测值',
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_water'
      }
    ]
  },
  contribute: {
    tabs: [
      {
        pointMemo: 'COD',
        pointName: 'jsc_cod'
      },
      {
        pointMemo: 'NH3-N',
        pointName: 'jsc_bod'
      },
      {
        pointMemo: 'TN',
        pointName: 'jsc_cod1'
      },
      {
        pointMemo: 'TP',
        pointName: 'jsc_bod2'
      },
      {
        pointMemo: 'SS',
        pointName: 'jsc_cod3'
      }
    ],
    columns: [
      {
        title: '时间',
        align: 'center',
        ellipsis: true,
        dataIndex: 'time'
      },
      {
        title: '工段',
        align: 'center',
        ellipsis: true,
        dataIndex: 'real_an'
      },
      {
        title: '去除率(%)',
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_an'
      },
      {
        title: '控制值(mg/L)',
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_BOD'
      }
    ]
  },
  pollutant: {
    tabs: [
      {
        pointMemo: 'COD',
        pointName: 'jsc_cod'
      },
      {
        pointMemo: 'NH3-N',
        pointName: 'jsc_bod'
      },
      {
        pointMemo: 'TN',
        pointName: 'jsc_cod1'
      },
      {
        pointMemo: 'TP',
        pointName: 'jsc_bod2'
      },
      {
        pointMemo: 'SS',
        pointName: 'jsc_cod3'
      }
    ]
  },
  cod: {
    tabs: [
      {
        pointMemo: '厌氧池',
        pointName: 'jsc_cod'
      },
      {
        pointMemo: '一级缺氧池',
        pointName: 'jsc_bod'
      },
      {
        pointMemo: '一级好氧池',
        pointName: 'jsc_cod1'
      },
      {
        pointMemo: '交替区',
        pointName: 'jsc_bod2'
      },
      {
        pointMemo: '二级缺氧池',
        pointName: 'jsc_cod3'
      },
      {
        pointMemo: '二级好氧池',
        pointName: 'jsc_bod4'
      },
      {
        pointMemo: '二沉池',
        pointName: 'jsc_bod5'
      }
    ],
    columns: [
      {
        title: '时间',
        align: 'center',
        ellipsis: true,
        dataIndex: 'time'
      },
      {
        title: '实际值',
        align: 'center',
        ellipsis: true,
        dataIndex: 'real_COD'
      },
      {
        title: '预测值',
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_COD'
      }
      // {
      //   title: 'BOD(实际值)',
      //   align: 'center',
      //   width: 80,
      //   ellipsis: true,
      //   dataIndex: 'jsc_BOD'
      // },
      // {
      //   title: 'BOD(预测值)',
      //   align: 'center',
      //   width: 80,
      //   ellipsis: true,
      //   dataIndex: 'pre_BOD'
      // }
    ]
  },
  an: {
    tabs: [],
    columns: [
      {
        title: '时间',
        align: 'center',
        ellipsis: true,
        dataIndex: 'time'
      },
      {
        title: '实际值',
        align: 'center',
        ellipsis: true,
        dataIndex: 'real_an'
      },
      {
        title: '预测值',
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_an'
      }
      // {
      //   title: '总氮',
      //   width: 200,
      //   align: 'center',
      //   ellipsis: true,
      //   dataIndex: 'jsc_BOD',
      //   children: [
      //     {
      //       title: '实际值',
      //       width: 100,
      //       align: 'center',
      //       ellipsis: true,
      //       dataIndex: 'real_BOD'
      //     },
      //     {
      //       title: '预测值',
      //       width: 100,
      //       align: 'center',
      //       ellipsis: true,
      //       dataIndex: 'pre_BOD'
      //     }
      //   ]
      // }
    ]
  },
  lin: {
    tabs: [
      {
        pointMemo: '总磷',
        pointName: 'jsc_li'
      },
      {
        pointMemo: 'SS',
        pointName: 'jsc_ss'
      }
    ],
    columns: [
      {
        title: '时间',
        align: 'center',
        ellipsis: true,
        dataIndex: 'time'
      },
      {
        title: '实际值',
        align: 'center',
        ellipsis: true,
        dataIndex: 'real_BOD'
      },
      {
        title: '预测值',
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_BOD'
      }
      // {
      //   title: '总磷',
      //   width: 200,
      //   align: 'center',
      //   ellipsis: true,
      //   dataIndex: 'jsc_COD',
      //   children: [

      //   ]
      // },
      // {
      //   title: 'SS',
      //   width: 200,
      //   align: 'center',
      //   ellipsis: true,
      //   dataIndex: 'jsc_BOD',
      //   children: [
      //     {
      //       title: '实际值',
      //       width: 100,
      //       align: 'center',
      //       ellipsis: true,
      //       dataIndex: 'real_BOD'
      //     },
      //     {
      //       title: '预测值',
      //       width: 100,
      //       align: 'center',
      //       ellipsis: true,
      //       dataIndex: 'pre_BOD'
      //     }
      //   ]
      // }
    ]
  }
};

// 出水
export const outWaterOption = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '18%',
      bottom: '15%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9', '#FF9A3B'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: ['00:00', '06:00', '12:00', '18:00', '24:00']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'mg/L',
      nameTextStyle: {
        color: '#00000073',
        align: 'right'
      }
    }
  ],
  series: [
    {
      name: '实际值',
      data: [20, 28, 37, 38, 46, 60],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorRgb('#c1dffd', 0.8) },
          { offset: 1, color: colorRgb('#c1dffd', 0.1) }
        ])
      }
    },
    {
      name: '预测值',
      data: [40, 30, 42, 38, 50, 60],
      type: 'line',
      smooth: true
    }
  ]
};

// 预警明细
export const pieOption = {
  color: [
    '#2F7FFF',
    '#2BDEAB',
    '#FFA66D',
    '#FF6781',
    '#2BDEAB',
    '#FFD739',
    '#A259F5',
    '#F9D54A',
    '#0171CE'
  ],
  grid: [
    {
      left: '12px',
      right: '2px',
      top: '20%',
      bottom: '12%'
    }
  ],
  tooltip: {
    formatter: '{b}  {c}%',
    trigger: 'item'
  },
  legend: {
    selectedMode: false,
    itemWidth: 10,
    itemGap: 18,
    itemHeight: 10,
    type: 'scroll',
    left: 'auto',
    top: 'middle',
    icon: 'rect',
    orient: 'vertical',
    right: '18%',
    show: true,
    textStyle: {
      rich: {
        a: {
          fontSize: '14',
          width: 175,
          overflow: 'truncate',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          align: 'left'
        },
        b: {
          fontSize: '14',
          width: 50,
          align: 'right'
        }
      }
    }
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '70%'],
      roseType: false,
      center: ['20%', '50%'],
      avoidLabelOverlap: true,
      label: {
        show: false,
        position: 'center',
        formatter: '{name|{c}}{unit|%}\n{value|{b}}',
        rich: {
          name: { fontSize: 24, fontWeight: 500 },
          unit: { fontSize: 12, color: '#999999' },
          value: { fontSize: 14, color: '#999999' }
        }
      },
      emphasis: {
        label: {
          show: true,
          color: '#13E0FF',
          fontSize: 22,
          fontWeight: 600
        }
      },
      labelLine: {
        show: false
      },
      data: []
    }
  ]
};

// 泵站实时数据
export const contributeColumns = [
  {
    title: '时间',
    width: 160,
    align: 'center',
    dataIndex: 'dateTime'
  },
  {
    title: '工段',
    width: 120,
    align: 'center',
    ellipsis: true,
    dataIndex: 'processName'
  },
  {
    title: '去除率(%)',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'ratio'
  },
  {
    title: '控制值(mg/L)',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'pvAfterRatio'
  }
];
// 泵站实时数据
export const deviceColumns = [
  {
    title: '污水厂名称',
    width: 80,
    align: 'center',
    dataIndex: 'name'
  },
  {
    title: '实时流量((m³)',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'flow'
  },
  {
    title: 'COD(mg/L)',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'cod'
  },
  {
    title: '氨氮(mg/L)',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'an'
  },
  {
    title: '时间',
    width: 160,
    align: 'center',
    ellipsis: true,
    dataIndex: 'time'
  }
];

export const moduleOption = {
  grid: [
    {
      top: '16%',
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    }
  ],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  xAxis: [
    {
      data: ['进水', '预处理', '厌氧池', '一级缺氧池', '一级好氧池', '交替区', '二级缺氧池']
    }
  ],
  yAxis: [
    {
      name: 'mg/L',
      nameTextStyle: {},
      splitLine: {
        lineStyle: {
          type: 'dashed'
        },
        show: true
      }
    }
  ],
  dataZoom: [
    {
      type: 'inside'
    }
  ],
  series: [
    {
      name: 'TP',
      type: 'bar',
      barWidth: 12,
      itemStyle: {
        color: '#5B8FF9'
      },
      data: []
    },
    {
      name: 'Po4-P',
      type: 'bar',
      barWidth: 12,
      itemStyle: {
        color: '#27DCB1'
      },
      data: []
    }
  ]
};
export const nitrogenConfig = {
  barMaxWidth: 8,
  type: 'bar'
};
export const microbeOption = {
  color: ['#5B8FF9', '#E8684A', '#9270CA', '#269A99', '#5AD8A6', '#F6BD16', '#6DC8EC', '#FF99C3'],
  grid: [
    {
      top: '16%',
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    }
  ],
  legend: {
    type: 'scroll',
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  xAxis: [
    {
      data: ['厌氧池', '一级缺氧池', '一级好氧池', '二级缺氧池', '二级好氧池']
    }
  ],
  yAxis: [
    {
      name: 'mg/L',
      nameTextStyle: {},
      splitLine: {
        lineStyle: {
          type: 'dashed'
        },
        show: true
      }
    }
  ],
  dataZoom: [
    {
      type: 'inside'
    }
  ],
  series: []
};

// 预测模型评价表格
export const moduleColumns = [
  {
    title: '时间',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'time'
  },
  {
    title: '水量',
    width: 200,
    align: 'center',
    ellipsis: true,
    dataIndex: 'jsc_water',
    children: [
      {
        title: '实际值',
        width: 100,
        align: 'center',
        ellipsis: true,
        dataIndex: 'real_water'
      },
      {
        title: '预测值',
        width: 100,
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_water'
      }
    ]
  },
  {
    title: 'COD',
    width: 200,
    align: 'center',
    ellipsis: true,
    dataIndex: 'jsc_COD',
    children: [
      {
        title: '实际值',
        width: 100,
        align: 'center',
        ellipsis: true,
        dataIndex: 'real_COD'
      },
      {
        title: '预测值',
        width: 100,
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_COD'
      }
    ]
  },
  {
    title: 'BOD',
    width: 200,
    align: 'center',
    ellipsis: true,
    dataIndex: 'jsc_BOD',
    children: [
      {
        title: '实际值',
        width: 100,
        align: 'center',
        ellipsis: true,
        dataIndex: 'real_BOD'
      },
      {
        title: '预测值',
        width: 100,
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_BOD'
      }
    ]
  },
  {
    title: '氨氮',
    width: 200,
    align: 'center',
    ellipsis: true,
    dataIndex: 'jsc_an',
    children: [
      {
        title: '实际值',
        width: 100,
        align: 'center',
        ellipsis: true,
        dataIndex: 'real_an'
      },
      {
        title: '预测值',
        width: 100,
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_an'
      }
    ]
  }
];

// 泵站数据曲线
export const mlssOption = {
  color: ['#77BBFA'],
  grid: [
    {
      left: '3%',
      right: '3%',
      top: '22%',
      bottom: '10%'
    }
  ],
  legend: {
    show: false,
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: [
        '00:00',
        '01:00',
        '02:00',
        '03:00',
        '04:00',
        '05:00',
        '06:00',
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00',
        '24:00'
      ]
    }
  ],
  yAxis: [
    {
      name: '',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        },
        show: true
      }
    }
  ],
  series: [
    {
      type: 'line',
      showSymbol: false,
      data: [],
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorRgb('#c1dffd', 0.8) },
          { offset: 1, color: colorRgb('#c1dffd', 0.1) }
        ])
      }
    }
  ]
};

// 泵站数据曲线表格
export const pumpDataColumns = [
  {
    title: '时间',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'time'
  },
  {
    title: 'COD',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'jsc_COD'
  },
  {
    title: 'NH3-N',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'jsc_NH3'
  },
  {
    title: 'TN',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'jsc_TN'
  }
];

function colorRgb(str, opacity) {
  let sColor = str.toLowerCase();
  if (sColor) {
    if (sColor.length === 4) {
      let sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    let sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
    }
    return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
  } else {
    return sColor;
  }
}
