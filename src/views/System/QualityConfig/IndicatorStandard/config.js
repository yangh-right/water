import { max50 } from '@/utils/validator';
export const operatorsDict = {
  null: '',
  eq: '=',
  gt: '>',
  lt: '<',
  ge: '≥',
  le: '≤',
  ne: '≠',
  bt: '介于',
  nb: '非介于',
  in: '包含',
  ni: '不包含'
};
export const fieldsList = [
  {
    search: true,
    name: 'waterPlantId',
    type: 'select',
    span: 8,
    label: '选择污水厂'
  },
  {
    label: '构筑物名称',
    name: 'structureIds',
    type: 'select',
    options: [],
    placeholder: '不限',
    attrs: {
      filterOption: (input, option) => {
        return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        );
      },
      maxTagCount: 2,
      maxTagTextLength: 2,
      showSearch: true,
      mode: 'multiple'
    },

    span: 8
  },

  {
    label: '指标名称',
    name: 'indexIds',
    type: 'select',
    options: [],
    placeholder: '不限',
    attrs: {
      filterOption: (input, option) => {
        return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        );
      },
      maxTagCount: 2,
      maxTagTextLength: 2,
      showSearch: true,
      mode: 'multiple'
    },

    span: 8
  }
];

export const columns = data => {
  return [
    {
      title: '指标',
      dataIndex: 'indexName',
      ellipsis: true,
      fixed: 'left',
      width: 100
    },
    {
      title: '构筑物',
      dataIndex: 'structureName',
      fixed: 'left',
      ellipsis: true,
      width: 100
    },
    {
      title: '点位',
      dataIndex: 'pointLocation',
      ellipsis: true,
      fixed: 'left',
      width: 100
    },
    {
      title: `${data.factory_standard}/预警`,
      ellipsis: true,
      dataIndex: 'warn'
    },
    {
      title: `${data.national_standard}/限值`,
      ellipsis: true,
      dataIndex: 'limit'
    },
    {
      title: '监测量',
      dataIndex: 'pointNum',
      ellipsis: true,
      width: 100
    },
    {
      title: '采样点',
      dataIndex: 'samplingPointNum',
      ellipsis: true,
      width: 100
    },
    { title: '更新人', dataIndex: 'updateUser', ellipsis: true, width: 100 },
    { title: '更新时间', width: 200, ellipsis: true, dataIndex: 'updateTime', type: 'datetime' },
    { title: '创建人', dataIndex: 'createUser', ellipsis: true, width: 100 },
    { title: '创建时间', width: 200, ellipsis: true, dataIndex: 'createTime', type: 'datetime' },
    {
      title: '启用',
      dataIndex: 'validFlag',
      fixed: 'right',
      type: 'switch',
      width: 120
    },
    {
      title: '操作',
      dataIndex: 'action',
      type: 'action',
      fixed: 'right',
      events: [
        { key: 'delete', name: '删除' },
        { key: 'edit', name: '编辑' },
        { key: 'detail', name: '+采样点/监测量' }
      ]
    }
  ];
};

export const modalField = [
  {
    name: 'indexId',
    label: '水质指标',
    placeholder: '请选择',
    type: 'select',
    options: [],
    rules: [{ required: true, message: '请选择水质指标' }],
    span: 24,
    wrapperCol: { span: 18 }
  },
  {
    name: 'placeId',
    label: '构筑物',
    placeholder: '请选择',
    type: 'select',
    options: [],
    rules: [{ required: true, message: '请选择水质控制标准的构筑物' }],
    span: 24,
    wrapperCol: { span: 18 }
  },
  {
    name: 'pointLocation',
    label: '点位',
    type: 'input',
    placeholder: '请填写指标名称',
    span: 24,
    rules: [
      { required: true, message: '请填写控制标准对应的点位' },
      { validator: max50, trigger: 'change' }
    ],
    wrapperCol: { span: 18 }
  },
  {
    name: 'factory',
    label: '内控/预警',
    type: 'input',
    span: 24,
    wrapperCol: { span: 18 }
  },
  {
    name: 'national',
    label: '设计/限制',
    type: 'input',
    span: 24,
    wrapperCol: { span: 18 }
  }
];

export const samplingColums = [
  {
    title: '选择',
    dataIndex: 'check',
    scopedSlots: { customRender: 'check' },
    width: 70
  },
  {
    title: '采样点名称',
    dataIndex: 'samplingPoint',
    width: 100,
    ellipsis: true
  },
  {
    title: '详细位置',
    dataIndex: 'samplingPointLocation',
    ellipsis: true,
    width: 150
  }
];

export const monitorColums = [
  {
    title: '全选',
    dataIndex: 'check',
    scopedSlots: { customRender: 'check' },
    cusTitle: false,
    width: 50
  },
  {
    title: '关联设备名称',
    dataIndex: 'deviceName',
    width: 150,
    ellipsis: true
  },
  {
    title: '监测位置',
    dataIndex: 'place',
    width: 100,
    ellipsis: true
  },
  {
    title: '监测量别名/编号',
    dataIndex: 'coding',
    scopedSlots: { customRender: 'coding' },
    width: 120
  },
  {
    title: '监测量名称',
    dataIndex: 'pointMemo',
    width: 150,
    ellipsis: true
  },
  {
    title: '监测量类型',
    dataIndex: 'pointTypeName',
    width: 100,
    ellipsis: true
  },
  {
    title: '代码',
    dataIndex: 'pointCode',
    width: 100,
    ellipsis: true
  }
];

export const modalMonitorField = [
  {
    name: 'keywords',
    label: '监测量关键词',
    placeholder: '别名/编号/名称/代码',
    type: 'input',
    span: 8,
    wrapperCol: { span: 14 }
  },
  {
    name: 'pointTypeName',
    label: '监测量类型',
    placeholder: '请选择',
    type: 'select',
    span: 8,
    options: [],
    wrapperCol: { span: 14 }
  }
];
export const modalStandardColums = [
  {
    title: '采样点',
    ellipsis: true,
    dataIndex: 'samplingPoint',
    width: 150
  },
  {
    title: '详细位置',
    ellipsis: true,
    dataIndex: 'samplingPointLocation',
    width: 220
  },
  {
    title: '匹配的监测量',
    ellipsis: true,
    dataIndex: 'point'
  },
  {
    title: '监测位置',
    ellipsis: true,
    dataIndex: 'pointLocation'
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    scopedSlots: {
      customRender: 'action'
    }
  }
];

export const modalStandardColums2 = [
  {
    title: '监测量',
    ellipsis: true,
    dataIndex: 'point'
  },
  {
    title: '监测位置',
    ellipsis: true,
    dataIndex: 'pointLocation'
  },
  {
    title: '操作',
    dataIndex: 'action',
    type: 'action',
    fixed: 'right',
    events: [{ key: 'deleteMonintor', name: '删除监测量' }]
  }
];
