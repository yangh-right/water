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
    placeholder: '可搜索隐患标题/区域',
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
  { title: '隐患标题', dataIndex: 'title', key: 'title',fixed: 'left', width: 200 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '严重程度', dataIndex: 'severity', key: 'severity', width: 120 },
  { title: '发现人', dataIndex: 'discoverer', key: 'discoverer', width: 120 },
  { title: '发现日期', dataIndex: 'discoveryDate', key: 'discoveryDate', width: 140 },
  { title: '发现区域', dataIndex: 'location', key: 'location', width: 160 },
  { title: '对运营的影响', dataIndex: 'operationalImpact', key: 'operationalImpact', width: 200 },
  { title: '对环境的影响', dataIndex: 'environmentalImpact', key: 'environmentalImpact', width: 200 },
  { title: '处理计划', dataIndex: 'actionPlan', key: 'actionPlan', width: 200 },
  { title: '解决期限', dataIndex: 'resolutionDeadline', key: 'resolutionDeadline', width: 140 },
  { title: '备注', dataIndex: 'remarks', key: 'remarks', width: 200 },
  { title: '指派给', dataIndex: 'assignedTo', key: 'assignedTo', width: 120 },
  { title: '解决日期', dataIndex: 'resolutionDate', key: 'resolutionDate', width: 140 },
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