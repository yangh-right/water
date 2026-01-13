/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-06-15 09:05:37
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-19 11:29:15
 * @Description:
 */
import moment from 'moment';
import { handleConfig } from '@/components/SearchTable/util';
export const processConfig = [
  {
    name: '一二期',
    key: 'processList1',
    waterPlantType: 0
  },
  {
    name: '三期',
    key: 'processList2',
    waterPlantType: 1
  }
];
export const confirmStatusList = [
  {
    label: '是',
    value: 1
  },
  {
    label: '否',
    value: 0
  }
];
export const alarmLevelsList = [
  {
    label: '一级',
    value: '1'
  },
  {
    label: '二级',
    value: '2'
  },
  {
    label: '三级',
    value: '3'
  },
  {
    label: '四级',
    value: '4'
  }
];
export function getContractRetrievalConfig(_this) {
  const config = {
    searchFields: [
      // {
      //   name: 'confirmStatus',
      //   type: 'select',
      //   label: '方案采纳',
      //   attrs: { allowClear: true },
      //   placeholder: '请选择',
      //   options: [],
      //   colon: true
      // },
      {
        name: 'date',
        type: 'range-picker',
        label: '预警时间',
        span: 6,
        placeholder: ['开始时间', '结束时间'],
        options: [],
        attrs: {
          disabledDate: current => {
            return current && current > moment().endOf('day');
          }
        },
        listeners: {}
      },
      {
        name: 'keyWord',
        type: 'input',
        label: '模糊查询',
        placeholder: '请输入',
        options: [],
        listeners: {},
        colon: true
      },
      {
        label: '预警状态',
        name: 'status',
        type: 'select',
        listeners: {
          change: _this.statusChange
        },
        options: [
          { label: '全部', value: '' },
          { label: '预警中', value: 1 },
          { label: '已结束', value: 0 }
        ],
        placeholder: '请选择',
        span: 4
      }
    ],
    initColumns: [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        align: 'center',
        width: 40,
        customRender: (text, row, index) => {
          return index + 1;
        }
      },
      {
        title: '预警名称',
        ellipsis: true,
        width: 85,
        dataIndex: 'alarmName',
        scopedSlots: { customRender: 'alarmName' }
      },
      {
        title: '预警状态',
        ellipsis: true,
        align: 'center',
        filters: [
          {
            text: '预警中',
            value: 1
          },
          {
            text: '已结束',
            value: 0
          }
        ],
        filteredValue: [],
        defaultFilteredValue: [],
        width: 88,
        dataIndex: 'alarmStatus',
        scopedSlots: { customRender: 'alarmStatus' }
      },
      {
        title: '预警时间',
        ellipsis: true,
        align: 'center',
        width: 130,
        dataIndex: 'startTime',
        scopedSlots: { customRender: 'startTime' }
      }
      // {
      //   title: '历史数据',
      //   ellipsis: true,
      //   align: 'center',
      //   width: 60,
      //   dataIndex: 'history',
      //   scopedSlots: { customRender: 'history' }
      // }
      // {
      //   title: '采纳率',
      //   ellipsis: true,
      //   width: 75,
      //   align: 'center',
      //   dataIndex: 'adoptionRate',
      //   customRender: (text, row, index) => {
      //     return text == null ? '未采纳' : text + '%';
      //   }
      // }
    ]
  };
  handleConfig(config);
  return config;
}
export function handlePointName(str) {
  return str?.replace(/NH3N/g, 'NH₃-N') || str;
}
export const inWaterOption = {
  ...genCommonOption(),

  color: ['#2F7FFF', '#2BDEAB'],
  series: [
    {
      data: [],
      type: 'line',
      smooth: true
    }
  ]
};
export const pointOption = {
  ...genCommonOption(),

  color: ['#2F7FFF', '#2BDEAB'],
  series: [
    {
      data: [],
      type: 'line',
      smooth: true
    }
  ]
};
export const warnDiagnosisOption = {
  ...genCommonOption(),

  color: ['#2F7FFF', '#2BDEAB'],
  series: [
    {
      data: [],
      type: 'line',
      smooth: true
    }
  ]
};
export function genPointOption(config = {}) {
  return {
    ...genCommonOption(config),
    legend: {
      show: true,
      top: 6,
      right: 0,
      icon: 'rect',
      itemHeight: 2,
      itemWidth: 12
    },
    color: ['#2F7FFF', '#2BDEAB'],
    series: [
      {
        name: '',
        data: [],
        type: 'line',
        smooth: true
      }
    ]
  };
}
export function genInWaterOption(config = {}) {
  return {
    ...genCommonOption(config),
    color: ['#2F7FFF', '#2BDEAB'],
    series: [
      {
        name: config.seriesName,
        data: config.yData || [],
        type: 'line',
        smooth: true
      }
    ]
  };
}
export const adoptionStatisticsOption = {
  ...genCommonOption(),
  color: ['#2F7FFF', '#2BDEAB'],
  series: [
    {
      data: [],
      type: 'line',
      smooth: true
    }
  ]
};
export function genCommonOption(config = {}) {
  return {
    grid: [
      {
        left: '16px',
        right: '12px',
        top: '40px',
        bottom: '0px',
        containLabel: true
      }
    ],
    legend: {
      show: true,
      top: 6,
      right: 6,
      icon: 'rect',
      itemHeight: 2,
      itemWidth: 12
    },
    tooltip: {
      appendToBody: true,
      confine: false,
      trigger: 'axis'
    },
    xAxis: [
      {
        axisLabel: {
          // color: '#8C99A6',
          formatter: config.xAxisLabelFormat
        },
        axisLine: {
          show: false,
          lineStyle: {
            // color: "#354050"
          }
        },
        data: config.xData || []
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: config.yAxisName || '',
        splitLine: {
          lineStyle: {
            // color: '#141618'
          }
        },
        axisLabel: {
          // color: '#8C99A6'
        },
        nameTextStyle: {
          align: 'right'
          // color: '#8C99A6',
        }
      }
    ]
  };
}
export const config = {
  class: ['supply-flex-col'],
  children: [
    {
      slots: ['form']
    },
    {
      class: ['supply-flex-1', 'supply-flex-col'],
      children: [
        {
          class: ['supply-flex-1'],
          children: [
            {
              slots: ['chart1'],
              class: ['supply-flex-1']
            },
            {
              slots: ['chart2'],
              class: ['supply-flex-1']
            },
            {
              slots: ['chart3'],
              class: ['supply-flex-1']
            },
            {
              slots: ['chart4'],
              class: ['supply-flex-1']
            }
          ]
        },
        {
          class: ['supply-mt-3'],
          style: { height: '60%' },
          children: [
            {
              slots: ['table'],
              style: { width: '549px' }
            },
            {
              class: ['supply-flex-1'],
              slots: ['decision']
            }
          ]
        }
      ]
    }
  ]
};
export const themeConfigMap = {
  default: {
    panel: 'panel',
    date: 'date',
    steer: 'steer',
    title: 'title',
    timeBg: '#ffffff66'
  },
  dark: {
    panel: 'panel_dark',
    date: 'date',
    steer: 'steer',
    title: 'title',
    timeBg: '#383D43'
  },
  green: {
    panel: 'panel_green',
    date: 'date_green',
    steer: 'steer_green',
    title: 'title_green',
    timeBg: '#ffffff66'
  },
  red: {
    panel: 'panel_red',
    date: 'date_red',
    steer: 'steer_red',
    title: 'title_red',
    timeBg: '#ffffff66'
  }
};
let imageKeys = ['panel', 'date', 'steer', 'title'];
Object.values(themeConfigMap).forEach(theme => {
  Object.keys(theme).forEach(key => {
    if (imageKeys.includes(key)) {
      theme[key] = require(`@/assets/images/modules/expertDecision/${theme[key]}.png`);
    }
  });
});
