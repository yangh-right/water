/*
 * @Author: wangyr
 * @Date: 2023-07-28 16:52:34
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-06-25 11:03:04
 * @Description:
 */
import color from '@/components/FormParser/vc-color-picker/mixin/color';
import * as echarts from 'echarts';
import { genCommonOption } from '../../data';

export const runFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true
  },
  {
    label: '当前砂桶',
    name: 'bucketId',
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

export function genWaterAmountOption(config = {}) {
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

export const sandPredictOption = {
  ...genCommonOption({
    yAxisName: 'mg/L',
    xAxisRotate: 40,
    xAxisLabelFormat: value => {
      return value && value.length > 5 ? value?.slice(5, 10) : value;
    }
  }),

  color: ['#5DFFDF', '#FF9A3B'],
  series: [
    {
      name: '预测值',
      data: [],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorRgb('#5DFFDF', 0.5) },
          { offset: 1, color: colorRgb('#5DFFDF', 0.1) }
        ])
      }
    }
  ]
};
export function genWaterQualityOption(config = {}) {
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

export const sandBucketClearOption = {
  ...genCommonOption({
    yAxisName: 't/d',
    xAxisRotate: 40,
    xAxisLabelFormat: value => {
      return value && value.length > 5 ? value?.slice(5, 10) : value;
    }
  }),
  legend: {
    show: false
  },
  color: ['#0080FF', '#FF9A3B'],
  series: [
    {
      name: '',
      data: [],
      type: 'bar',
      barMaxWidth: 7,
      itemStyle: {
        itemStyle: {
          color: '#6C7FFF'
        }
      }
    }
  ]
};
