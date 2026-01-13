export const searchForm = {
  deviceModelId: undefined,
  waterPlantId: '',
  keywords: undefined,
  deviceGrade: undefined,
  deviceTypeList: [],
  placeId: undefined, //
  installAddress: undefined, //
  positionIdList: [], // 水池、位置id
  deviceStatus: ['1', '2'],
  onlineState: [],
  manufacturerIdList: [],
  supplierIdList: [],
  useYear: [],
  sameManufacturerAndSupplierFlag: false, // 即是生产产商又是供应商时true
  currentPage: 1,
  pageSize: 20,
  total: 0
};
export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    isCommonScreen: true
  },
  {
    label: '构筑物',
    name: 'placeId',
    type: 'select',
    show: true,
    isCommonScreen: true,
    placeholder: '不限',
    options: [],
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    attrs: {
      allowClear: true
    },
    extraOption: []
  },
  {
    label: '设备关键词',
    name: 'keywords',
    type: 'input',
    placeholder: '可搜索设备名称/规格型号/编号/固定资产编号',
    show: true,
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    isCommonScreen: true,
    attrs: {
      allowClear: true
    }
  },
  {
    label: '设备等级',
    name: 'deviceGrade',
    type: 'select',
    placeholder: '不限',
    show: true,
    isCommonScreen: true,
    options: [],
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    attrs: {
      allowClear: true
    },
    extraOption: [
      {
        label: '不限',
        value: ''
      }
    ]
  },
  {
    label: '设备分类',
    name: 'deviceTypeList',
    type: 'select',
    show: true,
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    isCommonScreen: true
  },
  {
    label: '安装位置',
    name: 'installAddress',
    type: 'input',
    show: true,
    isCommonScreen: true,
    placeholder: '不限',
    options: [],
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    attrs: {
      allowClear: true
    },
    extraOption: []
  },
  {
    label: '使用状态',
    name: 'deviceStatus',
    type: 'select',
    show: true,
    isCommonScreen: true,
    placeholder: '不限',
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    attrs: {
      allowClear: true,
      mode: 'multiple',
      maxTagCount: 2
    },
    options: [],
    extraOption: []
  },
  {
    label: '在线状态',
    name: 'onlineState',
    type: 'select',
    placeholder: '不限',
    show: true,
    isCommonScreen: true,
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    attrs: {
      allowClear: true,
      mode: 'multiple',
      maxTagCount: 2
    },
    options: [
      {
        label: '在线',
        value: 'ONLINE'
      },
      {
        label: '离线',
        value: 'OFFLINE'
      },
      {
        label: '非IOT',
        value: 'NOT_IOT'
      }
    ],
    extraOption: []
  },
  {
    name: 'action',
    type: 'input',
    wrapperCol: { span: 24 },
    span: 24,
    show: true
  }
];

