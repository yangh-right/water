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

export const sludgeColumns = [
  {
    title: '车次编码',
    dataIndex: 'carNumber',
    key: 'carNumber',
    width: 310,
    ellipsis: true
  },
  {
    title: '车牌号码',
    dataIndex: 'licensePlate',
    key: 'licensePlate',
    width: 150,
    ellipsis: true
  },

  {
    title: '毛重（kg）',
    dataIndex: 'grossWeight',
    key: 'grossWeight',
    width: 120,
    ellipsis: true
  },
  {
    title: '净重（t）',
    dataIndex: 'netWeight',
    key: 'netWeight',
    width: 120,
    ellipsis: true
  },
  {
    title: '皮重（kg）',
    dataIndex: 'tareWeight',
    key: 'tareWeight',
    width: 120,
    ellipsis: true
  },
  {
    title: '发货单位',
    dataIndex: 'companySend',
    key: 'companySend',
    width: 120,
    ellipsis: true
  },
  {
    title: '收货单位',
    dataIndex: 'companyReceive',
    key: 'companyReceive',
    width: 120,
    ellipsis: true
  },
  {
    title: '货物名称',
    dataIndex: 'goodsName',
    key: 'goodsName',
    width: 120,
    ellipsis: true
  },
  {
    title: '货物规格',
    dataIndex: 'goodsModel',
    key: 'goodsModel',
    width: 120,
    ellipsis: true
  },
  {
    title: '过毛时间',
    dataIndex: 'grossTime',
    key: 'grossTime',
    width: 180,
    ellipsis: true
  },
  {
    title: '过皮时间',
    dataIndex: 'tareTime',
    key: 'tareTime',
    width: 180,
    ellipsis: true
  },
  {
    title: '运输类型',
    dataIndex: 'transportType',
    key: 'transportType',
    width: 120,
    ellipsis: true,
    customRender: (text, row, index) => {
      return text == '1' ? '污泥' : '药物';
    }
  }
];
