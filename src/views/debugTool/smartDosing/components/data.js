/*
 * @Author: wangyr
 * @Date: 2023-07-28 16:52:34
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-05 09:01:14
 * @Description:
 */
import { genCommonOption } from '../../data';
import * as echarts from 'echarts';
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
export const pFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true
  }
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
        name: '实际值',
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
        name: '实际值',
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
    ...genCommonOption(config),
    color: ['#2EFFCC', '#FF9A3B'],
    series: [
      {
        name: '实际值',
        data: config.yData || [],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorRgb('#2EFFCC', 0.5) },
            { offset: 1, color: colorRgb('#2EFFCC', 0.1) }
          ])
        }
      }
    ]
  };
}
export const carbonDosageOption = {
  ...genCommonOption({
    yAxisName: '',
    xAxisRotate: 40,
    xAxisLabelFormat: value => {
      return value && value.length > 12 ? value?.slice(11, 16) : value?.slice(5, 10);
    }
  }),
  color: ['#BD5DFF', '#36D2FF'],
  series: [
    {
      name: '实际投加',
      data: [],
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
export const suggestPredictOption = {
  ...genCommonOption({
    yAxisName: '',
    xAxisRotate: 40,
    xAxisLabelFormat: value => {
      return value && value.length > 12 ? value?.slice(11, 16) : value?.slice(5, 10);
    }
  }),
  color: ['#36D2FF', '#FF9A3B'],
  series: [
    {
      name: '预测值',
      data: [],
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
const legendSvg = {
  // 正方形 10*10
  rect: 'path://M-0.000,-0.000 L10.000,-0.000 L10.000,10.000 L-0.000,10.000 L-0.000,-0.000 Z',
  // 线条 10*3
  line: 'path://M-0.000,-0.000 L10.000,-0.000 L10.000,3.000 L-0.000,3.000 L-0.000,-0.000 Z'
};
export function genEffectEvaluationOption(config = {}) {
  let option = {};
  if (config.type === '1') {
    option = {
      ...genCommonOption(config),
      yAxis: [
        {
          type: 'value',
          name: config.yAxisName,
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
            name: '节省比例',
            icon: legendSvg.line
          },
          {
            name: '实际投加量',
            icon: legendSvg.rect
          },
          {
            name: '预测投加量',
            icon: legendSvg.rect
          }
        ]
      },
      color: ['#2EFFCC', '#36D2FF', '#BD5DFF'],
      series: [
        {
          name: '节省比例',
          data: config.yData?.[0] || [],
          type: 'line',
          smooth: true,
          barMaxWidth: 7,
          yAxisIndex: 1
        },
        {
          name: '实际投加量',
          data: config.yData?.[1] || [],
          type: 'bar',
          barMaxWidth: 7
        },
        {
          name: '预测投加量',
          data: config.yData?.[2] || [],
          type: 'bar',
          barMaxWidth: 7
        }
      ]
    };
  } else {
    option = {
      ...genCommonOption(config),
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
            name: '实际吨水药耗',
            icon: legendSvg.rect
          },
          {
            name: '建议吨水药耗',
            icon: legendSvg.rect
          }
        ]
      },
      color: ['#36D2FF', '#BD5DFF'],
      series: [
        {
          name: '实际吨水药耗',
          data: config.yData?.[0] || [],
          type: 'bar',
          barMaxWidth: 7
        },
        {
          name: '建议吨水药耗',
          data: config.yData?.[1] || [],
          type: 'bar',
          barMaxWidth: 7
        }
      ]
    };
  }

  return option;
}
