export const searchForm = {
  keyword: '',
  status: undefined,
  total: 0,
  currentPage: 1,
  pageSize: 20,
};

export const headerFields = [
  {
    label: '关键词',
    name: 'keyword',
    type: 'input',
    placeholder: '可搜索工程名称/工程编号/工程描述',
    show: true,
    isCommonScreen: true,
    attrs: {
      allowClear: true
    }
  },
  {
    label: '工程状态',
    isCommonScreen: true,
    placeholder: '可选择状态',
    name: 'status',
    type: 'select',
    show: true
  }
];
export const columns = [
  { title: '工程名称', dataIndex: 'projectName', key: 'projectName', width: 200 },
  { title: '工程编号', dataIndex: 'projectCode', key: 'projectCode', width: 200 },
   { title: '工程类型', dataIndex: 'projectType', key: 'projectType', width: 200 },
  { title: '工程地点', dataIndex: 'location', key: 'location', width: 200 },
  { title: '项目经理', dataIndex: 'manager', key: 'manager', width: 200 },
  { title: '工程描述', dataIndex: 'description', key: 'description', width: 200 },
  { title: '工程状态', dataIndex: 'status', key: 'status', width: 200 },
  { title: '合同编号', dataIndex: 'contractCode', key: 'contractCode', width: 200 },
  { title: '合同名称', dataIndex: 'contractName', key: 'contractName', width: 200 },
  { title: '甲方', dataIndex: 'partyA', key: 'partyA', width: 200 },
  { title: '乙方', dataIndex: 'partyB', key: 'partyB', width: 200 },
  { title: '合同金额', dataIndex: 'contractAmount', key: 'contractAmount', width: 200 },

 // { title: '合同文件列表', dataIndex: 'contractFlies', key: 'contractFlies', width: 200 },
  { title: '开工日期', dataIndex: 'startDate', key: 'startDate', width: 200 },
  { title: '计划完工日期', dataIndex: 'planEndDate', key: 'planEndDate', width: 200 },
  { title: '实际完工日期', dataIndex: 'actualEndDate', key: 'actualEndDate', width: 200 },
  { title: '当前阶段', dataIndex: 'currentStage', key: 'currentStage', width: 200 },
  { title: '完成率', dataIndex: 'completionRate', key: 'completionRate', width: 200 },
  { title: '进度说明', dataIndex: 'progressDesc', key: 'progressDesc', width: 200 },
  { title: '预算金额', dataIndex: 'budgetAmount', key: 'budgetAmount', width: 200 },
  { title: '实际支出', dataIndex: 'actualAmount', key: 'actualAmount', width: 200 },
  { title: '材料成本', dataIndex: 'materialCost', key: 'materialCost', width: 200 },
  { title: '人工成本', dataIndex: 'laborCost', key: 'laborCost', width: 200 },
  { title: '设备成本', dataIndex: 'equipmentCost', key: 'equipmentCost', width: 200 },
  { title: '其他成本', dataIndex: 'otherCost', key: 'otherCost', width: 200 },
  { title: '付款状态', dataIndex: 'paymentStatus', key: 'paymentStatus', width: 200 },
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