// 配电间能耗占比
export const totalNumOption = {
  tooltip: {
    show: false,
    trigger: 'item'
  },
  legend: {
    show: false,
    type: 'scroll',
    orient: 'vertical',
    left: 'right',
    icon: 'rect'
  },
  series: [
    {
      name: '',
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          formatter: ['{c|{c}}', '{b|{b}}'].join('\n'),
          rich: {
            b: {
              color: '#999999',
              fontSize: '14',

              fontFamily: 'PingFangSC-Regular'
            },
            c: {
              color: '#333333',
              fontSize: '32',
              fontFamily: 'DINAlternate-Bold'
            }
          }
        }
      },
      labelLine: {
        show: false
      },
      type: 'pie',
      roseType: false,
      avoidLabelOverlap: true,
      radius: ['52%', '70%'],
      center: ['50%', '40%'],
      data: []
    }
  ]
};

export const LevelColorMap = {
  dark: [
    '#1F87FC',
    '#F9D42D',
    '#C034EE',
    '#FF861B',
    '#2F7FFF',
    '#2BDEAB',
    '#FFA66D',
    '#FF6781',
    '#FFD739',
    '#A259F5',
    '#F9D54A',
    '#0171CE'
  ],
  green: [
    '#0ED5D9',
    '#F9D42D',
    '#C034EE',
    '#FF861B',
    '#2F7FFF',
    '#2BDEAB',
    '#FFA66D',
    '#FF6781',
    '#FFD739',
    '#A259F5',
    '#F9D54A',
    '#0171CE'
  ],
  red: [
    '#E85B28',
    '#F9D42D',
    '#C034EE',
    '#448EFF',
    '#2F7FFF',
    '#2BDEAB',
    '#FFA66D',
    '#FF6781',
    '#FFD739',
    '#A259F5',
    '#F9D54A',
    '#0171CE'
  ],
  default: [
    '#1F87FC',
    '#FF861B',
    '#F9D54A',
    '#0171CE',
    '#2BDEAB',
    '#F9D42D',
    '#FFA66D',
    '#A259F5',
    '#C034EE',
    '#2F7FFF',
    '#FF6781',
    '#FFD739'
  ]
};

// 全厂能耗分析
export const moduleOption = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '18%',
      bottom: '12%',
      containLabel: true
    }
  ],
  // legend: {
  //   top: 'bottom',
  //   icon: 'rect',
  //   itemHeight: 2,
  //   itemWidth: 12,
  //   textStyle: {
  //     fontSize: '12px',
  //     color: '#000000'
  //   }
  // },
  xAxis: [
    {
      data: []
    }
  ],
  yAxis: [
    {
      name: '',
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
      name: '全厂电量',
      type: 'bar',
      barWidth: 8,
      itemStyle: {
        color: '#5B8FF9'
      },
      data: []
    },
    {
      name: '千吨耗电量',
      type: 'line',
      smooth: false,
      itemStyle: {
        color: '#27DCB1'
      },
      data: []
    }
  ]
};

// 污水源热泵系统能耗对比分析
export const pollutionOption = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '18%',
      bottom: '3%',
      containLabel: true
    }
  ],
  legend: {
    top: 'top',
    left: 'right',
    icon: 'rect',
    itemHeight: 6,
    itemWidth: 8,
    textStyle: {
      fontSize: '12px'
    }
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      axisLabel: {
        interval: 1, //设置为 1，表示『隔一个标签显示一个标签』
        margin: 15,
        textStyle: {
          fontStyle: 'normal',
          fontFamily: '微软雅黑',
          fontSize: 12
        }
      },
      axisTick: {
        //坐标轴刻度相关设置。
        show: false
      },
      axisLine: {
        //坐标轴轴线相关设置
        lineStyle: {
          color: '#fff',
          opacity: 0.2
        }
      },
      splitLine: {
        //坐标轴在 grid 区域中的分隔线。
        show: false
      }
    }
  ],
  yAxis: [
    {
      name: '',
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
      name: '能耗',
      type: 'bar',
      barWidth: 8,
      barGap: 0,
      itemStyle: {
        color: '#5B8FF9'
      },
      data: []
    }
  ]
};
