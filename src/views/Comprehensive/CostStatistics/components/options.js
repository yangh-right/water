// 全厂能耗分析
import * as echarts from 'echarts';
const themeColor = ['#805CFF', '#FFAB00'];
export const moduleOption = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '18%',
      bottom: '12%',
      containLabel: true
    }
  ],
  legend: {
    top: 'top',
    left: 'right',
    icon: 'rect',
    itemHeight: 6,
    itemWidth: 8,
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
      name: '全厂电量',
      type: 'bar',
      barWidth: 8,
      itemStyle: {
        color: '#5B8FF9'
      },
      data: []
    },
    {
      name: '千吨耗电量',
      type: 'line',
      smooth: false,
      yAxisIndex: 1,
      itemStyle: {
        color: '#27DCB1'
      },
      data: []
    }
  ]
};

// 污水处理量
export const waterOption = (state = 'default') => {
  return {
    color: LevelColorMap[state],
    grid: [
      {
        left: '16px',
        right: '12px',
        top: '18%',
        bottom: '12%',
        containLabel: true
      }
    ],
    legend: {
      top: 'top',
      left: 'right',
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
      }
    ],
    dataZoom: [
      {
        type: 'inside'
      }
    ],
    series: [
      {
        name: '',
        type: 'line',
        smooth: false,
        data: []
      }
    ]
  };
};

// 配电间能耗电量统计
export const roomOption = (state = 'default') => {
  return {
    color: LevelColorMap[state],
    grid: [
      {
        left: '16px',
        right: '12px',
        top: '18%',
        bottom: '12%',
        containLabel: true
      }
    ],
    legend: {
      top: 'top',
      left: 'right',
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
      }
    ],
    dataZoom: [
      {
        type: 'inside'
      }
    ],
    series: [
      {
        name: '配电间电量',
        type: 'bar',
        barWidth: 8,
        itemStyle: {
          color: '#5B8FF9'
        },
        data: []
      }
    ]
  };
};

export function genCommonOption(config = {}) {
  return {
    grid: [
      {
        left: '16px',
        right: '12px',
        top: '40px',
        bottom: '12px',
        containLabel: true
      }
    ],
    legend: {
      show: true,
      top: 6,
      right: 6,
      icon: 'rect',
      itemHeight: 2,
      itemWidth: 12
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: [
      {
        axisLabel: {
          formatter: config.xAxisLabelFormat
        },
        axisLine: {
          show: false,
          lineStyle: {}
        },
        data: config.xData || []
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: config.yAxisName || '',
        splitLine: {
          lineStyle: {}
        },
        axisLabel: {},
        nameTextStyle: {
          align: 'right'
        }
      }
    ]
  };
}

export const carbonDosageOption = (state = 'default') => {
  return {
    ...genCommonOption({
      yAxisName: '',
      xAxisLabelFormat: value => {
        return value && value.length > 12 ? value?.slice(11, 13) : value;
      }
    }),
    color: LevelColorMap[state],
    series: [
      {
        name: '实际投加',
        data: [],
        type: 'line',
        smooth: true
      }
    ]
  };
};

export const LevelColorMap = {
  dark: [
    '#1F87FC',
    '#F9D42D',
    '#C034EE',
    '#FF861B',
    '#2F7FFF',
    '#2BDEAB',
    '#FFA66D',
    '#FF6781',
    '#FFD739',
    '#A259F5',
    '#F9D54A',
    '#0171CE'
  ],
  green: [
    '#0ED5D9',
    '#F9D42D',
    '#C034EE',
    '#FF861B',
    '#2F7FFF',
    '#2BDEAB',
    '#FFA66D',
    '#FF6781',
    '#FFD739',
    '#A259F5',
    '#F9D54A',
    '#0171CE'
  ],
  red: [
    '#E85B28',
    '#F9D42D',
    '#C034EE',
    '#448EFF',
    '#2F7FFF',
    '#2BDEAB',
    '#FFA66D',
    '#FF6781',
    '#FFD739',
    '#A259F5',
    '#F9D54A',
    '#0171CE'
  ],
  default: [
    '#1F87FC',
    '#FF861B',
    '#F9D54A',
    '#0171CE',
    '#2BDEAB',
    '#F9D42D',
    '#FFA66D',
    '#A259F5',
    '#C034EE',
    '#2F7FFF',
    '#FF6781',
    '#FFD739'
  ]
};

// 配电间能耗占比
export const totalNumOption = {
  tooltip: {
    show: false,
    trigger: 'item'
  },
  legend: {
    show: false,
    type: 'scroll',
    orient: 'vertical',
    left: 'right',
    icon: 'rect'
  },
  series: [
    {
      name: '',
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          formatter: ['{c|{c}%}', '{b|{b}}'].join('\n'),
          rich: {
            b: {
              color: '#999999',
              fontSize: '12',
              fontFamily: 'PingFangSC-Regular'
            },
            c: {
              color: '#333333',
              fontSize: '26',
              fontFamily: 'DINAlternate-Bold'
            }
          }
        }
      },
      labelLine: {
        show: false
      },
      type: 'pie',
      roseType: false,
      avoidLabelOverlap: true,
      radius: ['69%', '82%'],
      center: ['50%', '43%'],
      data: []
    }
  ]
};
// 配电间能耗占比-子类
export const totalNumSmallTypeOption = {
  tooltip: {
    show: false,
    trigger: 'item'
  },
  legend: {
    show: false,
    type: 'scroll',
    orient: 'vertical',
    left: 'right',
    icon: 'rect'
  },
  series: [
    {
      name: '',
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          formatter: ['{c|{c}%}', '{b|{b}}'].join('\n'),
          rich: {
            b: {
              color: '#999999',
              fontSize: '12',
              fontFamily: 'PingFangSC-Regular'
            },
            c: {
              color: '#333333',
              fontSize: '26',
              fontFamily: 'DINAlternate-Bold'
            }
          }
        }
      },
      labelLine: {
        show: false
      },
      type: 'pie',
      roseType: false,
      avoidLabelOverlap: true,
      radius: ['69%', '82%'],
      center: ['50%', '43%'],
      data: []
    }
  ]
};

