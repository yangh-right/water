/*
  包含配置：
  1.搜索头部及表头
  2.新增/编辑弹窗中表格内容及验证条件
  3.新增/编辑接口地址
*/

export const headerLayout = {
  span: 6,
  colon: true,
  labelAuto: true,
  wrapperCol: { span: 18 }
};

// 采样点
export const pointFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select'
  },
  {
    label: '构筑物名称',
    name: 'structureIdList',
    type: 'tree-select',
    submit: true,
    info: true,
    placeholder: '请选择构筑物',
    attrs: {
      showSearch: true,
      treeData: [],
      treeCheckable: true,
      treeNodeFilterProp: 'title',
      maxTagCount: 2,
      replaceFields: {
        title: 'name',
        key: 'id',
        value: 'id'
      },
      'dropdown-style': {
        maxHeight: '300px',
        overflow: 'auto'
      }
    }
  }
];

export const pointColumns = [
  {
    title: '采样点名称',
    dataIndex: 'name',
    ellipsis: true,
    width: 150
  },
  {
    title: '详细位置',
    dataIndex: 'place',
    ellipsis: true,
    width: 200
  },
  {
    title: '化验指标',
    dataIndex: 'testQuota',
    ellipsis: true,
    width: 150
  },
  {
    title: '更新人',
    dataIndex: 'updateUser',
    ellipsis: true,
    width: 100
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    type: 'datetime',
    ellipsis: true,
    width: 200
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    ellipsis: true,
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    type: 'datetime',
    ellipsis: true,
    width: 170
  },
  {
    title: '是否启用',
    dataIndex: 'validFlag',
    align: 'center',
    type: 'switch',
    width: 100,
    fixed: 'right'
  },
  {
    title: '操作',
    dataIndex: 'action',
    type: 'action',
    ellipsis: true,
    fixed: 'right',
    width: 100,
    events: [
      { key: 'delete', name: '删除' },
      { key: 'edit', name: '编辑' }
    ]
  }
];

export const pointInfoColumns = [
  {
    title: '水质指标名称',
    dataIndex: 'name',
    ellipsis: true,
    width: 150
  },
  {
    title: '单位',
    dataIndex: 'unit',
    ellipsis: true,
    width: 150
  },
  {
    title: '化验频率',
    dataIndex: 'frequency',
    ellipsis: true,
    width: 150
  }
];

// 指标组合
export const quotaFields = [
  {
    label: '水质指标名称',
    name: 'nameLike',
    type: 'input',
    placeholder: '请输入水质指标名称',
    span: 16,
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
    listeners: {}
  }
];

export const quotaColumns = [
  {
    title: '指标名称',
    dataIndex: 'name',
    ellipsis: true,
    width: 200
  },
  {
    title: '指标单位',
    dataIndex: 'unit',
    ellipsis: true,
    width: 200
  },
  {
    title: '操作',
    dataIndex: 'action',
    type: 'action',
    ellipsis: true,
    fixed: 'right',
    width: 200,
    events: [{ key: 'delete', name: '移除指标' }]
  }
];

export const quotaInfoColumns = [
  {
    title: '水质指标名称',
    dataIndex: 'name',
    ellipsis: true,
    width: 150
  },
  {
    title: '单位',
    dataIndex: 'unit',
    ellipsis: true,
    width: 150
  }
];

// 采样容器
export const vectorFields = [
  {
    label: '关键字搜索',
    name: 'keywords',
    type: 'input',
    placeholder: '容器名称/容积',
    listeners: {}
  }
];

export const vectorColumns = [
  {
    title: '容器名称',
    dataIndex: 'name',
    ellipsis: true,
    width: 150
  },
  {
    title: '容器单位',
    dataIndex: 'containerUnit',
    ellipsis: true,
    width: 200
  },
  {
    title: '容积',
    dataIndex: 'volume',
    ellipsis: true,
    width: 150
  },
  {
    title: '容积单位',
    dataIndex: 'volumeUnit',
    ellipsis: true,
    width: 150
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
    width: 200
  },
  {
    title: '更新人',
    dataIndex: 'updateUser',
    ellipsis: true,
    width: 100
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    type: 'datetime',
    ellipsis: true,
    width: 200
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    ellipsis: true,
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    type: 'datetime',
    ellipsis: true,
    width: 200
  },
  {
    title: '是否启用',
    dataIndex: 'validFlag',
    align: 'center',
    type: 'switch',
    width: 100,
    fixed: 'right'
  },
  {
    title: '操作',
    dataIndex: 'action',
    type: 'action',
    ellipsis: true,
    fixed: 'right',
    width: 100,
    events: [
      { key: 'delete', name: '删除' },
      { key: 'edit', name: '编辑' }
    ]
  }
];

// 保存剂
export const preFields = [
  {
    label: '关键字搜索',
    name: 'keywords',
    type: 'input',
    placeholder: '保存剂名称',
    listeners: {}
  }
];

