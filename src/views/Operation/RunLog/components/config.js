export const columns = [
  {
    title: '班次',
    dataIndex: 'shiftName',
    ellipsis: true,
    width: 150
  },
  {
    title: '值班时间',
    dataIndex: 'startDate',
    ellipsis: true,
    width: 250,
    scopedSlots: { customRender: 'startDate' }
  },
  {
    title: '值班人员',
    ellipsis: true,
    dataIndex: 'nameList'
  },
  {
    title: '污水厂名称',
    ellipsis: true,
    dataIndex: 'waterPlantId',
    type: 'factory'
  },
  {
    title: '填写人',
    ellipsis: true,
    dataIndex: 'createUser'
  },
  {
    title: '填写时间',
    ellipsis: true,
    dataIndex: 'createTime',
    type: 'datetime',
    width: 260
  },
  {
    title: '操作',
    width: 120,
    type: 'action',
    events: [
      {
        key: 'infoDetail',
        name: '查看详情'
      }
    ]
  }
];

export const basicFields = [
  {
    submit: true,
    required: true,
    colon: true,
    name: 'waterPlantId',
    label: '污水厂',
    type: 'input'
  },
  {
    submit: true,
    required: true,
    colon: true,
    name: 'onDutyDate',
    label: '值班日期',
    type: 'input'
  },
  {
    submit: true,
    required: true,
    colon: true,
    name: 'classId',
    label: '班次',
    type: 'input'
  },
  {
    submit: true,
    required: true,
    colon: true,
    name: 'shiftPerson',
    label: '值班人员',
    type: 'tree-select',
    attrs: {
      treeData: [],
      'dropdown-style': {
        maxHeight: '300px',
        overflow: 'auto'
      },
      replaceFields: {
        title: 'name',
        key: 'key',
        value: 'id'
      },
      'tree-default-expand-all': true,
      multiple: true,
      treeCheckable: true
    }
  }
];

export const modelFields = {
  backFlow: {
    submit: true,
    required: true,
    colon: true,
    name: 'backFlow',
    label: '外回流量',
    type: 'input'
  },
  inBackFlow: {
    submit: true,
    required: true,
    colon: true,
    name: 'inBackFlow',
    label: '内回流量',
    type: 'input'
  },
  ORP: {
    submit: true,
    required: true,
    colon: true,
    name: 'ORP',
    label: 'ORP',
    type: 'input'
  },
  MLSS: {
    submit: true,
    required: true,
    colon: true,
    name: 'MLSS',
    label: 'MLSS',
    type: 'input'
  },
  DO: {
    submit: true,
    required: true,
    colon: true,
    name: 'DO',
    label: 'DO',
    type: 'input'
  },
  NN: {
    submit: true,
    required: true,
    colon: true,
    name: 'NN',
    label: '硝态氮',
    type: 'input'
  },
  sludge: {
    submit: true,
    required: true,
    colon: true,
    name: 'sludge',
    label: '二沉池污泥',
    type: 'select',
    placeholder: '请选择',
    options: [
      {
        label: '上浮',
        value: 1
      },
      {
        label: '未上浮',
        value: 0
      }
    ]
  }
};
export const getFields = function(...form) {
  return form?.map(item => {
    return { ...modelFields[item] };
  });
};
