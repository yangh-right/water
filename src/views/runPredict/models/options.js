/*
 * @Author: wangyr
 * @Date: 2023-07-01 17:30:53
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-30 15:48:18
 * @Description:
 */
export const inWaterOption = {
  grid: [
    {
      left: '8%',
      right: '8%',
      top: '6%',
      bottom: '9%',
      containLabel: true
    }
  ],
  color: ['#65dbb1', 'rgb(43, 222, 171)', 'rgb(40, 214, 254)'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      axisLine: {
        lineStyle: { color: 'rgb(222, 226, 231)' },
        show: true
      },
      axisLabel: {
        rotate: -40,
        margin: 8
      },
      data: []
    }
  ],
  yAxis: [
    {
      axisLine: {
        lineStyle: { color: 'rgb(222, 226, 231)' },
        show: true
      },
      type: 'value',
      name: ''
    }
  ],
  series: []
};
export const sludgeOption = {
  grid: [
    {
      left: '8%',
      right: '12%',
      top: '12%',
      bottom: '9%',
      containLabel: true
    }
  ],
  color: ['#65dbb1', 'rgb(43, 222, 171)', 'rgb(40, 214, 254)'],
  legend: {
    type: 'scroll',
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      name: 'mg/L',
      nameTextStyle: {
        // padding: [10, 0 ,0 ,0],
        color: '#999'
      },
      type: 'value',
      axisLine: {
        lineStyle: { color: 'rgb(222, 226, 231)' },
        show: true
      },
      axisLabel: {},
      data: []
    }
  ],
  yAxis: [
    {
      name: '通量kg/(m2.d)',
      nameTextStyle: {
        color: '#999',
        padding: [0, 0, 0, 22]
      },
      axisLine: {
        lineStyle: { color: 'rgb(222, 226, 231)' },
        show: true
      },
      min: 0,
      type: 'value'
    }
  ],
  series: []
};
export const runTypeList = [
  { label: '', name: '', value: '1' },
  { label: '', name: '', value: '2' },
  { label: '现工况', name: '现工况', value: '3' }
];
export const runSearchForm = {
  waterPlantId: '',
  modelId: ''
};
export const runFields = [];
export const dosingFields = [];
export const sludgeFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true
  }
];
export const headerFields = [
  {
    label: '模型名称',
    name: 'modelName',
    type: 'input',
    placeholder: '请输入模型名称',
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    show: true,
    attrs: {
      allowClear: true
    },
    isCommonScreen: true
  },
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    type: 'select',
    show: true,
    isCommonScreen: true
  },
  {
    name: 'action',
    type: 'input',
    wrapperCol: { span: 24 },
    span: 12,
    show: true
  }
];
export const searchForm = {
  waterPlantId: '',
  modelName: '',
  currentPage: 1,
  pageSize: 20,
  total: 0
};

export const schemeColumns = [
  {
    title: '方案名称',
    dataIndex: 'optionName',
    key: 'optionName',
    width: 150,
    ellipsis: true
  },
  {
    title: '模型名称',
    dataIndex: 'modelName',
    key: 'modelName',
    width: 150,
    ellipsis: true
  },
  {
    title: '污水厂名称',
    dataIndex: 'waterPlantId',
    key: 'waterPlantId',
    width: 150,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
    ellipsis: true
  },
  {
    title: '创建人',
    dataIndex: 'createName',
    key: 'createName',
    width: 120,
    ellipsis: true
  },
  {
    title: '操作',
    width: 120,
    type: 'action',
    fixed: 'right',
    events: [
      {
        key: 'handleDelete',
        name: '删除'
      }
    ]
  }
];
export const configColumns = [
  {
    title: '模型名称',
    dataIndex: 'modelName',
    key: 'modelName',
    fixed: true,
    width: 150,
    ellipsis: true
  },
  {
    title: '模型编号',
    dataIndex: 'modelCode',
    key: 'modelCode',
    width: 150,
    ellipsis: true
  },
  {
    title: '模型类型',
    dataIndex: 'modelTypeCode',
    key: 'modelTypeCode',
    width: 150,
    ellipsis: true
  },
  {
    title: '污水厂名称',
    dataIndex: 'waterPlantId',
    key: 'waterPlantId',
    width: 150,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
    ellipsis: true
  },
  {
    title: '操作',
    width: 160,
    type: 'action',
    fixed: 'right',
    events: [
      {
        key: 'handleEdit',
        name: '编辑'
      },
      {
        key: 'handleDelete',
        name: '删除'
      }
    ]
  }
];
export const outWaterOption = {
  grid: [
    {
      left: '8%',
      right: '8%',
      top: '10%',
      bottom: '10%',
      containLabel: true
    }
  ],
  color: ['#efa14f', '#648de4'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
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
      name: '',
      data: [],
      smooth: true,
      type: 'line'
    },
    {
      name: '预测量',
      data: [],
      smooth: true,
      type: 'line'
    }
  ]
};
export const mlssOption = {
  grid: [
    {
      left: '8%',
      right: '8%',
      top: '10%',
      bottom: '30',
      containLabel: true
    }
  ],
  color: ['#648de4', '#65dbb1', '#efa14f'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
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
      name: 'mg/L'
    }
  ],
  series: [
    {
      name: 'MLSS',
      data: [],
      smooth: true,
      type: 'line'
    },
    {
      name: 'MLSS实时',
      data: [],
      smooth: true,
      type: 'line'
    },
    {
      name: 'MLVSS',
      data: [],
      smooth: true,
      type: 'line'
    }
  ]
};
export const waterTempOption = {
  grid: [
    {
      left: '8%',
      right: '8%',
      top: '10%',
      bottom: '30',
      containLabel: true
    }
  ],
  color: ['#648de4', '#65dbb1'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
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
      //    type: 'value',
      name: 'mg/L'
    }
  ],
  series: [
    {
      name: 'DO/水温',
      data: [],
      type: 'line',
      smooth: true
    },
    {
      name: '预测量',
      data: [],
      type: 'line',
      smooth: true
    }
  ]
};
