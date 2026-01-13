export const typeFields = [
  {
    label: '成本类型名称',
    name: 'nameLike',
    type: 'input',
    placeholder: '请输入成本类型名称',
    listeners: {}
  }
];

export const typeColumns = [
  {
    title: '成本类型名称',
    dataIndex: 'name',
    ellipsis: true,
    width: 150
  },
  {
    title: '计量单位',
    dataIndex: 'unit',
    ellipsis: true,
    width: 150
  },
  {
    title: '成本金额单价',
    dataIndex: 'costSum',
    ellipsis: true,
    width: 150
  },
  {
    title: '关联成本点',
    dataIndex: 'num',
    ellipsis: true,
    width: 100
  },
  {
    title: '修改人',
    dataIndex: 'updateUser',
    ellipsis: true,
    width: 150
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime',
    type: 'datetime',
    ellipsis: true,
    width: 200
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    ellipsis: true,
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    type: 'datetime',
    ellipsis: true,
    width: 200
  },
  {
    title: '操作',
    dataIndex: 'action',
    ellipsis: true,
    width: 200,
    fixed: 'right'
  }
];

export const pointFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'input'
  },
  {
    label: '成本类型',
    name: 'costTypeIds',
    type: 'tree-select',
    placeholder: '请选择成本类型',
    attrs: {
      treeData: [],
      treeNodeFilterProp: 'title',
      treeCheckable: true,
      showCheckedStrategy: 'SHOW_ALL',
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
  },
  {
    label: '成本点名称',
    name: 'nameLike',
    type: 'input',
    placeholder: '请输入成本点名称',
    listeners: {}
  }
];

export const pointColumns = [
  {
    title: '污水厂名称',
    dataIndex: 'waterPlantId',
    width: 150,
    ellipsis: true
  },
  {
    title: '成本点名称',
    dataIndex: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '计算类型',
    dataIndex: 'calculateType',
    width: 150,
    ellipsis: true
  },
  {
    title: '所属成本类型',
    dataIndex: 'costTypeId',
    width: 200,
    ellipsis: true
  },
  {
    title: '计算区域',
    dataIndex: 'placeId',
    width: 150,
    ellipsis: true
  },
  {
    title: '计算方式',
    dataIndex: 'calculation',
    width: 200,
    ellipsis: true
  },
  {
    title: '修改人',
    dataIndex: 'updateUser',
    ellipsis: true,
    width: 150
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime',
    type: 'datetime',
    ellipsis: true,
    width: 200
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    ellipsis: true,
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    type: 'datetime',
    ellipsis: true,
    width: 200
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 100
  }
];

// 新增成本点表单选项配置
export const defaultPointRules = {
  calculateType: [{ required: true, message: '请选择计算类型' }],
  costTypeId: [{ required: true, message: '请选择所属成本类型' }],
  waterPlantId: [{ required: true, message: '请选择污水厂' }],
  calculation: [{ required: true, message: '请选择计算方式' }],
  entryMode: [{ required: true, message: '请选择录入方式' }],
  pointId: [{ required: true, message: '请填写计算公式' }],
  interfaceName: [
    { required: true, message: '请填写接口名称' },
    { max: 50, message: '请填写正确的接口名称' }
  ],
  requestMethod: [{ required: true, message: '请选择请求方法' }],
  parameters: [{ required: true, message: '请填写请求参数' }],
  url: [
    { required: true, message: '请填写接口地址' },
    { max: 500, message: '请填写正确的接口地址' }
  ]
};

// export const entryOptions = [
//   { title: "按次", value: "0" },
//   { title: "按月", value: "1" },
//   { title: "按年", value: "2" },
// ];

export const reqMethodOptions = [
  { title: 'Get', value: '0' },
  { title: 'Post', value: '1' },
  { title: 'Put', value: '2' },
  { title: 'Delete', value: '3' }
];
