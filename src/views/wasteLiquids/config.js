export const searchForm = {
  keyword: '',
  status: '',
  total: 0,
  currentPage: 1,
  pageSize: 20,
};
export const headerFields = [
  {
    label: '关键词',
    name: 'keyword',
    type: 'input',
    placeholder: '可搜索废液名称/废液类别',
    show: true,
    isCommonScreen: true,
    attrs: {
      allowClear: true
    }
  },
  {
    label: '处理状态',
    isCommonScreen: true,
    placeholder: '可选择处理状态',
    name: 'status',
    type: 'select',
    show: true
  }
];

export const columns = [
  {
    title: '废液名称',
    dataIndex: 'name',
    key: 'name',
    fixed: true,
    width: 180,
    ellipsis: true
  },
  {
    title: '废液类别',
    dataIndex: 'category',
    key: 'category',
    width: 160,
    ellipsis: true
  },
  {
    title: '来源',
    dataIndex: 'source',
    key: 'source',
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
    title: '存储位置',
    dataIndex: 'storageLocation',
    key: 'storageLocation',
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
    title: '处理方法',
    dataIndex: 'disposalMethod',
    key: 'disposalMethod',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '处理日期',
    dataIndex: 'disposalDate',
    key: 'disposalDate',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 160,
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
