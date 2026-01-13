/*
 * @Description:
 * @Author: limz
 * @Date: 2021-08-04 16:07:21
 * @LastEditTime: 2022-06-09 22:28:33
 * @LastEditors: yuan wenyu
 */

/* 各组织问题情况 */
export const ORG_BAR_OPTION = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: [{ top: 5, right: 30, bottom: 25 }],
  legend: {
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 44,
    bottom: 0,
    icon: 'rect',
    left: 'center'
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
      axisLine: { show: true, lineStyle: { color: ['#999'] } },
      axisTick: { show: false },
      data: []
    }
  ],
  color: ['#FFBF00', '#4EA6FF', '#008184'],
  series: []
};

export const PeiColors = [
  ['#F05557', '#FF922B', '#9C73FB'],
  ['#00B7BA', '#58DEEE', '#83D0EF', '#63DAAB', '#DA94F0']
];

/* 严重程度 */
export const GET_ORG_PIE_OPTION = theme => {
  return {
    tooltip: {
      confine: true,
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
      itemGap: 44,
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
          formatter: params => {
            let index = params.dataIndex;
            let point = 'point' + (index > -1 ? index : '');
            return `{${point}|}{abg|}{text|${params.name}}\n{point|}{abg|}{text|${params.value}}`;
          },

          rich: {
            abg: {
              align: 'left',
              width: 5,
              height: 15
            },
            text: {
              padding: [3, 0, 0, 0],
              align: 'left',
              fontWeight: 400,
              fontSize: 12,
              color: 'rgba(44,53,66,0.65)'
            },
            point: {
              align: 'left',
              width: 7.76,
              height: 7.76,
              borderRadius: 3.88
            },
          },
          // color: 'rgba(0, 0, 0, 0.3)'
        },
        labelLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.3)'
          },
          length: 10,
          length2: 25
        },
        data: []
      }
    ]
  };
};

/* 水厂问题排名 */
export const PUMP_BAR_OPTION = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: [{ top: 5, right: 30, bottom: 25 }],
  legend: {
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 8,
    bottom: 0,
    icon: 'rect',
    left: 'center'
    // textStyle: { color: theme === 'dark' ? '#ADB5BD' : '#666', }
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
      axisLine: { show: true, lineStyle: { color: ['#999'] } },
      axisTick: { show: false },
      data: []
    }
  ],
  color: ['#37C2CE'],
  series: [
    {
      name: '上报次数',
      type: 'bar',
      barGap: 0,
      barWidth: 8,
      data: []
    }
  ]
};

/* 故障类型分布 */
export const GET_PUMP_PIE_OPTION = theme => {
  return {
    tooltip: {
      confine: true,
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
      type: 'scroll',
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
          formatter: params => {
            let index = params.dataIndex;
            let point = 'point' + (index > -1 ? index : '');
            return `{${point}|}{abg|}{text|${params.name}}\n{point|}{abg|}{text|${params.value}}`;
          },
          rich: {
            abg: {
              align: 'left',
              width: 5,
              height: 15
            },
            text: {
              align: 'left',
              fontWeight: 400,
              fontSize: 12,
              color: 'rgba(44,53,66,0.65)'
            },
            point: {
              align: 'left',
              width: 7.76,
              height: 7.76,
              borderRadius: 3.88
            },
          }

          // color: 'rgba(0, 0, 0, 0.3)'
        },
        labelLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.3)'
          },
          length: 10,
          length2: 25
        },
        data: []
      }
    ]
  };
};
