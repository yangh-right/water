/*
 * @Author: wangyr
 * @Date: 2023-07-28 16:52:34
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-31 09:48:18
 * @Description:
 */
import * as echarts from 'echarts';
import { genCommonOption } from '../../data';
export const runFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true
  }
  // {
  //   label: '当前方案',
  //   name: 'programme',
  //   span: 9,
  //   type: 'select',
  //   show: true
  // }
];

export const matchColumns = [
  {
    title: '泵',
    width: 80,
    dataIndex: 'pumpId',
    scopedSlots: { customRender: 'pumpId' }
  },
  {
    title: '运行时长(h)',
    width: 120,
    dataIndex: 'totalRun'
  },
  {
    title: '高效时长占比',
    width: 120,
    dataIndex: 'highRun',
    customRender: (text, row, index) => {
      return `${text}%`;
    }
  },
  {
    title: '低效时长占比',
    width: 160,
    dataIndex: 'lowRun',
    customRender: (text, row, index) => {
      return `${text}%`;
    }
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

export function genInWaterOption(config = {}) {
  return {
    ...genCommonOption(config),
    color: ['#BD5DFF', '#FF9A3B'],
    series: [
      {
        name: '',
        data: config.yData || [],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorRgb('#BD5DFF', 0.5) },
            { offset: 1, color: colorRgb('#BD5DFF', 0.1) }
          ])
        }
      }
    ]
  };
}
export function genProcessWaterQualityOption(config = {}) {
  return {
    ...genCommonOption(config),
    color: ['#36D2FF', '#FF9A3B'],
    series: [
      {
        name: '',
        data: config.yData || [],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorRgb('#36D2FF', 0.5) },
            { offset: 1, color: colorRgb('#36D2FF', 0.1) }
          ])
        }
      }
    ]
  };
}
export function genOutWaterOption(config = {}) {
  return {
    grid: [
      {
        left: '5%',
        right: '3%',
        top: '16%',
        bottom: '3%',
        containLabel: true
      }
    ],
    legend: {
      show: false
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: [
      {
        data: config.xData || [],
        axisLine: {
          lineStyle: {
            type: 'solid',
            color: '#4176a3',
            width: '0.5' //坐标线的宽度
          }
        },
        axisLabel: {
          rotate: config.xAxisRotate ?? 0,
          textStyle: {
            color: '#8C99A6', //底部文字颜色
            fontSize: 12
          }
        }
      }
    ],
    yAxis: [
      {
        name: config.yAxisName,
        nameTextStyle: {
          align: 'right',
          fontSize: 11,
          color: '#8C99A6'
        },
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(65, 118, 163, 0.3)',
            width: 1,
            type: 'solid'
          }
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          show: true,
          fontSize: 12,
          textStyle: {
            color: '#8C99A6' //左文字颜色
          }
        }
      }
    ],
    series: [
      {
        name: '污泥外运量',
        type: 'bar',
        barWidth: 15,
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(21,136,209,0.1)'
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(21,136,209,1)' //渐变1
            },
            {
              offset: 1,
              color: 'rgba(21,136,209,1)' //渐变2
            }
          ])
        },
        data: config.yData || [],
        z: 0,
        zlevel: 0
      },
      {
        type: 'pictorialBar',
        barWidth: 15,
        itemStyle: {
          color: 'rgba(0,63,119,1)'
        },
        symbolRepeat: 'fixed',
        symbolMargin: 3,
        symbol: 'rect',
        symbolSize: [15, 4],
        symbolPosition: 'end',
        symbolOffset: [0, 0],
        data: config.yData || [],
        z: 1,
        zlevel: 0,
        tooltip: {
          show: false
        }
      }
    ]
  };
}
export function carbonDosageOption(config = {}) {
  return {
    ...genCommonOption(config),
    color: ['#2EFFCC', '#FF9A3B'],
    series: [
      {
        name: '',
        data: config.yData || [],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorRgb('#36D2FF', 0.5) },
            { offset: 1, color: colorRgb('#36D2FF', 0.1) }
          ])
        }
      }
    ]
  };
}

export function suggestPredictOption(config = {}) {
  return {
    ...genCommonOption(config),
    color: ['#2EFFCC', '#FF9A3B'],
    series: [
      {
        name: '',
        data: config.yData1 || [],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorRgb('#36D2FF', 0.5) },
            { offset: 1, color: colorRgb('#36D2FF', 0.1) }
          ])
        }
      }
    ]
  };
}
const legendSvg = {
  // 正方形 10*10
  rect: 'path://M-0.000,-0.000 L10.000,-0.000 L10.000,10.000 L-0.000,10.000 L-0.000,-0.000 Z',
  // 线条 10*3
  line: 'path://M-0.000,-0.000 L10.000,-0.000 L10.000,3.000 L-0.000,3.000 L-0.000,-0.000 Z'
};
export function effectEvaluationOption(config = {}) {
  return {
    ...genCommonOption(),
    legend: {
      show: true,
      top: 6,
      left: 'center',
      icon: 'rect',
      itemHeight: 8,
      itemWidth: 10,
      textStyle: {
        fontSize: '12px'
      },
      data: [
        {
          name: '相对误差',
          icon: legendSvg.line
        },
        {
          name: '实际排泥流量',
          icon: legendSvg.rect
        },
        {
          name: '预测排泥流量',
          icon: legendSvg.rect
        }
      ]
    },
    xAxis: [
      {
        axisLabel: {
          rotate: config.xAxisRotate ?? 0,
          formatter: config.xAxisLabelFormat
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: '#354050'
          }
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
      },
      {
        type: 'value',
        name: '',
        splitLine: {
          lineStyle: {}
        },
        axisLabel: {},
        nameTextStyle: {
          align: 'right'
        }
      }
    ],
    color: ['#2EFFCC', '#36D2FF', '#BD5DFF'],
    series: [
      {
        name: '相对误差',
        data: config.yData1 || [],
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        barMaxWidth: 7
      },
      {
        name: '实际排泥流量',
        data: config.yData2 || [],
        type: 'bar',
        barMaxWidth: 7
      },
      {
        name: '预测排泥流量',
        data: config.yData3 || [],
        type: 'bar',
        barMaxWidth: 7
      }
    ]
  };
}
