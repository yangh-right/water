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
    placeholder: '可搜索设备名称/型号/安装位置',
    show: true,
    isCommonScreen: true,
    attrs: {
      allowClear: true
    }
  },
  {
    label: '状态',
    isCommonScreen: true,
    placeholder: '可选择状态',
    name: 'status',
    type: 'select',
    show: true
  }
];

export const columns = [
  {
    title: '制度标题',
    dataIndex: 'title',
    key: 'title',
    fixed: true,
    width: 180,
    ellipsis: true
  },
  {
    title: '制度类别',
    dataIndex: 'category',
    key: 'category',
    width: 160,
    ellipsis: true
  },
  {
    title: '制度内容',
    dataIndex: 'content',
    key: 'content',
    width: 160,
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    ellipsis: true
  },
  {
    title: '生效日期',
    dataIndex: 'effectiveDate',
    key: 'effectiveDate',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '发布日期',
    dataIndex: 'releaseDate',
    key: 'releaseDate',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '发布人',
    dataIndex: 'issuer',
    align: 'center',
    key: 'issuer',
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
