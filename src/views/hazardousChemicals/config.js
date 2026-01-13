export const searchForm = {
  keyword: undefined,
  total: 0,
  currentPage: 1,
  pageSize: 20,
};
export const headerFields = [
  {
    label: '关键词',
    name: 'keyword',
    type: 'input',
    placeholder: '可搜索化学品名称/CAS编号',
    show: true,
    isCommonScreen: true,
    attrs: {
      allowClear: true
    }
  }
];

export const columns = [
  {
    title: '化学品名称',
    dataIndex: 'name',
    key: 'name',
    fixed: true,
    width: 180,
    ellipsis: true
  },
  {
    title: 'CAS编号',
    dataIndex: 'casNumber',
    key: 'casNumber',
    width: 160,
    ellipsis: true
  },
  {
    title: '分子式',
    dataIndex: 'formula',
    key: 'formula',
    width: 160,
    ellipsis: true
  },
  {
    title: '危险类别',
    dataIndex: 'category',
    key: 'category',
    width: 160,
    ellipsis: true
  },
  {
    title: '储存条件',
    dataIndex: 'storageConditions',
    key: 'storageConditions',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '操作注意事项',
    dataIndex: 'handlingPrecautions',
    key: 'handlingPrecautions',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '急救措施',
    dataIndex: 'firstAidMeasures',
    key: 'firstAidMeasures',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '暴露控制/个人防护',
    dataIndex: 'exposureControls',
    key: 'exposureControls',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    key: 'supplier',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '入库日期',
    dataIndex: 'entryDate',
    key: 'entryDate',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '过期日期',
    dataIndex: 'expirationDate',
    key: 'expirationDate',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '存储位置',
    dataIndex: 'location',
    key: 'location',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 100,
    ellipsis: true
  },
  {
    title: '单位',
    dataIndex: 'unit',
    key: 'unit',
    width: 100,
    ellipsis: true
  },
  {
    title: '责任人',
    dataIndex: 'responsiblePerson',
    align: 'center',
    key: 'responsiblePerson',
    width: 160,
    ellipsis: true
  },
  {
    title: '备注',
    dataIndex: 'remarks',
    align: 'center',
    key: 'remarks',
    width: 160,
    ellipsis: true
  },
  {
    title: '操作',
    width: 170,
    type: 'action',
    fixed: 'right',
    events: [
      {
        key: 'handleDetail',
        name: '详情'
      },
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
