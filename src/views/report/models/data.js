/*
 * @Description:
 * @Author: limz
 * @Date: 2021-07-22 17:20:13
 * @LastEditTime: 2024-10-16 09:38:39
 * @LastEditors: wangyr
 */
import moment from 'moment';

/* 报表类型 */
export const typeList = [
  { label: '日报', value: 'day' },
  { label: '月报', value: 'month' },
  { label: '年报', value: 'year' }
];
export const pumpDeviceLevelList = [
  { label: '污水厂', value: 'pumpLevel' },
  { label: '设备', value: 'deviceLevel' }
];
/* 监测量 */
export const plainOptions = [
  { label: '进水压力', value: 'InletPressure' },
  { label: '出水压力', value: 'OutletPressure' },
  { label: '给定压力', value: 'GivenPressure' }
];
/* 水电量监测量 */
export const waterPlainOptions = [
  { label: '污水处理量', value: 'flowPv' },
  { label: '耗电量', value: 'powerPv' },
  { label: '千吨水电耗', value: 'energy' }
];
/* 能效监测量 */
export const energyPlainOptions = [
  { label: '千吨水电耗', value: 'energy' },
  { label: '配水电耗', value: 'energyK' }
];
/* 水质监测量 */
export const qualityPlainOptions = [
  { label: '浊度', value: 'Turbidity' },
  { label: '电导率', value: 'Conductivity' },
  { label: '溶解氧', value: 'DissolvedOxygen' },
  { label: '余氯', value: 'ResidualChlorine' },
  { label: '酸碱度', value: 'PH' },
  { label: '水温', value: 'WaterTemperature' }
];
/* 时间间隔 */
export const periodOptions = [
  // {
  //   label: '1分钟',
  //   value: 'MINUTES,1'
  // },
  // {
  //   label: '5分钟',
  //   value: 'MINUTES,5'
  // },
  // {
  //   label: '15分钟',
  //   value: 'MINUTES,15'
  // },
  {
    label: '30分钟',
    value: 'MINUTES,30'
  },
  {
    label: '1小时',
    value: 'HOURS,1'
  }
];

/* 能效时间间隔 */
export const periodEnergyOptions = [
  {
    label: '15分钟',
    value: 'MINUTES,15'
  },
  {
    label: '30分钟',
    value: 'MINUTES,30'
  },
  {
    label: '1小时',
    value: 'HOURS,1'
  }
];

/* 水电量时间间隔 */
export const periodWaterElecOptions = [
  {
    label: '15分钟',
    value: 'MINUTES,15'
  },
  {
    label: '30分钟',
    value: 'MINUTES,30'
  },
  {
    label: '1小时',
    value: 'HOURS,1'
  }
];

/* 底行数据 */
export const bottomRows = [
  {
    title: '最小值',
    dataIndex: 'min',
    width: 90,
    align: 'center',
    fixed: 'right',
    ellipsis: true,
    customRender: text => {
      return text || '--';
    }
  },
  {
    title: '最小值时间',
    dataIndex: 'minDateTime',
    width: 120,
    align: 'center',
    fixed: 'right',
    ellipsis: true,
    customRender: text => {
      return text || '--';
    }
  },
  {
    title: '最大值',
    dataIndex: 'max',
    width: 90,
    align: 'center',
    fixed: 'right',
    ellipsis: true,
    customRender: text => {
      return text || '--';
    }
  },
  {
    title: '最大值时间',
    dataIndex: 'maxDateTime',
    width: 120,
    align: 'center',
    fixed: 'right',
    ellipsis: true,
    customRender: text => {
      return text || '--';
    }
  },
  {
    title: '平均值',
    dataIndex: 'avg',
    width: 90,
    align: 'center',
    fixed: 'right',
    ellipsis: true,
    customRender: text => {
      return text || '--';
    }
  }
];

export const pumpLevelName = 'pumpLevel';
export const deviceLevelName = 'deviceLevel';
export const downMessage = '导出文件生成中,请稍后';

export const fields = [
  {
    name: 'waterPlantId',
    label: '选择污水厂',
    type: 'select',
    placeholder: '请选择',
    colon: true,
    options: [],
    span: 4,
    attrs: {
      allowClear: true
    },
    value: undefined,
    listeners: { change: null }
  },
  {
    name: 'keywords',
    label: '标题',
    type: 'input',
    placeholder: '请输入',
    colon: true,
    listeners: { pressEnter: null },
    span: 4
  },
  {
    name: 'reportType',
    label: '报表类型',
    type: 'select',
    placeholder: '请选择',
    colon: true,
    options: [],
    span: 4,
    attrs: {
      allowClear: true
    },
    value: '',
    listeners: { change: null }
  },
  {
    name: 'searchTimer',
    label: '选择日期',
    type: 'date-range',
    colon: true,
    span: 8,
    value: ['', ''],
    placeholder: ['开始时间', '结束时间'],
    attrs: {
      format: 'YYYY-MM-DD'
    }
  }
];

