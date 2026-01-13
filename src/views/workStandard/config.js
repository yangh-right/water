export const searchForm = {
  keyword: '',
  status: '',
  total: 0,
  currentPage: 1,
  pageSize: 20,
};
export const workTypeList = [
  {
    label: '生产',
    value: '1'
  },
  {
    label: '安全',
    value: '2'
  },
  {
    label: '行政',
    value: '3'
  }
]
export const headerFields = [
  {
    label: '关键词',
    name: 'keyword',
    type: 'input',
    placeholder: '可搜索标准标题/标准编号/标准类型',
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
  { title: '标题', dataIndex: 'title', key: 'title', width: 160 },
  { title: '标准编号', dataIndex: 'standardCode', key: 'standardCode', width: 120 },
  { title: '标准类型', dataIndex: 'standardType', key: 'standardType', width: 120 },
  { title: '标准内容', dataIndex: 'content', key: 'content', width: 200 },
  { title: '适用范围', dataIndex: 'applicableScope', key: 'applicableScope', width: 160 },
  { title: '责任部门', dataIndex: 'responsibleDept', key: 'responsibleDept', width: 120 },
  { title: '责任人', dataIndex: 'responsiblePerson', key: 'responsiblePerson', width: 120 },
  { title: '作业类型', dataIndex: 'workType', key: 'workType', width: 120 },
  { title: '排序', dataIndex: 'orderIndex', key: 'orderIndex', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '版本号', dataIndex: 'version', key: 'version', width: 100 },
  { title: '创建人', dataIndex: 'createBy', key: 'createBy', width: 120 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 160 },
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