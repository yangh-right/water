import * as echarts from 'echarts';
//折线图
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
      fontSize: '12px',
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: [],
      axisLabel: {
        showMaxLabel: true,
        interval: 3 //加入axisLabel字段,interval后面加你想要间隔的个数
      }
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
//折线图
export const effectiveOption = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '15%',
      bottom: '15%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9'],
  legend: {
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
      data: [],
      axisLabel: {
        showMaxLabel: true,
        interval: 3 //加入axisLabel字段,interval后面加你想要间隔的个数
      }
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
      name: '脱氮效能',
      data: [],
      type: 'line',
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
//折线图
export const carbonCastOption = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '15%',
      bottom: '15%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9', '#FF9A3B'],
  legend: {
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
      data: [],
      axisLabel: {
        showMaxLabel: true,
        interval: 3 //加入axisLabel字段,interval后面加你想要间隔的个数
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'L/h',
      nameTextStyle: {
        color: '#00000073',
        padding: [0, 0, 0, 22]
      }
    }
  ],
  series: [
    {
      name: '实际投加',
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
      name: '建议投加',
      data: [],
      type: 'line',
      smooth: true
    }
  ]
};
//折线图
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
      data: [],
      axisLabel: {
        showMaxLabel: true,
        interval: 3 //加入axisLabel字段,interval后面加你想要间隔的个数
      }
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
//柱状图
export const carbonDosageOption = {
  grid: [
    {
      left: '16px',
      right: '20px',
      top: '15%',
      bottom: '25px',
      containLabel: true
    }
  ],
  color: ['#4285F4'],
  legend: {
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
      type: 'category',
      data: []
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'kg/d',
      nameTextStyle: {
        color: '#00000073',
        padding: [0, 0, 0, 22]
      }
    }
  ],
  series: [
    {
      data: [],
      type: 'bar',
      barMaxWidth: '30px'
    }
  ]
};
// 横向柱状图
export const analysisOption = {
  color: ['#4385f3', '#25ddb0', '#fd922a'],
  legend: {
    icon: 'roundRect',
    itemGap: 20,
    itemHeight: 2,
    itemWidth: 12,
    top: 'bottom'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },

  grid: [
    {
      left: '25px',
      top: '0px',
      right: '3%',
      bottom: '25px',
      containLabel: true
    }
  ],
  xAxis: [
    {
      type: 'value',
      axisLabel: {
        color: '#666666'
      },
      axisLine: {
        // x轴线的颜色以及宽度
        show: false
      },
      axisTick: {
        show: false // x轴刻度线
      },
      splitLine: {
        // x轴网格线
        show: true
      }
    }
  ],
  yAxis: [
    {
      type: 'category',
      axisTick: { show: false }, // y轴刻度线
      axisLabel: { color: '#666666' }, // y轴文字的配置
      axisLine: {
        //x轴线的颜色
        show: true,
        lineStyle: { color: 'rgba(255,255,255,0.1)' }
      },
      data: []
    }
  ],
  series: [
    {
      name: '氨氮',
      type: 'bar',
      barWidth: 12, //柱子的宽度
      data: [],
      stack: true
    },
    {
      name: '硝态氮',
      type: 'bar',
      barWidth: 12, //柱子的宽度
      data: [],
      stack: true
    },
    {
      name: '其他',
      type: 'bar',
      barWidth: 12, //柱子的宽度
      data: [],
      stack: true
    }
  ]
};
export const runFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true
  },
  {
    label: '当前方案',
    name: 'programme',
    type: 'select',
    show: true
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
