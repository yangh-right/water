/*
 * @Author: wangyr
 * @Date: 2023-06-16 09:17:51
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-15 10:52:46
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
      name: {
        textStyle: {
          color: '#F0F6FF',
          fontSize: 16
        }
      },
      axisLine: {
        lineStyle: {
          color: '#153269'
        }
      },
      radius: '65%',
      center: ['50%', '55%'],
      indicator: []
    }
  ],
  series: [
    {
      type: 'radar',
      color: ['#F0F6FF'],
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
