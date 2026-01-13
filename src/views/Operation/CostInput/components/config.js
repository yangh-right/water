export const costFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select'
  },
  {
    label: '成本类型',
    name: 'costTypeIdList',
    type: 'tree-select',
    placeholder: '请选择成本类型',
    attrs: {
      showSearch: true,
      treeData: [],
      treeCheckable: true,
      treeNodeFilterProp: 'title',
      maxTagCount: 3,
      showCheckedStrategy: 'SHOW_PARENT',
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
    name: 'costPlaceNameLike',
    type: 'input',
    placeholder: '请输入成本点名称',
    listeners: {}
  }
];

export const costColumns = [
  {
    title: '污水厂名称',
    dataIndex: 'waterPlantId',
    ellipsis: true,
    width: 120
  },
  {
    title: '成本点名称',
    dataIndex: 'costPlaceName',
    ellipsis: true,
    width: 160
  },
  {
    title: '计算类型',
    dataIndex: 'type',
    ellipsis: true,
    width: 100
  },
  {
    title: '成本类型',
    dataIndex: 'costTypeName',
    ellipsis: true,
    width: 150
  },
  {
    title: '计算对象',
    dataIndex: 'structureName',
    ellipsis: true,
    width: 150
  },
  {
    title: '成本发生时间',
    dataIndex: 'entryTime',
    ellipsis: true,
    width: 160
  },
  {
    title: '成本消耗',
    dataIndex: 'num',
    ellipsis: true,
    width: 150
  },
  {
    title: '成本金额',
    dataIndex: 'cost',
    ellipsis: true,
    width: 150
  },
  {
    title: '录入人',
    dataIndex: 'createUser',
    ellipsis: true,
    width: 120
  },
  {
    title: '录入时间',
    dataIndex: 'createTime',
    type: 'datetime',
    ellipsis: true,
    width: 160
  },
  {
    title: '操作',
    dataIndex: 'action',
    type: 'action',
    width: 120,
    fixed: 'right'
  }
];

export const costRules = {
  costPlaceId: [{ required: true, message: '请选择成本点' }],
  entryTime: [{ required: true, message: '请选择成本发生时间' }],
  calculateType: [{ required: true, message: '需要计算类型' }],
  entryNum: [
    { required: true, message: '请填写录入数值' },
    {
      validator: (rules, value, cb) => {
        if (value > 0) cb();
        else cb(new Error('请输入正确的录入数值'));
      },
      trigger: ['change', 'blur']
    }
  ]
};
