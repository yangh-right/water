/*
 * @Author: wangyr
 * @Date: 2023-06-16 09:17:51
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-20 10:25:31
 * @Description:
 */
export const radarOption = {
  legend: {
    show: false
  },
  tooltip: {
    confine: true
  },
  radar: [
    {
      radius: '65%',
      center: ['50%', '55%'],
      indicator: []
    }
  ],
  series: [
    {
      type: 'radar',
      color: ['#1FAAAD'],
      data: []
    }
  ]
};

export const toolIcon = [
  {
    title: '折线图',
    icon: 'ic_chart_line',
    type: 'line'
  },
  {
    title: '表格',
    icon: 'ic_chart_table1',
    type: 'table'
  }
  // {
  //   title: '导出',
  //   icon: 'ic_file_download',
  //   type: 'export'
  // }
];

export const processOption = {
  visualMap: [
    {
      show: false,
      type: 'continuous',
      seriesIndex: 0,
      min: 0,
      max: 400,
      color: ['#2EDDF9', '#3582FF']
    }
  ],
  grid: [
    {
      left: '0%',
      right: '0%',
      top: '18%',
      bottom: '0%',
      containLabel: true
    }
  ],
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
      name: ''
    }
  ],
  series: [
    {
      type: 'line',
      showSymbol: false,
      data: [],
      smooth: true
    }
  ]
};

// 污染物削减量
export const ReductionAmountOption = {
  grid: [
    {
      top: '12%',
      left: '3%',
      right: '4%',
      bottom: '4%',
      containLabel: true
    }
  ],
  xAxis: [
    {
      data: []
    }
  ],
  yAxis: [
    {
      name: 'T',
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
  series: [
    {
      type: 'bar',
      barWidth: 12,
      itemStyle: {
        color: []
      },
      data: []
    }
  ]
};
