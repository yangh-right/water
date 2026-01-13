/*
 * @Description:
 * @Author: limz
 * @Date: 2021-08-04 16:07:21
 * @LastEditTime: 2021-10-29 13:44:21
 * @LastEditors: limz
 */

/* 组织 - 报警情况 */
export const ORG_BAR_OPTION = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: [{ top: 15, right: 30 }],
  dataZoom: [
    {
      type: 'slider',
      yAxisIndex: [0],
      startValue: 0,
      endValue: 6,
      minValueSpan: 6,
      maxValueSpan: 6,
      brushSelect: false
    },
    {
      type: 'inside',
      yAxisIndex: [0],
      startValue: 0,
      endValue: 6,
      minValueSpan: 6,
      maxValueSpan: 6
    }
  ],
  legend: {
    itemWidth: 12,
    itemHeight: 8,
    itemGap: 20,
    icon: 'roundRect'
    // textStyle: { color: '#6281a3' }
  },
  xAxis: [
    {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: true },
      axisLabel: { color: '#999' }
    }
  ],
  yAxis: [
    {
      type: 'category',
      // axisLine: { show: true, lineStyle: { color: '#999' } },
      axisLine: { show: true },
      axisTick: { show: false },
      data: []
    }
  ],
  color: ['#FFBF00', '#D9DCDC'],
  series: [
    {
      name: '报警中',
      type: 'bar',
      barGap: 0,
      barWidth: 8,
      data: []
    },
    {
      name: '已结束',
      type: 'bar',
      barWidth: 8,
      data: []
    }
  ]
};

/* 组织 - 各报警等级占比 */
export const GET_ORG_PIE_OPTION = theme => {
  return {
    tooltip: {
      trigger: 'item'
    },
    title: {
      zlevel: 0,
      text: '',
      top: 'center',
      left: '163',
      textAlign: 'center',
      textStyle: {
        rich: {
          value: {
            // color: '#333',
            color: theme === 'dark' ? '#FFF' : '#333',
            fontSize: 30,
            fontWeight: 'bold',
            lineHeight: 36
          },
          name: {
            // color: '#999',
            color: theme === 'dark' ? '#868E96' : '#999',
            lineHeight: 20
          }
        }
      }
    },
    legend: {
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 8,
      bottom: 0,
      icon: 'rect',
      left: 'center'
      // textStyle: { color: theme === 'dark' ? '#ADB5BD' : '#666', }
    },
    series: [
      {
        name: '',
        type: 'pie',
        roseType: false,
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: { show: false },
        data: []
      }
    ]
  };
};

/* 污水厂 - 报警情况 */
export const PUMP_BAR_OPTION = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: [{ top: 15, right: 30 }],
  dataZoom: [
    {
      type: 'slider',
      yAxisIndex: [0],
      startValue: 0,
      endValue: 6,
      minValueSpan: 6,
      maxValueSpan: 6,
      brushSelect: false
    },
    {
      type: 'inside',
      yAxisIndex: [0],
      startValue: 0,
      endValue: 6,
      minValueSpan: 6,
      maxValueSpan: 6
    }
  ],
  legend: {
    itemWidth: 12,
    itemHeight: 8,
    itemGap: 20,
    icon: 'roundRect'
    // textStyle: { color: '#6281a3' }
  },
  xAxis: [
    {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: true },
      axisLabel: { color: '#999' }
    }
  ],
  yAxis: [
    {
      type: 'category',
      // axisLine: { show: true, lineStyle: { color: '#999' } },
      axisLine: { show: true },
      axisTick: { show: false },
      data: []
    }
  ],
  color: ['#37C2CE'],
  series: [
    {
      name: '报警数量',
      type: 'bar',
      barGap: 0,
      barWidth: 8,
      data: []
    }
  ]
};

/* 污水厂 - 各报警类型占比 */
export const GET_PUMP_PIE_OPTION = theme => {
  return {
    tooltip: {
      trigger: 'item'
    },
    title: {
      zlevel: 0,
      text: '',
      top: 'center',
      left: '163',
      textAlign: 'center',
      textStyle: {
        rich: {
          value: {
            color: theme === 'dark' ? '#FFF' : '#333',
            fontSize: 30,
            fontWeight: 'bold',
            lineHeight: 36
          },
          name: {
            color: theme === 'dark' ? '#868E96' : '#999',
            lineHeight: 20
          }
        }
      }
    },
    legend: {
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 8,
      bottom: 0,
      icon: 'rect',
      left: 'center'
      // textStyle: { color: theme === 'dark' ? '#ADB5BD' : '#666', }
    },
    series: [
      {
        color: ['#F15C6E', '#F47A00', '#F8B500', '#8C6CFF'],
        name: '',
        type: 'pie',
        roseType: false,
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: { show: false },
        data: []
      }
    ]
  };
};