export const columns = [
  {
    title: '污水厂名称',
    dataIndex: 'waterPlantId',
    width: 150,
    ellipsis: true
  },
  {
    title: '标题',
    dataIndex: 'title',
    width: 200,
    ellipsis: true
  },
  {
    title: '处理状态',
    dataIndex: 'dealFlag',
    width: 150
  },
  {
    title: '报表类型',
    dataIndex: 'reportTypeName',
    width: 150
  },
  {
    title: '模板名称',
    dataIndex: 'templateTypeName',
    width: 150,
    ellipsis: true
  },
  {
    title: '生成/接收时间',
    dataIndex: 'time',
    width: 220
  },
  {
    title: '操作',
    dataIndex: 'action',
    type: 'action',
    width: 150,
    align: 'center',
    events: [{ key: 'detail', name: '详情' }]
  }
];

// 能耗报表
export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 5
  },
  {
    label: '选择日期',
    name: 'rangeTime',
    type: 'rangePicker',
    placeholder: ['开始日期', '结束日期'],
    show: true,
    span: 6,
    attrs: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm',
      disabledDate: function(current) {
        return (
          current &&
          current >
            moment()
              .subtract(1, 'days')
              .endOf('day')
        );
      }
    }
  },
  {
    label: '间隔',
    name: 'queryType',
    type: 'select',
    show: true,
    span: 3,
    options: [
      { label: '分钟', value: 'minute', timeEnum: 'MINUTES' },
      { label: '小时', value: 'hour', timeEnum: 'MINUTES' },
      { label: '天', value: 'day', timeEnum: 'MINUTES' },
      { label: '月', value: 'month', timeEnum: 'MINUTES' },
      { label: '年', value: 'year', timeEnum: 'MINUTES' }
    ]
  }
];

export const powerColumns = [
  {
    title: '位置',
    dataIndex: 'locationName',
    key: 'locationName',
    width: 140,
    ellipsis: true
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 180,
    ellipsis: true
  },
  {
    title: '起始电能(kwh)',
    dataIndex: 'startValue',
    key: 'startValue',
    width: 160,
    ellipsis: true
  },
  {
    title: '结束电能(kwh)',
    dataIndex: 'endValue',
    key: 'endValue',
    width: 160,
    ellipsis: true
  },
  {
    title: '总用电量(kwh)',
    dataIndex: 'totalValue',
    key: 'totalValue',
    width: 160,
    ellipsis: true
  },
  {
    title: '合计(kwh)',
    dataIndex: 'totalEnergy',
    key: 'totalEnergy',
    width: 160,
    ellipsis: true
  }
];

// 图表颜色
export const _colors = [
  '#9D91EB',
  '#29CDCF',
  '#3276FD',
  '#CCDC8A',
  '#03A3A7',
  '#946DFF',
  '#2FB8FC',
  '#406C85',
  '#30D4AC',
  '#73A4D7'
];

// 水电量图表配置项
export const flowPowerOption = {
  tooltip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    trigger: 'axis',
    confine: true
  },
  axisPointer: {
    link: { xAxisIndex: 'all' },
    label: {
      backgroundColor: '#777'
    }
  },
  grid: [
    {
      left: '8%',
      right: '4%',
      bottom: '12%',
      top: '18%',
      containLabel: false
    }
  ],
  legend: {
    type: 'scroll',
    x: 'right',
    top: '7%'
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      scale: true,
      boundaryGap: false,
      axixTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(222,226,231,0.7)'
        },
        show: true
      },
      splitLine: {
        show: false
      },
      min: 'dataMin',
      max: 'dataMax',
      axisPointer: {
        z: 100
      }
    }
  ],
  yAxis: [
    {
      nameTextStyle: {
        align: 'right',
        color: '#969999'
      },
      axixTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(222,226,231,0.7)'
        },
        show: true
      },
      splitLine: {
        show: true
      },
      axisLabel: {
        formatter: function(value, index) {
          return value;
        }
      }
    },
    {
      position: 'right',

      axisLabel: {
        show: false
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#DEE2E7'
        }
      },
      //分割线/网格
      splitLine: {
        show: false //是否显示网格
      }
    }
  ],

  title: [],
  series: []
};
