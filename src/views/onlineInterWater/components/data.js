import * as echarts from 'echarts';

//头部
export const runFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 6,
    labelCol: {
      span: 6
    },
    wrapperCol: {
      span: 18
    }
  }
];

export const inWaterOption = {
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
      fontSize: '12px'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      axisLabel: {
        formatter: value => {
          return value && value.length > 5 ? value?.slice(11, 16) : value;
        }
      },
      data: []
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'mg/L',
      nameTextStyle: {
        color: '#00000073',
        padding: [0, 0, 0, 22]
      }
    }
  ],
  series: [
    {
      name: '实际值',
      data: [],
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
      data: [],
      type: 'line',
      smooth: true
    }
  ]
};

export const pointsData = {
  come_water_InstantaneousFlow: {
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
  come_water_COD_BOD: {
    tabs: [
      {
        pointMemo: 'COD',
        pointName: 'jsc_cod'
      },
      {
        pointMemo: 'BOD',
        pointName: 'jsc_bod'
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
    ]
  },
  come_water_AN_TN: {
    tabs: [
      {
        pointMemo: 'NH3-N',
        pointName: 'jsc_an'
      },
      {
        pointMemo: 'TN',
        pointName: 'jsc_TAN'
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
        dataIndex: 'real_an'
      },
      {
        title: '预测值',
        align: 'center',
        ellipsis: true,
        dataIndex: 'pre_an'
      }
    ]
  },
  come_water_TP_SS: {
    tabs: [
      {
        pointMemo: 'TP',
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
      fontSize: '12px'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: ['0:00', '06:00', '12:00', '18:00', '24:00']
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
    '#FF6781',
    '#28D6FE',
    '#FFA66D',
    '#2BDEAB',
    '#FFD739',
    '#A259F5',
    '#F9D54A',
    '#0171CE'
  ],
  tooltip: {
    trigger: 'item'
  },
  legend: {
    show: false
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '80%'],
      roseType: false,
      avoidLabelOverlap: true,
      label: {
        show: false,
        position: 'center',
        formatter: '{name|{c}}{unit|次}\n{value|{b}}',
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

// 预测模型评价
export const moduleOption = {
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
    data: [
      {
        name: '相对误差',
        tooltip: {
          formatter: function(params) {
            var customContent = '相对误差 = (预测值 - 实际值) / 实际值 × 100%';
            return customContent;
          },
          show: true
        }
      },
      {
        name: '均方根误差',
        tooltip: {
          formatter: function(params) {
            var customContent = 'RMSE = √[∑(预测值 - 实际值)^2 / n]';
            return customContent;
          },
          show: true
        }
      }
    ],
    bottom: 12,
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px'
    }
  },
  xAxis: [
    {
      data: []
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
    },
    {
      name: '',
      splitLine: {
        show: false
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
      name: '相对误差',
      type: 'bar',
      barWidth: 12,
      itemStyle: {
        color: '#5B8FF9'
      },
      data: []
    },
    {
      name: '均方根误差',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      itemStyle: {
        color: '#27DCB1'
      },
      data: []
    }
  ]
};

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
        '0:00',
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
