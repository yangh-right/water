/*
 * @Description: 历史数据的数据配置
 * @version:
 * @Author: liuct
 * @Date: 2021-07-15 09:21:52
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-06-16 11:02:07
 */

export const chartOption = {
  // 图表数据
  color: [
    '#5B8FF9',
    '#BDD2FD',
    '#61DDAA',
    '#BDEFDB',
    '#65789B',
    '#C2C8D5',
    '#F6BD16',
    '#FBE5A2',
    '#7262FD',
    '#D3CEFD',
    '#78D3F8',
    '#B6E3F5',
    '#9661BC',
    '#D3C6EA',
    '#F6903D',
    '#FFD8B8',
    '#008685'
  ],
  tooltip: {
    show: true,
    confine: true,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    axisPointer: {
      type: 'cross'
    },
    textStyle: {
      color: '#999999',
      fontSize: 10,
      lineHeight: 24
    }
  },
  legend: {
    icon: 'rect',
    height: 30,
    itemWidth: 20,
    itemHeight: 2,
    type: 'scroll',
    bottom: -1
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: true,
      axisTick: {
        show: true,
        alignWithLabel: true
      },
      axisLabel: {
        color: '#999999',
        interval: 'auto'
      },
      axisLine: {
        show: true,
        lineStyle: {
          // color: '#DEE2E7'
        }
      },
      splitLine: {
        show: true
      }
    }
  ],
  grid: [
    {
      top: 30,
      bottom: 30,
      left: 50
    }
  ],
  yAxis: [],
  series: []
};
export const _colors = [
  [66,133,244],
  [135,206,64],
  [202,160,0],
  [149,103,255],
  [255,73,140],
  [64,201,169],
  [215,121,255],
  [205,206,96],
  [72,193,230],
  [255,199,4],
];
export const barOption = {
  grid: [
    {
      top: 0,
      right: 20,
      bottom: 0
    }
  ],
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    confine: true,
    formatter: params => {
      let statusStr =
        Number(params.data.status) === 0
          ? '停止'
          : Number(params.data.status) === 1
          ? '工频运行'
          : Number(params.data.status) === 2
          ? '变频运行'
          : Number(params.data.status) === 3
          ? '故障'
          : '未知';
      let str =
        '开始时间：' +
        params.data.startDate +
        '<br/>' +
        '结束时间：' +
        params.data.endDate +
        '<br/>' +
        params.marker +
        statusStr;
      let h = Math.floor(params.value / 60);
      let m = Math.floor(params.value % 60);
      return str + ` ${h > 0 ? h + '小时' : ''}${m > 0 ? m + '分钟' : ''}`;
    }
  },
  legend: {
    icon: 'rect',
    itemWidth: 20,
    itemHeight: 2,
    type: 'scroll',
    bottom: -40
  },
  yAxis: [
    {
      type: 'category',
      name: '',
      data: []
    }
  ],
  xAxis: [
    {
      type: 'value',
      axisLabel: {
        textStyle: {
          color: '#999999'
        }
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      min: 0,
      max: 1440,
      interval: 720
    }
  ],
  series: []
  // dataZoom: [
  //   {
  //     id: 'dataZoomX',
  //     type: 'slider',
  //     xAxisIndex: [0], // 表示dataZoom-slider 组件控制的 x轴
  //     filterMode: 'filter',
  //     bottom: 10
  //   }
  // ]
};

export const spaces0 = [
  { label: '1分钟', value: '1', timeEnum: 'MINUTES' },
  { label: '5分钟', value: '5', timeEnum: 'MINUTES' },
  { label: '15分钟', value: '15', timeEnum: 'MINUTES' }
];

export const spaces1 = [
  { label: '1小时', value: 'HOURS' },
  { label: '天', value: 'DAYS' }
];

export const intervals0 = [
  {
    label: '近1小时',
    value: '1hours',
    space: '1',
    type: 'hours'
    // startDate: moment().subtract(2, 'hours'),
    // endDate: moment()
  },
  {
    label: '24小时',
    value: '24hours',
    space: '24',
    type: 'hours'
    // startDate: moment().subtract(24, 'hours'),
    // endDate: moment()
  },
  {
    label: '3天',
    value: '3days',
    space: '3',
    type: 'day'
    //  startDate: moment().subtract(2, 'day'),
    //  endDate: moment()
  },
  {
    label: '7天',
    value: '7days',
    space: '7',
    type: 'day'
    // startDate: moment().subtract(6, 'day'),
    //  endDate: moment()
  },
  { label: '自定义', value: '' }
];

export const intervals1 = [
  { label: '日', value: '1' },
  { label: '月', value: '2' }
];

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
  },
];

export const defaultColumns = [
  {
    title: '序号',
    key: 'num',
    width: 70,
    align: 'center',
    customRender: (text, row, index) => {
      return index + 1;
    }
  }
];

export const tableData = [
  {
    stationName: '蛇口水务所',
    id: '1',
    data: [
      {
        dataType: 'uint',
        deviceId: '0629',
        deviceName: '低区',
        data: [
          {
            time: '00:00',
            pv: 2.438
          },
          {
            time: '01:00',
            pv: 3.438
          },
          {
            time: '02:00',
            pv: 3.438
          },
          {
            time: '03:00',
            pv: 3.438
          }
        ]
      },
      {
        dataType: 'uint',
        deviceId: '0630',
        deviceName: '中区',
        data: [
          {
            time: '00:00',
            pv: 3.438
          },
          {
            time: '01:00',
            pv: 3.438
          },
          {
            time: '02:00',
            pv: 3.438
          },
          {
            time: '03:00',
            pv: 3.438
          }
        ]
      },
      {
        dataType: 'uint',
        deviceId: '0631',
        deviceName: '高区',
        data: [
          {
            time: '00:00',
            pv: 4.438
          },
          {
            time: '01:00',
            pv: 3.438
          },
          {
            time: '02:00',
            pv: 3.438
          },
          {
            time: '03:00',
            pv: 3.438
          }
        ]
      }
    ]
  },
  {
    stationName: '西丽水务所',
    id: '2',
    data: [
      {
        dataType: 'uint',
        deviceId: '0629',
        deviceName: '低区',
        data: [
          {
            time: '00:00',
            pv: 2.438
          },
          {
            time: '01:00',
            pv: 3.438
          },
          {
            time: '02:00',
            pv: 3.438
          },
          {
            time: '03:00',
            pv: 3.438
          }
        ]
      },
      {
        dataType: 'uint',
        deviceId: '0630',
        deviceName: '中区',
        data: [
          {
            time: '00:00',
            pv: 3.438
          },
          {
            time: '01:00',
            pv: 3.438
          },
          {
            time: '02:00',
            pv: 3.438
          },
          {
            time: '03:00',
            pv: 3.438
          }
        ]
      },
      {
        dataType: 'uint',
        deviceId: '0631',
        deviceName: '高区',
        data: [
          {
            time: '00:00',
            pv: 4.438
          },
          {
            time: '01:00',
            pv: 3.438
          },
          {
            time: '02:00',
            pv: 3.438
          },
          {
            time: '03:00',
            pv: 3.438
          }
        ]
      }
    ]
  }
];

export const typeList = [
  { label: '单时段', value: '0' },
  { label: '多时段', value: '1' }
];
