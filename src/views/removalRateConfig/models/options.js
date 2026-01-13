export const columns = [
  {
    title: '污水厂名称',
    dataIndex: 'waterPlantName',
    key: 'waterPlantName',
    width: 150,
    ellipsis: true
  },
  {
    title: '处理区域',
    dataIndex: 'processingType',
    key: 'processingType',
    scopedSlots: { customRender: 'processingType' },
    width: 180,
    ellipsis: true
  },
  {
    title: '去除率(%)',
    dataIndex: 'removalRate',
    key: 'removalRate',
    width: 180,
    ellipsis: true
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    key: 'createBy',
    width: 120,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 150,
    ellipsis: true
  },
  {
    title: '操作',
    width: 120,
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

export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 5
  },
  {
    label: '选择日期',
    name: 'rangeTime',
    type: 'rangePicker',
    placeholder: ['开始日期', '结束日期'],
    show: true,
    span: 7,
    attrs: {
      allowClear: true
    }
  }
];

export const searchForm = {
  waterPlantId: '',
  rangeTime: null,
  placeId: undefined,
  currentPage: 1,
  pageSize: 20,
  total: 0
};
