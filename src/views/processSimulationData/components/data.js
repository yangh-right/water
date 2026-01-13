/*
 * @Author: wangyr
 * @Date: 2023-07-06 14:44:26
 * @LastEditors: wangyr
 * @LastEditTime: 2024-07-03 09:59:59
 * @Description:
 */
import * as echarts from 'echarts';
//头部
export const runFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    show: true
  },
  {
    label: '当前方案',
    name: 'programme',
    type: 'select',
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    show: true
  },
  {
    name: 'action',
    type: 'input',
    wrapperCol: { span: 24 },
    span: 12,
    show: true
  }
];

export const toolIcon = [
  {
    title: '折线图',
    icon: 'ic_chart_line',
    type: '0'
  },
  {
    title: '表格',
    icon: 'ic_chart_table1',
    type: '1'
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
    top: 'top',
    left: 'right',
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

// 模型评价
export const moduleOption = {
  grid: [
    {
      top: '12%',
      left: '3%',
      right: '4%',
      bottom: '4%',
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
    top: 'top',
    left: 'right',
    icon: 'rect',
    padding: [0, 12, 0, 0],
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
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
      nameTextStyle: {
        padding: [0, 0, -12, -4]
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        },
        show: true
      }
    },
    {
      name: '',
      nameTextStyle: {
        padding: [0, 0, -12, -4]
      },
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
      type: 'line',
      smooth: true,
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

// 预期效果
export const expectedOption = {
  grid: [
    {
      top: '12%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  ],
  legend: {
    top: 'top',
    left: 'right',
    icon: 'rect',
    right: '20',
    itemHeight: 2,
    itemWidth: 12,
    padding: [0, 12, 0, 0],
    textStyle: {
      fontSize: '12px',
      color: '#000000'
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
      type: 'value',
      nameTextStyle: {
        padding: [0, 0, -12, -4]
      },
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
