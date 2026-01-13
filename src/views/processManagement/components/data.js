/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-07 09:59:21
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-23 13:38:29
 * @Description:
 */

//头部
export const runFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true
  }
];

export const deviceOption = {
  grid: [
    {
      left: '16px',
      right: '16px',
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
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
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

// 异常分析
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