export const preColumns = [
  {
    title: '保存剂名称',
    dataIndex: 'name',
    ellipsis: true,
    width: 150
  },
  {
    title: '保存剂单位',
    dataIndex: 'unit',
    ellipsis: true,
    width: 200
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
    width: 200
  },
  {
    title: '更新人',
    dataIndex: 'updateUser',
    ellipsis: true,
    width: 100
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    type: 'datetime',
    ellipsis: true,
    width: 200
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    ellipsis: true,
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    type: 'datetime',
    ellipsis: true,
    width: 200
  },
  {
    title: '是否启用',
    dataIndex: 'validFlag',
    align: 'center',
    type: 'switch',
    width: 100,
    fixed: 'right'
  },
  {
    title: '操作',
    dataIndex: 'action',
    type: 'action',
    ellipsis: true,
    fixed: 'right',
    width: 100,
    events: [
      { key: 'delete', name: '删除' },
      { key: 'edit', name: '编辑' }
    ]
  }
];
function testPositiveNumer(rule, value, callback, msg) {
  if (value && !/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(value)) {
    callback(new Error(msg));
  } else {
    callback();
  }
}
// 新增/编辑弹窗
export const formDict = {
  Point: {
    name: undefined,
    waterPlantId: undefined,
    locationDict: undefined,
    detailedLocation: undefined
  },
  Composition: {
    name: undefined,
    waterPlantId: undefined,
    placeId: undefined,
    cycle: undefined
  },
  Vector: {
    name: undefined,
    containerUnit: undefined,
    detailedLocation: undefined
  },
  Preservatives: {
    name: undefined,
    unit: undefined,
    remark: undefined
  }
};

export const rulesDict = {
  Point: {
    name: [
      { required: true, message: '请填写采样点名称' },
      { max: 50, message: '请填写正确的采样点名称' }
    ],
    waterPlantId: [{ required: true, message: '请选择污水厂' }],
    locationDict: [{ required: true, message: '请选择采样地点' }],
    detailedLocation: [{ max: 100, message: '请填写正确的详细位置' }]
  },
  Composition: {
    name: [
      { required: true, message: '请填写组合名称' },
      { max: 50, message: '请填写正确的组合名称' }
    ],
    placeId: []
  },
  Vector: {
    name: [
      { required: true, message: '请填写采样容器名称' },
      { max: 50, message: '请填写正确的采样容器名称' }
    ],
    containerUnit: [{ required: true, message: '请选择容器数量单位' }],
    volume: [
      { required: true, message: '请填写容器容积' },
      {
        validator: (rule, value, callback) => {
          testPositiveNumer(rule, value, callback, '请填写正确的容器容积');
        },
        trigger: 'change'
      }
    ],
    volumeUnit: [{ required: true, message: '请选择容积单位' }],
    remark: [{ max: 500, message: '请填写正确的备注信息' }]
  },
  Preservatives: {
    name: [
      { required: true, message: '请填写保存剂名称' },
      { max: 50, message: '请填写正确的保存剂名称' }
    ],
    unit: [{ required: true, message: '请选择保存剂单位' }],
    remark: [{ max: 500, message: '请填写正确的备注信息' }]
  }
};

export const itemDict = {
  Point: [
    {
      label: '采样点名称',
      prop: 'name',
      type: 'input',
      placeholder: '请填写采样点名称'
    },
    {
      label: '选择污水厂',
      prop: 'waterPlantId',
      type: 'factory-select'
    },
    {
      label: '构筑物',
      prop: 'locationDict',
      type: 'tree-select',
      placeholder: '请选择构筑物',
      attrs: {
        showSearch: true,
        treeData: [],
        treeNodeFilterProp: 'title',
        'dropdown-style': {
          maxHeight: '300px',
          overflow: 'auto'
        }
      }
    },
    {
      label: '详细位置',
      prop: 'detailedLocation',
      type: 'textarea',
      placeholder: '请填写详细位置'
    }
  ],
  Composition: [
    {
      label: '组合名称',
      prop: 'name',
      type: 'input',
      attrs: {
        maxLength: 30
      },
      placeholder: '请填写组合名称'
    },
    {
      label: '选择污水厂',
      prop: 'waterPlantId',
      type: 'factory-select',
      attrs: {
        showAll: true
      }
    },
    {
      label: '构筑物',
      prop: 'placeId',
      type: 'select',
      placeholder: '请选择构筑物',
      attrs: {
        showSearch: true,
        optionFilterProp: 'title',
        options: []
      }
    }
  ],
  Vector: [
    {
      label: '容器名称',
      prop: 'name',
      type: 'input',
      placeholder: '请填写容器名称'
    },
    {
      label: '数量单位',
      prop: 'containerUnit',
      type: 'select',
      placeholder: '请选择容器数量单位',
      attrs: {
        showSearch: true,
        optionFilterProp: 'title',
        options: []
      }
    },
    {
      label: '容积',
      prop: 'volume',
      type: 'input-number',
      placeholder: '请填写容积'
    },
    {
      label: '容积单位',
      prop: 'volumeUnit',
      type: 'select',
      placeholder: '请选择容积单位',
      attrs: {
        showSearch: true,
        optionFilterProp: 'title',
        options: []
      }
    },
    {
      label: '备注',
      prop: 'remark',
      type: 'textarea',
      placeholder: '请填写备注'
    }
  ],
  Preservatives: [
    {
      label: '保存剂名称',
      prop: 'name',
      type: 'input',
      placeholder: '请填写保存剂名称'
    },
    {
      label: '保存剂单位',
      prop: 'unit',
      type: 'select',
      placeholder: '请选择保存剂单位',
      attrs: {
        showSearch: true,
        optionFilterProp: 'title',
        options: []
      }
    },
    {
      label: '备注',
      prop: 'remark',
      type: 'textarea',
      placeholder: '请填写备注'
    }
  ]
};

// 接口地址
export const apiDict = {
  Point: {
    add: '/samplingPoint/add',
    edit: '/samplingPoint/edit'
  },
  Composition: {
    add: '/indexCombination/add',
    edit: '/indexCombination/edit'
  },
  Vector: {
    add: '/samplingContainer/add',
    edit: '/samplingContainer/edit'
  },
  Preservatives: {
    add: '/conservant/add',
    edit: '/conservant/edit'
  }
};
