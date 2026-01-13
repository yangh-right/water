/*
 * @Description:
 * @Author: limz
 * @Date: 2021-07-13 14:53:31
 * @LastEditTime: 2023-05-06 13:15:46
 * @LastEditors: Do not edit
 */
// 污水厂状态
import store from '@/store';
import * as echarts from 'echarts';
export const SITE_STATUS = {
  0: {
    str: '在线',
    cls: 'supply-text-success status0'
  },
  1: {
    str: '报警',
    cls: 'supply-text-warning status1'
  },
  2: {
    str: '离线',
    cls: 'supply-text-third bgc-offline'
  }
};

/* 污水厂信息 */
export const SITE_INFO = [
  {
    label: '污水厂级别',
    unit: '',
    key: 'pumpLevel'
  },
  {
    label: '供水规模',
    unit: 'm³/d',
    key: 'scale'
  },
  ...(!store.state.configure.hasTank
    ? [
        {
          label: '建筑类别',
          unit: '',
          key: 'useNature'
        }
      ]
    : []),
  ...(store.state.configure.hasTank
    ? [
        {
          label: '水池容积',
          unit: 'm³',
          key: 'volumes'
        }
      ]
    : []),
  {
    label: '加压户数',
    unit: '户',
    key: 'userNum'
  }
];
export const AREA_SITE_INFO = [
  {
    label: '已接管',
    key: 'tokenOverNum'
  },
  {
    label: '本年计划接管',
    key: 'planTakeOverCurrentYearNum'
  },
  {
    label: '建设中',
    key: 'buildingNum'
  },
  {
    label: '在线数',
    key: 'onLineNum'
  },
  {
    label: '离线数',
    key: 'offLineNum'
  }
];

/* 能耗排名chart */
export const LINECHART_OPTION = {
  grid: [{ top: 0 }],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    bottom: 0,
    itemWidth: 8,
    itemHeight: 8,
    icon: 'rect',
    textStyle: {
      color: '#999999'
    }
  },
  xAxis: [
    {
      type: 'value',
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#DEE2E7'
        }
      },
      axisLabel: {
        textStyle: {
          color: '#868E96'
        }
      }
    }
  ],
  yAxis: [
    {
      type: 'category',
      data: [],
      axisLine: {
        show: true,
        lineStyle: {
          color: '#DEE2E7'
        }
      },
      axisLabel: {
        textStyle: {
          color: '#999999'
        },
        formatter: val => {
          let name = val;
          let reg = /^[A-Za-z0-9]+$/; // 英文/数字
          if (reg.test(name) && name.length > 8) {
            name = `${name.slice(0, 4)}...${name.slice(name.length - 3, name.length - 1)}`;
          } else if (name.length > 4) {
            name = `${name.slice(0, 2)}...${name.slice(name.length - 2, name.length - 1)}`;
          }
          return name;
        }
      }
    }
  ],
  series: [
    {
      color: ['#6395F9'],
      barWidth: '8',
      name: '本月吨水电耗（KWh/m³）',
      type: 'bar',
      data: []
    }
  ]
};

/* 运维信息 */
export const TICKET_INFO = {
  num: [
    {
      label: '本月工单',
      key: 'total'
    },
    {
      label: '已完成',
      key: 'doneNum'
    },
    {
      label: '完成率',
      key: 'percent'
    }
  ]
};

/* 报警信息chart */
export const ALARM_OPTION = {
  title: {
    show: true,
    text: '',
    textStyle: {
      color: '#999',
      fontSize: 12,
      fontWeight: 'normal'
    },
    textAlign: 'center',
    subtext: [''],
    top: '70',
    left: '57',
    subtextStyle: {
      fontSize: 16,
      color: '#333',
      fontWeight: 'bold'
    }
  },
  legend: {
    show: true,
    pageIconSize: 8,
    orient: 'vertical',
    left: 'auto',
    right: 10,
    bottom: 'center',
    width: 180,
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 8,
    icon: 'rect',
    textStyle: {
      fontSize: 12,
      rich: {
        a: {
          align: 'left',
          color: '#666'
        },
        b: {
          align: 'right',
          color: '#999999',
          padding: [0, 0, 0, 20]
        }
      }
    }
  },
  series: [
    {
      radius: ['40%', '65%'],
      center: ['26%', '50%'],
      roseType: false,
      label: {
        normal: {
          show: false
        },
        emphasis: {
          show: false
        }
      },
      color: ['#F15C6E', '#F47A00', '#F8B500', '#8C6CFF'],
      data: []
    }
  ]
};

