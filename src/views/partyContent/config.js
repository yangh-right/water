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
    placeholder: '可搜索标题',
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
  { title: '标题', dataIndex: 'title', key: 'title', width: 200 },
  { title: '内容', dataIndex: 'content', key: 'content', width: 120 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '发布人', dataIndex: 'author', key: 'author', width: 120 },
  { title: '发布时间', dataIndex: 'publishTime', key: 'publishTime', width: 160 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '是否置顶', dataIndex: 'isTop', key: 'isTop', width: 120 },
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