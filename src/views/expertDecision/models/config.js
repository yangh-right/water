/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-06-15 09:05:37
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-07-04 11:00:55
 * @Description:
 */
import moment from 'moment';
import { handleConfig } from '@/components/SearchTable/util';
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
      {
        name: 'alarmLevels',
        type: 'select',
        label: '预警等级',
        placeholder: '请选择',
        attrs: { mode: 'multiple', maxTagCount: 1 },
        options: [],
        colon: true
      },
      {
        name: 'confirmStatus',
        type: 'select',
        label: '方案采纳',
        attrs: { allowClear: true },
        placeholder: '请选择',
        options: [],
        colon: true
      },
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
        dataIndex: 'alarmName'
      },
      {
        title: '预警状态',
        ellipsis: true,
        align: 'center',
        width: 60,
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
      },
      {
        title: '采纳率',
        ellipsis: true,
        width: 75,
        align: 'center',
        dataIndex: 'adoptionRate',
        customRender: (text, row, index) => {
          return text == null ? '未采纳' : text + '%';
        }
      }
    ]
  };
  handleConfig(config);
  return config;
}
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
        bottom: '12px',
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
      class: ['supply-flex-1'],
      children: [
        {
          slots: ['table'],
          style: { width: '500px' }
        },
        {
          class: ['supply-flex-1', 'supply-flex-col'],
          children: [
            {
              class: ['supply-flex-1'],
              children: [
                {
                  slots: ['bar'],
                  style: { width: '50%' }
                },
                {
                  slots: ['pie'],
                  class: ['supply-flex-1']
                }
              ]
            },
            {
              class: ['supply-mt-3', 'supply-h-1/2'],
              slots: ['solution'],
            }
          ]
        }
      ]
    }
  ]
};