// 全厂能耗分析
export const powerOption = {
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
    top: 'top',
    left: 'right',
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
      name: 'kw·h',
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
// 同步环比
export const lineOption = {
  legend: {
    show: false
  },
  tooltip: {
    trigger: 'axis',
    confine: true
  },
  axisPointer: {
    link: {
      xAxisIndex: 'all'
    },
    label: {
      backgroundColor: '#777'
    }
  },
  grid: [
    {
      left: '80px',
      right: '40px',
      top: '10px',
      bottom: '30px',
      containLabel: false
    }
  ],
  xAxis: [
    {
      type: 'category',
      gridIndex: 0,
      data: [],
      scale: true,
      boundaryGap: false,
      axisLine: {
        show: true,
        lineStyle: {}
      },
      axisTick: {
        show: true
      },
      splitLine: {
        show: false
      },
      axisPointer: {
        z: 100
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      axisLine: {
        show: false,
        lineStyle: {}
      },
      gridIndex: 0,
      axisTick: {
        show: false
      },
      splitLine: {
        show: true
      },
      axisLabel: {},
      minInterval: null
    }
  ],
  series: [
    {
      name: '电量',
      step: false,
      pumpName: '',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'circle',
      itemStyle: {
        color: 'rgb(67,135,244)'
      },
      yAxisIndex: 0,
      areaStyle: {
        opacity: 0.5,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0.15,
              color: 'rgba(67,135,244,0.3)'
            },
            {
              offset: 1,
              color: 'rgba(67,135,244,0.08)'
            }
          ],
          global: false
        }
      }
    },
    {
      name: '电量环比',
      step: false,
      pumpName: '',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'circle',
      itemStyle: {
        color: themeColor[0]
      },
      yAxisIndex: 0,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorRgb(themeColor[0], 0.2) },
          { offset: 1, color: colorRgb(themeColor[0], 0) }
        ])
      }
    },
    {
      name: '电量同比',
      step: false,
      pumpName: '',
      type: 'line',
      data: [],
      smooth: true,
      symbol: themeColor[1],
      itemStyle: {
        color: themeColor[1]
      },
      yAxisIndex: 0,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorRgb(themeColor[1], 0.2) },
          { offset: 1, color: colorRgb(themeColor[1], 0) }
        ])
      }
    }
  ]
};
function colorRgb(str, opacity) {
  var sColor = str.toLowerCase();
  if (sColor) {
    if (sColor.length === 4) {
      var sColorNew = '#';
      for (var i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    var sColorChange = [];
    for (var i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
    }
    return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
  } else {
    return sColor;
  }
}
