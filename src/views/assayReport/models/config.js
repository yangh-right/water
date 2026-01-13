// 基础列配置
const BASE_COLUMNS = [
  {
    title: '序号',
    dataIndex: 'num',
    key: 'num',
    width: 60,
    customRender: (text, row, index) => index + 1
  },
  {
    title: '污水厂',
    dataIndex: 'waterPlantName',
    key: 'waterPlantName',
    width: 150,
    ellipsis: true
  },
  {
    title: '构筑物/取样地点',
    dataIndex: 'configName',
    key: 'configName',
    width: 150,
    ellipsis: true
  }
];

// 时间相关列配置
const TIME_COLUMNS = [
  {
    title: '采样日期',
    dataIndex: 'samplingDate',
    key: 'samplingDate',
    width: 150
  },
  {
    title: '检测人',
    dataIndex: 'analyzer',
    key: 'analyzer',
    width: 150
  },
  {
    title: '检测时间',
    dataIndex: 'testingTime',
    key: 'testingTime',
    width: 180
  },
  {
    title: '审核人',
    dataIndex: 'reviewer',
    key: 'reviewer',
    width: 150
  },
  {
    title: '审核状态',
    dataIndex: 'reviewStatus',
    key: 'reviewStatus',
    width: 150,
    customRender: text => (text == '1' ? '已审核' : '未审核')
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 150,
    fixed: 'right',
    scopedSlots: { customRender: 'action' }
  }
];

// 标准检测列配置
const STANDARD_TEST_COLUMNS = [
  {
    title: '单点校准标准液浓度（mg/L）',
    dataIndex: 'calibrationConcentration',
    key: 'calibrationConcentration',
    width: 140
  },
  {
    title: '实测吸光度',
    dataIndex: 'measuredAbsorbance',
    key: 'measuredAbsorbances',
    width: 140
  },
  {
    title: '实测浓度（mg/L）',
    dataIndex: 'measuredConcentration',
    key: 'measuredConcentration',
    width: 140
  },
  {
    title: '相对误差（%）',
    dataIndex: 'relativeError',
    key: 'relativeError',
    width: 140
  },
  {
    title: '取样体积(mL)',
    dataIndex: 'samplingVolume',
    key: 'samplingVolume',
    width: 140
  },
  {
    title: '稀释倍数',
    dataIndex: 'dilutionFactor',
    key: 'dilutionFactor',
    width: 140
  }
];

// 创建列配置的辅助函数
const createColumns = (baseCols, specificCols, timeCols = TIME_COLUMNS) => [
  ...baseCols,
  ...specificCols,
  ...timeCols
];