export function createMarker({ lat, lng }, iconConfig) {
  const iconOption = {
    iconSize: [12, 36],
    ...iconConfig
  };
  const icon = L.icon(iconOption);
  return L.marker([lat, lng], { icon });
}

/* ------------ KPI --------------- */
/* 运行chart */
export const RUN_OPTION = {
  legend: {
    bottom: 0,
    itemWidth: 8,
    itemHeight: 8,
    icon: 'rect',
    formatter: '{name} (MPa)',
    textStyle: {
      color: '#999999'
    }
  },
  xAxis: [
    {
      data: [],
      axisLabel: {
        textStyle: {
          color: '#999999'
        },
        rotate: 60,
        formatter: val => {
          if (val.length > 5) {
            val = val.slice(0, 5) + '...';
          }
          return val;
        }
      },
      axisTick: {
        show: false
      }
    }
  ],
  series: [
    {
      name: '进口压力',
      type: 'bar',
      barWidth: '12',
      color: ['#6395F9'],
      itemStyle: {
        barBorderRadius: [8, 8, 0, 0]
      },
      data: []
    }
  ],
  grid: [{ top: 30 }]
};

/* 运维chart */
export const OPERAT_OPTION = {
  grid: [{ top: 30 }],
  legend: {
    bottom: 0,
    itemWidth: 8,
    itemHeight: 8,
    icon: 'rect',
    textStyle: {
      color: '#999999'
    }
  },
  xAxis: [
    {
      data: [],
      axisTick: {
        show: false
      },
      axisLabel: {
        textStyle: {
          color: '#999999'
        }
      }
    }
  ],
  series: []
};

/** 水电量chart */
export const ELEC_OPTION = {
  grid: [{ left: '5%' }],
  tooltip: {
    axisPointer: {
      type: 'none'
    },
    formatter: param => {
      return `${param[0].name} <br /> ${param[0].marker}${param[0].seriesName} ${param[0].value} kW·h
                  <br /> ${param[1].marker}${param[1].seriesName} ${param[1].value} m³ `;
    }
  },
  legend: {
    bottom: 0,
    itemWidth: 20,
    itemHeight: 2,
    icon: 'rect',
    textStyle: {
      color: '#999999'
    }
  },
  xAxis: [
    {
      boundaryGap: false,
      data: [],
      splitLine: {
        interval: 1
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        textStyle: {
          color: '#999999'
        },
        formatter: val => {
          return val.slice(0, 4) + '-' + val.slice(4);
        }
      }
    }
  ],
  yAxis: [
    {
      name: '用电量',
      nameTextStyle: {
        color: '#999'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        textStyle: {
          color: '#999999'
        }
      },
      splitLine: {
        show: false
      }
    },
    {
      name: '供水量',
      nameTextStyle: {
        color: '#999'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        textStyle: {
          color: '#999999'
        }
      }
    }
  ],
  series: [
    {
      name: '用电量',
      smooth: false,
      unit: 'kW·h',
      symbol: 'circle',
      symbolSize: 1,
      type: 'line',
      animation: true,
      itemStyle: {
        normal: {},
        emphasis: {
          color: '#4285F4',
          borderColor: '#fff',
          borderWidth: 1,
          shadowColor: 'rgba(66, 133, 244, .3)',
          shadowBlur: 8
        }
      },
      color: ['#62DAAB'],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(98, 218, 171, 1)'
          },
          {
            offset: 1,
            color: 'rgba(255,255,255,0)'
          }
        ])
      },
      data: []
    },
    {
      name: '供水量',
      yAxisIndex: 1,
      unit: 'm³',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 1,
      animation: true,
      color: ['#5092FF'],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(80, 146, 255, 1)'
          },
          {
            offset: 1,
            color: 'rgba(255,255,255,0)'
          }
        ])
      },
      data: []
    }
  ]
};
