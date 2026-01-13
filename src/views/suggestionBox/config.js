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
    placeholder: '可搜索标题/意见类型',
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
  { title: '标题', dataIndex: 'title', key: 'title', width: 160 },
  { title: '意见类型', dataIndex: 'type', key: 'type', width: 140 },
  { title: '意见内容', dataIndex: 'content', key: 'content', width: 200 },
  { title: '提交部门', dataIndex: 'department', key: 'department', width: 140 },
  { title: '提交人', dataIndex: 'submitter', key: 'submitter', width: 140 },
  { title: '联系方式', dataIndex: 'contact', key: 'contact', width: 140 },
  { title: '是否匿名', dataIndex: 'isAnonymous', key: 'isAnonymous', width: 100 },
  { title: '处理状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '处理意见', dataIndex: 'handleOpinion', key: 'handleOpinion', width: 200 },
  { title: '处理人', dataIndex: 'handler', key: 'handler', width: 140 },
  { title: '处理时间', dataIndex: 'handleTime', key: 'handleTime', width: 140 },
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