export const columns = [
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    key: 'deviceName',
    width: 120,
    ellipsis: true
  },
  {
    title: '设备编号',
    dataIndex: 'deviceNo',
    key: 'deviceNo',
    width: 100,
    align: 'center',
    ellipsis: true
  },
  {
    title: '设备分类',
    dataIndex: 'deviceType',
    key: 'deviceType',
    width: 240,
    ellipsis: true
  },
  {
    title: '构筑物',
    dataIndex: 'placeName',
    key: 'placeName',
    width: 120,
    ellipsis: true
  },
  {
    title: '安装位置',
    dataIndex: 'installAddress',
    key: 'installAddress',
    align: 'center',
    width: 100,
    ellipsis: true
  },
  {
    title: '使用状态',
    dataIndex: 'deviceStatus',
    key: 'deviceStatus',
    align: 'center',
    width: 80,
    ellipsis: true
  },
  {
    title: '在线状态',
    dataIndex: 'deviceOnlineFlag',
    key: 'deviceOnlineFlag',
    align: 'center',
    width: 80,
    ellipsis: true
  },
  // {
  //   title: '制造商',
  //   dataIndex: 'manufacturer',
  //   key: 'manufacturer',
  //   align: 'center',
  //   width: 100,
  //   ellipsis: true
  // },
  {
    title: '规格型号',
    dataIndex: 'deviceModel',
    key: 'deviceModel',
    align: 'center',
    width: 80,
    ellipsis: true
  },
  // {
  //   title: '供应商',
  //   dataIndex: 'supplierInfo',
  //   key: 'supplierInfo',
  //   width: 150,
  //   ellipsis: true
  // },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    type: 'datetime',
    width: 120,
    ellipsis: true
  },
  {
    title: '操作',
    width: 120,
    type: 'action',
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

export const monitorColumns = [
  {
    title: '行业设备编号',
    dataIndex: 'realPointCode',
    key: 'realPointCode',
    ellipsis: true,
    width: 150
  },
  {
    title: '行业设备监测量',
    dataIndex: 'realPointMemo',
    key: 'realPointMemo',
    ellipsis: true,
    width: 130
  },
  {
    title: '行业设备类型',
    dataIndex: 'realPointTypeName',
    key: 'realPointTypeName',
    ellipsis: true,
    width: 100
  },
  {
    title: '行业设备监测量代码',
    dataIndex: 'realShortPointCode',
    key: 'realShortPointCode',
    ellipsis: true,
    width: 130
  },
  {
    title: '模型编号名称',
    dataIndex: 'pointName',
    key: 'pointName',
    ellipsis: true,
    width: 130
  },
  {
    title: '模型编号描述',
    dataIndex: 'pointMemo',
    key: 'pointMemo',
    ellipsis: true,
    width: 130
  },
  {
    title: '单位',
    dataIndex: 'pointUnit',
    key: 'pointUnit',
    ellipsis: true,
    width: 80
  },
  {
    title: '操作',
    width: 100,
    type: 'action',
    fixed: 'right',
    events: [
      {
        key: 'handleEdit',
        name: '编辑'
      }
    ]
  }
];

export const addForm = {
  deviceName: undefined, //设备名称
  deviceNo: undefined, //设备编号
  deviceType: undefined, //设备分类
  deviceParentType: undefined, //设备分类父级
  deviceGrade: undefined, //设备分级
  deviceModel: undefined, //设备型号名称
  deviceStatus: undefined, //设备状态 -1 报废 0待报废 1正常使用 2待修理 3闲置
  installAddress: undefined, // 安装地点
  useDepartment: undefined, //使用部门
  manufacturer: undefined, //制造商
  supplierInfo: undefined, //供应商
  deviceSize: undefined, //设备尺寸
  devicePower: undefined, //设备功率
  fixedAssetNo: undefined, //固定资产编号
  totalValue: undefined, //设备总值
  purchaseDate: undefined, //购买日期
  useDate: undefined, //使用日期
  warrantyEndDate: undefined, //保修截止日期
  fileList: [] //设备照片视频
};

export const baseFields = [
  {
    name: 'deviceName',
    type: 'input',
    label: '设备名称',
    placeholder: '请填写设备名称',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    attrs: { maxLength: 50, allowClear: true },
    rules: [
      { required: true, message: '请填写设备名称' },
      {
        max: 50,
        // validator: (rule, value, callback) => {},
        trigger: 'change'
      }
    ]
  },
  {
    name: 'deviceNo',
    type: 'input',
    label: '设备编号',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    attrs: { maxLength: 50, allowClear: true },
    rules: [
      { required: true, message: '请填写设备编号' },
      {
        max: 50,
        trigger: 'change'
      }
    ]
  },
  {
    name: 'deviceType',
    type: 'select',
    label: '设备分类',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    options: [],
    rules: [{ required: true, message: '请选择设备分类' }]
  },
  {
    name: 'deviceGrade',
    type: 'select',
    label: '设备分级',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    options: [],
    rules: [{ required: true, message: '请选择设备分级' }]
  },
  {
    name: 'deviceModel',
    type: 'input',
    label: '规格型号',
    placeholder: '请输入规格型号',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  },
  {
    name: 'deviceStatus',
    type: 'select',
    label: '设备状态',
    placeholder: '请选择设备状态',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    options: [],
    rules: [{ required: true, message: '请选择设备状态' }]
  },
  {
    name: 'installAddress',
    type: 'input',
    label: '设备位置',
    span: 12,
    show: true,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  },
  {
    name: 'useDepartment',
    type: 'input',
    label: '使用部门',
    span: 12,
    options: [],
    placeholder: '请输入使用部门',
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  },
  {
    name: 'manufacturer',
    type: 'input',
    label: '制造商',
    span: 12,
    options: [],
    placeholder: '请输入制造商',
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  },
  {
    name: 'supplierInfo',
    type: 'input',
    label: '供应商',
    placeholder: '请输入供应商',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  },
  {
    name: 'deviceSize',
    type: 'input',
    label: '设备尺寸',
    placeholder: '请输入设备尺寸',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  },
  {
    name: 'devicePower',
    type: 'input',
    label: '设备功率',
    placeholder: '请输入设备功率',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  }
];

export const factoryFields = [
  {
    name: 'supplierId',
    type: 'select',
    label: '供应商',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  },
  {
    name: 'outFactoryTime',
    type: 'datePicker',
    label: '出厂日期',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  }
];

export const useFields = [
  {
    label: '选择净水厂',
    name: 'waterPlantId',
    type: 'select',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    rules: [{ required: true, message: '请选择净水厂' }]
  },
  {
    name: 'placeId',
    type: 'select',
    label: '构筑物',
    span: 12,
    show: true,
    placeholder: '请选择构筑物',
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    rules: [{ required: true, message: '请选择构筑物' }]
  },
  {
    name: 'fixedAssetNo',
    type: 'input',
    label: '固定资产编号',
    placeholder: '请输入固定资产编号',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  },
  {
    name: 'totalValue',
    type: 'input',
    label: '设备总值',
    placeholder: '请输入设备总值',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 }
  },
  {
    name: 'purchaseDate',
    type: 'datePicker',
    label: '购买日期',
    placeholder: '请选择购买日期',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    attrs: {
      valueFormat: 'YYYY-MM-DD'
    }
  },
  {
    name: 'useDate',
    type: 'datePicker',
    label: '使用日期',
    placeholder: '请选择使用日期',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    attrs: {
      valueFormat: 'YYYY-MM-DD'
    }
  },
  {
    name: 'warrantyEndDate',
    type: 'datePicker',
    label: '保修截止日期',
    placeholder: '保修截止日期',
    span: 12,
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    attrs: {
      valueFormat: 'YYYY-MM-DD'
    }
  },
  {
    label: '设备照片视频',
    name: 'fileList',
    type: 'select',
    span: 24,
    labelCol: { span: 2 },
    wrapperCol: { span: 21 }
  }
];

export const monitorDetailColumns = [
  {
    title: '行业设备编号',
    dataIndex: 'realPointCode',
    key: 'realPointCode',
    ellipsis: true,
    width: 150
  },
  {
    title: '行业设备监测量',
    dataIndex: 'realPointMemo',
    key: 'realPointMemo',
    ellipsis: true,
    width: 130
  },
  {
    title: '行业设备类型',
    dataIndex: 'realPointTypeName',
    key: 'realPointTypeName',
    ellipsis: true,
    width: 100
  },
  {
    title: '行业设备监测量代码',
    dataIndex: 'realShortPointCode',
    key: 'realShortPointCode',
    ellipsis: true,
    width: 130
  },
  {
    title: '模型编号名称',
    dataIndex: 'pointName',
    key: 'pointName',
    ellipsis: true,
    width: 130
  },
  {
    title: '模型编号描述',
    dataIndex: 'pointMemo',
    key: 'pointMemo',
    ellipsis: true,
    width: 130
  },
  {
    title: '单位',
    dataIndex: 'pointUnit',
    key: 'pointUnit',
    ellipsis: true,
    width: 80
  }
];