// 列配置映射
const COLUMNS_CONFIG = {
  water_temperature: createColumns(BASE_COLUMNS, [
    {
      title: '水温',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),
  pH: createColumns(BASE_COLUMNS, [
    {
      title: 'pH检测结果',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),

  dissolved_oxygen: createColumns(BASE_COLUMNS, [
    {
      title: '溶解氧',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),

  COD: createColumns(BASE_COLUMNS, [
    {
      title: '化学需氧量(mg/L)',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),

  BOD5: createColumns(BASE_COLUMNS, [
    {
      title: '五日生化需氧量(mg/L)',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 160
    }
  ]),

  Activated_Sludge: createColumns(BASE_COLUMNS, [
    {
      title: '取样体积V(ml)',
      dataIndex: 'samplingVolume',
      key: 'samplingVolume',
      width: 140
    },
    {
      title: 'SV30(140%)',
      dataIndex: 'sv30',
      key: 'sv30',
      width: 140
    },
    {
      title: 'w1(g)',
      dataIndex: 'w1',
      key: 'w1',
      width: 140
    },
    {
      title: 'w2(g)',
      dataIndex: 'w2',
      key: 'w2',
      width: 140
    },
    {
      title: 'w3(g)',
      dataIndex: 'w3',
      key: 'w3',
      width: 140
    },
    {
      title: 'w4(g)',
      dataIndex: 'w4',
      key: 'w4',
      width: 140
    },
    {
      title: 'MLSS(mg/L)',
      dataIndex: 'mlss',
      key: 'mlss',
      width: 140
    },
    {
      title: 'MLVSS(mg/L)',
      dataIndex: 'mlvss',
      key: 'mlvss',
      width: 140
    },
    {
      title: 'SVI(ml/g)',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),

  SS: createColumns(BASE_COLUMNS, [
    {
      title: 'SS',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),
  Chromaticity: createColumns(BASE_COLUMNS, [
    {
      title: '色度',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),

  Fecal_Coliforms: createColumns(BASE_COLUMNS, [
    {
      title: '开始培养时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 140
    },
    {
      title: '完成培养时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 140
    },
    {
      title: '取样体积(mL)',
      dataIndex: 'samplingVolume',
      key: 'samplingVolume',
      width: 140
    },
    {
      title: '大孔数',
      dataIndex: 'macropore',
      key: 'macropore',
      width: 140
    },
    {
      title: '小孔数',
      dataIndex: 'micropore',
      key: 'micropore',
      width: 140
    },
    {
      title: '检测结果MPN/100mL',
      dataIndex: 'fecalColiformsValue',
      key: 'fecalColiformsValue',
      width: 140
    },
    {
      title: '最终结果(MPN/L)',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),

  TN: createColumns(BASE_COLUMNS, [
    ...STANDARD_TEST_COLUMNS,
    {
      title: 'A220',
      dataIndex: 'a220',
      key: 'a220',
      width: 140
    },
    {
      title: 'A275',
      dataIndex: 'a275',
      key: 'a275',
      width: 140
    },
    {
      title: 'A220-2A275',
      dataIndex: 'a2202a275',
      key: 'a2202a275',
      width: 140
    },
    {
      title: '质量(ug)',
      dataIndex: 'mass',
      key: 'mass',
      width: 140
    },
    {
      title: '浓度(mg/L)',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),

  TP: createColumns(BASE_COLUMNS, [
    ...STANDARD_TEST_COLUMNS,
    {
      title: '吸光度',
      dataIndex: 'absorbance',
      key: 'absorbance',
      width: 140
    },
    {
      title: '质量(ug)',
      dataIndex: 'mass',
      key: 'mass',
      width: 140
    },
    {
      title: '浓度(mg/L)',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),

  NH3_N: createColumns(BASE_COLUMNS, [
    ...STANDARD_TEST_COLUMNS,
    {
      title: '吸光度',
      dataIndex: 'absorbance',
      key: 'absorbance',
      width: 140
    },
    {
      title: '质量(ug)',
      dataIndex: 'mass',
      key: 'mass',
      width: 140
    },
    {
      title: '浓度(mg/L)',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ]),

  Microbial_Microscopy: createColumns(BASE_COLUMNS, [
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 140
    },
    {
      title: '形状',
      dataIndex: 'shape',
      key: 'shape',
      width: 140
    },
    {
      title: '沉降性',
      dataIndex: 'settlability',
      key: 'settlability',
      width: 140
    },
    {
      title: '微生物',
      dataIndex: 'dataValue',
      key: 'dataValue',
      width: 140
    }
  ])
};

export const handleColumns = (_this, config) => {
  // 处理BOD₅ → 'BOD5'和NH₃-N → 'NH3_N'映射问题
  const key = config === 'BOD₅' ? 'BOD5' : config === 'NH₃-N' ? 'NH3_N' : config;
  return COLUMNS_CONFIG[key] || [];
};

// 数据填报
export const BASE_FIELDS = [
  {
    name: 'waterPlantId',
    label: '选择污水厂',
    placeholder: '请选择污水厂',
    type: 'select',
    required: true,
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'samplingDate',
    label: '采样日期',
    placeholder: '请选择采样日期',
    type: 'date-picker',
    required: true,
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: false,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    }
  }
];

// 水温
export const WATER_TEMPERATURE_FIELDS = [
  {
    name: 'analyzer',
    label: '采集人',
    placeholder: '请输入采集人',
    type: 'input',
    required: true,
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '采集时间',
    placeholder: '请选择采集时间',
    type: 'date-picker',
    required: true,
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// pH检测模块
export const PH_FIELDS = [
  {
    name: 'analyticalMethod',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '玻璃电极法（GB 6920-86）',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'instrument',
    label: '使用仪器',
    placeholder: '请输入使用仪器',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '奥立龙868',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'analyzer',
    label: '检验人',
    placeholder: '请输入检验人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '检验时间',
    placeholder: '请选择检验时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,

      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 溶解氧
export const DISSOLVED_OXYGEN_FIELDS = [
  {
    name: 'analyticalMethod1',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '重量法',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'instrument1',
    label: '使用仪器',
    placeholder: '请输入使用仪器',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '数显鼓风干燥箱、马弗炉、电子天平',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'analyzer',
    label: '采集人',
    placeholder: '请输入采集人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '采集时间',
    placeholder: '请选择采集时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,

      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 化学需氧量
export const CHEMICAL_OXYGEN_FIELDS = [
  {
    name: 'analyticalMethod2',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '快速消解法（HJ/T 399-2007）',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'instrument2',
    label: '使用仪器',
    placeholder: '请输入使用仪器',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '连华5B-3B（VB）',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'analyzer',
    label: '采集人',
    placeholder: '请输入采集人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '采集时间',
    placeholder: '请选择采集时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,

      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 五日生化需氧量
export const BOD5_FIELDS = [
  {
    name: 'analyticalMethod3',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '稀释接种法（HJ 505-2009）',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'instrument3',
    label: '使用仪器',
    placeholder: '请输入使用仪器',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '生化培养箱、连华BOD测定仪',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'analyzer',
    label: '采集人',
    placeholder: '请输入采集人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '采集时间',
    placeholder: '请选择采集时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,

      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 曝气池活性污泥
export const ACTIVATED_SLUDGE_FIELDS = [
  {
    name: 'analyticalMethod4',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '重量法',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'instrument4',
    label: '使用仪器',
    placeholder: '请输入使用仪器',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '数显鼓风干燥箱、马弗炉、电子天平',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'analyzer',
    label: '采集人',
    placeholder: '请输入采集人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '采集时间',
    placeholder: '请选择采集时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,

      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 色度
export const CHROMATICITY_FIELDS = [
  {
    name: 'analyticalMethod5',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '稀释倍数法(CJT51-2018)',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'instrument5',
    label: '使用仪器',
    placeholder: '请输入使用仪器',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '比色管',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'analyzer',
    label: '采集人',
    placeholder: '请输入采集人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '采集时间',
    placeholder: '请选择采集时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,

      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 粪大肠菌群
export const FECAL_COLIFORM_FIELDS = [
  {
    name: 'analyticalMethod6',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '稀释倍数法(CJT51-2018)',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'temperature',
    label: '培养温度',
    placeholder: '请输入培养温度',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '44.5℃±0.5℃',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'instrument6',
    label: '使用仪器',
    placeholder: '请输入使用仪器',
    type: 'input',
    span: 24,
    labelCol: { span: 4 },
    wrapperCol: { span: 8 },
    value: '比色管',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'analyzer',
    label: '采集人',
    placeholder: '请输入采集人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '采集时间',
    placeholder: '请选择采集时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 总氮
export const TN_FIELDS = [
  {
    name: 'analyticalMethod7',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '纳氏试剂分光光度法',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'calibrationConcentration',
    label: '单点校准标准液浓度',
    placeholder: '请输入单点校准标准液浓度',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'measuredAbsorbance',
    label: '实测吸光度',
    placeholder: '请输入实测吸光度',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'measuredConcentration',
    label: '实测浓度（mg/L）',
    placeholder: '请输入实测浓度',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'relativeError',
    label: '相对误差',
    placeholder: '请输入相对误差',
    type: 'input',
    span: 24,
    labelCol: { span: 4 },
    wrapperCol: { span: 8 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'analyzer',
    label: '检验人',
    placeholder: '请输入检验人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '检验时间',
    placeholder: '请选择检验时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,

      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 总磷
export const TP_FIELDS = [
  {
    name: 'analyticalMethod7',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '纳氏试剂分光光度法',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'calibrationConcentration',
    label: '单点校准标准液浓度',
    placeholder: '请输入单点校准标准液浓度',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'measuredAbsorbance',
    label: '实测吸光度',
    placeholder: '请输入实测吸光度',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'measuredConcentration',
    label: '实测浓度（mg/L）',
    placeholder: '请输入实测浓度',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'relativeError',
    label: '相对误差',
    placeholder: '请输入相对误差',
    type: 'input',
    span: 24,
    labelCol: { span: 4 },
    wrapperCol: { span: 8 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'analyzer',
    label: '检验人',
    placeholder: '请输入检验人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '检验时间',
    placeholder: '请选择检验时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,

      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 氨氮
export const NH3_FIELDS = [
  {
    name: 'analyticalMethod7',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '纳氏试剂分光光度法',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'calibrationConcentration',
    label: '单点校准标准液浓度',
    placeholder: '请输入单点校准标准液浓度',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'measuredAbsorbance',
    label: '实测吸光度',
    placeholder: '请输入实测吸光度',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'measuredConcentration',
    label: '实测浓度（mg/L）',
    placeholder: '请输入实测浓度',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'relativeError',
    label: '相对误差',
    placeholder: '请输入相对误差',
    type: 'input',
    span: 24,
    labelCol: { span: 4 },
    wrapperCol: { span: 8 },
    value: '',
    attrs: {
      disabled: false
    }
  },
  {
    name: 'analyzer',
    label: '检验人',
    placeholder: '请输入检验人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '检验时间',
    placeholder: '请选择检验时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,

      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 微生物镜检
export const MICROBIAL_MICROSCOPY_FIELDS = [
  {
    name: 'analyzer',
    label: '采集人',
    placeholder: '请输入采集人',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'testingTime',
    label: '采集时间',
    placeholder: '请选择采集时间',
    type: 'date-picker',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    attrs: {
      showTime: true,

      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 悬浮物
export const SUSPENDED_FIELDS = [
  {
    name: 'analyticalMethod10',
    label: '分析方法',
    placeholder: '请输入分析方法',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    value: '重量法（GB 11901-89）',
    attrs: {
      disabled: true
    }
  },
  {
    name: 'instrument10',
    label: '使用仪器',
    placeholder: '请输入使用仪器',
    type: 'input',
    span: 12,
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
    value: '数显鼓风干燥箱、电子天平',
    attrs: {
      disabled: true
    }
  }
];

// 创建列配置的辅助函数
const createFields = (baseFields, specificFields) => [...baseFields, ...specificFields];

const FIELDS_CONFIG = {
  pH: createFields(BASE_FIELDS, [
    {
      name: 'pH',
      label: '分析方法',
      placeholder: '请选择分析方法',
      type: 'input',
      required: true,
      span: 12,
      wrapperCol: { span: 16 }
    },
    {
      name: 'instrument',
      label: '使用仪器',
      placeholder: '请选择使用仪器',
      type: 'input',
      required: true,
      span: 12,
      wrapperCol: { span: 16 }
    },
    {
      name: 'analyzer',
      label: '检测人',
      placeholder: '请选择检测人',
      type: 'input',
      required: true,
      span: 12,
      wrapperCol: { span: 16 }
    },
    {
      name: 'testingTime',
      label: '检验时间',
      placeholder: '请选择检验时间',
      type: 'date-picker',
      required: true,
      span: 12,
      wrapperCol: { span: 16 }
    }
  ])
};

//
export const handleFields = (_this, config) => {
  // 处理BOD₅ → 'BOD5'和NH₃-N → 'NH3_N'映射问题
  const key = config === 'BOD₅' ? 'BOD5' : config === 'NH₃-N' ? 'NH3_N' : config;
  return FIELDS_CONFIG[key] || [];
};
