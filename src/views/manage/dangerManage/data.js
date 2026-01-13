import { handleConfig } from '@/components/SearchTable/util';
export function getDangerConfig(_this) {
  const config = {
    searchFields: [
      {
        name: 'keyword',
        type: 'input',
        label: '关键字'
      },
      {
        name: 'status',
        type: 'select',
        label: '状态'
      }
    ],
    initColumns: [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        width: 80,
        customRender: (text, row, index) => {
          return index + 1;
        }
      },
      { dataIndex: 'title', title: '隐患标题', ellipsis: true },
      { dataIndex: 'description', title: '隐患描述', ellipsis: true },
      { dataIndex: 'discoverer', title: '发现人', ellipsis: true },
      { dataIndex: 'discoveryDate', title: '发现日期', ellipsis: true },
      { dataIndex: 'location', title: '发现区域', ellipsis: true },
      { dataIndex: 'severity', title: '严重程度', ellipsis: true },
      { dataIndex: 'actionPlan', title: '处理计划', ellipsis: true },
      { dataIndex: 'assignedTo', title: '指派给', ellipsis: true },
      { dataIndex: 'environmentalImpact', title: '对环境的影响', ellipsis: true },
      { dataIndex: 'operationalImpact', title: '对运营的影响', ellipsis: true },
      { dataIndex: 'resolutionDate', title: '解决日期', ellipsis: true },
      { dataIndex: 'resolutionDeadline', title: '解决期限', ellipsis: true },
      { dataIndex: 'status', title: '状态', ellipsis: true },
      { dataIndex: 'remarks', title: '备注', ellipsis: true },
      { dataIndex: 'createBy', title: '创建者', ellipsis: true },
      { dataIndex: 'createTime', title: '创建时间', width: 180, ellipsis: true },
      { dataIndex: 'updateBy', title: '最后更新者', ellipsis: true },
      { dataIndex: 'updateTime', title: '更新时间', width: 180, ellipsis: true },
      {
        title: '操作',
        type: 'action',
        ifHide: _this.hideAction,
        fixed: 'right',
        width: 120,
        events: [
          {
            name: '详情',
            key: 'detail'
          },
          {
            name: '删除',
            key: 'delete'
          }
        ]
      }
    ],
    detailFields: [
      {
        name: 'title',
        type: 'input',
        label: '隐患标题',
        rules: [{ required: true, message: '该字段不能为空' }]
      },
      {
        name: 'description',
        type: 'input',
        label: '隐患描述',
        rules: [{ required: true, message: '该字段不能为空' }]
      },
      { name: 'discoverer', type: 'input', label: '发现人' },
      {
        name: 'discoveryDate',
        type: 'date-picker',
        label: '发现日期',
        rules: [{ required: true, message: '该字段不能为空' }]
      },
      {
        name: 'location',
        type: 'input',
        label: '发现区域',
        rules: [{ required: true, message: '该字段不能为空' }]
      },
      { name: 'severity', type: 'input', label: '严重程度' },
      {
        name: 'status',
        type: 'select',
        label: '状态',
        rules: [{ required: true, message: '该字段不能为空' }]
      },
      { name: 'actionPlan', type: 'input', label: '处理计划' },
      { name: 'assignedTo', type: 'input', label: '指派给' },
      { name: 'environmentalImpact', type: 'input', label: '对环境的影响' },
      { name: 'operationalImpact', type: 'input', label: '对运营的影响' },
      { name: 'resolutionDate', type: 'date-picker', label: '解决日期' },
      { name: 'resolutionDeadline', type: 'date-picker', label: '解决期限' },
      { name: 'remarks', type: 'input', label: '备注' },
      { name: 'file', type: 'input', label: '', span: 24, wrapperCol: { span: 24 } }
    ]
  };
  handleConfig(config);
  return config;
}
