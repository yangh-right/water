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
    label: '设备状态',
    isCommonScreen: true,
    placeholder: '可选择设备状态',
    name: 'status',
    type: 'select',
    show: true
  }
];

export const columns = [
  {
    title: '设备名称',
    dataIndex: 'name',
    key: 'name',
    fixed: true,
    width: 180,
    ellipsis: true
  },
  {
    title: '设备型号',
    dataIndex: 'model',
    key: 'model',
    width: 160,
    ellipsis: true
  },
  {
    title: '序列号',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    width: 160,
    ellipsis: true
  },
  {
    title: '制造商',
    dataIndex: 'manufacturer',
    key: 'manufacturer',
    width: 100,
    ellipsis: true
  },
  {
    title: '生产日期',
    dataIndex: 'productionDate',
    key: 'productionDate',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '安装日期',
    dataIndex: 'installationDate',
    key: 'installationDate',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '最大工作压力(MPa)',
    dataIndex: 'maxPressure',
    key: 'maxPressure',
    align: 'center',
    width: 170,
    ellipsis: true
  },
  {
    title: '设计压力(MPa)',
    dataIndex: 'designPressure',
    key: 'designPressure',
    align: 'center',
    width: 140,
    ellipsis: true
  },
  {
    title: '容积(m³)',
    dataIndex: 'volume',
    key: 'volume',
    align: 'center',
    width: 140,
    ellipsis: true
  },
  {
    title: '工作介质',
    dataIndex: 'workingMedium',
    key: 'workingMedium',
    align: 'center',
    width: 140,
    ellipsis: true
  },
  {
    title: '试验压力(MPa)',
    dataIndex: 'testPressure',
    key: 'testPressure',
    align: 'center',
    width: 140,
    ellipsis: true
  },
  {
    title: '操作温度范围',
    dataIndex: 'operatingTemperature',
    key: 'operatingTemperature',
    align: 'center',
    width: 140,
    ellipsis: true
  },
  {
    title: '上次检查日期',
    dataIndex: 'lastInspection',
    key: 'lastInspection',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '下次检查日期',
    dataIndex: 'nextInspection',
    key: 'nextInspection',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '设备状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
    ellipsis: true
  },
  {
    title: '设备位置',
    dataIndex: 'location',
    key: 'location',
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
