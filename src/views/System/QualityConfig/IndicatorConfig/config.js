export const modalField = [
  {
    name: 'name',
    label: '指标名称',
    type: 'input',
    placeholder: '请填写指标名称',
    span: 12,
    attrs: {
      maxLength: 50
    },
    rules: [{ required: true, message: '请填写指标名称' }],
    wrapperCol: { span: 16 }
  },
  {
    name: 'unit',
    label: '指标单位',
    type: 'select',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'dataType',
    label: '数据类型',
    placeholder: '请选择',
    type: 'select',
    options: [
      { key: 1, label: '数字' },
      { key: 2, label: '选项' }
    ],

    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'rangeField',
    label: '录入范围',
    type: 'select',
    required: true,
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'verificationFormula',
    label: '校验公式',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  }
];

export const modalSampleField = [
  {
    name: 'approach',
    label: '',
    type: 'input',
    span: 24,
    wrapperCol: { span: 24 }
  },
  {
    name: 'containerId',
    label: '采样容器',
    type: 'select',
    options: [],
    placeholder: '请选择',
    span: 12,
    wrapperCol: { span: 16 },
    attrs: {
      filterOption: (input, option) => {
        return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        );
      },
      showSearch: true
    }
  },
  {
    name: 'samplingValue',
    label: '采样量',
    type: 'input',
    placeholder: '请填写采样量',
    span: 12,
    wrapperCol: { span: 16 },
    rules: [
      {
        validator: (rule, value, callback) => {
          testPositiveNumer(rule, value, callback, '请填写正确的采样量');
        },
        trigger: 'blur'
      }
    ]
  },
  {
    name: 'conservantId',
    label: '保存剂',
    type: 'select',
    options: [],
    placeholder: '如有请选择',
    span: 12,
    wrapperCol: { span: 16 },
    attrs: {
      filterOption: (input, option) => {
        return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        );
      },
      showSearch: true
    }
  },
  {
    name: 'conservantValue',
    label: '保存剂用量',
    placeholder: '请填写保存剂用量',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 },
    rules: [
      {
        validator: (rule, value, callback) => {
          testPositiveNumer(rule, value, callback, '请填写正确的保存剂用量');
        },
        trigger: 'blur'
      }
    ]
  },
  {
    name: 'storageLife',
    label: '保存期',
    type: 'input',
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'shareFlag',
    label: '容器是否公用',
    type: 'input',
    required: true,
    span: 12,
    wrapperCol: { span: 16 }
  }
];

export const modalSubSampleField = [
  {
    label: '检测方法名称',
    name: 'name',
    type: 'input',
    placeholder: '请填写方法名称',
    attrs: {
      maxLength: 50
    },
    rules: [{ required: true, message: '请填写检测方法' }],
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    label: '所属标准',
    name: 'standard',
    type: 'input',
    placeholder: '请填写所属标准',
    attrs: {
      maxLength: 50
    },
    rules: [{ required: true, message: '请填写检测方法所属标准' }],
    span: 12,
    wrapperCol: { span: 16 }
  },
  {
    name: 'upload',
    type: 'input',
    span: 12,
    colon: false,
    wrapperCol: { span: 24 }
  },
  {
    name: 'methodOperate',
    type: 'input',
    span: 12,
    colon: false,
    wrapperCol: { span: 24 }
  }
];

export const modalFieldExtra = [
  {
    name: 'opt',
    type: 'select',
    options: [
      { key: 'eq', label: '=' },
      { key: 'gt', label: '>' },
      { key: 'lt', label: '<' },
      { key: 'ge', label: '≥' },
      { key: 'le', label: '≤' },
      { key: 'ne', label: '≠' },
      { key: 'bt', label: '介于' },
      { key: 'nb', label: '非介于' }
    ],
    placeholder: '请选择',
    rules: [{ required: true, message: '请选择比较方式' }]
  },
  {
    name: 'value',
    type: 'input',
    placeholder: '请填写',
    rules: [
      { required: true, message: '请填写数值范围' },
      {
        validator: (rule, value, callback) => {
          testNumer(rule, value, callback, '请填写正确的数值范围');
        },
        trigger: 'blur'
      }
    ]
  },
  {
    name: 'rangeMin',
    type: 'input',
    placeholder: '请填写',
    rules: [
      { required: true, message: '请填写数值范围' },
      {
        validator: (rule, value, callback) => {
          testNumer(rule, value, callback, '请填写正确的最小值');
        },
        trigger: 'blur'
      }
    ]
  },
  {
    name: 'rangeMax',
    type: 'input',
    placeholder: '请填写',
    rules: [
      { required: true, message: '请填写数值范围' },
      {
        validator: (rule, value, callback) => {
          testNumer(rule, value, callback, '请填写正确的最大值');
        },
        trigger: 'blur'
      }
    ]
  },
  {
    name: 'range',
    type: 'input',
    placeholder: '多个请用英文逗号隔开',
    rules: [{ required: true, message: '请选择数值范围' }]
  },
  {
    name: 'storageLife',
    type: 'input',
    placeholder: '请填写',
    rules: [
      {
        validator: (rule, value, callback) => {
          testPositiveNumer(rule, value, callback, '填写正确的保存期');
        },
        trigger: 'blur'
      }
    ]
  }
];

export const fieldsList = [
  {
    label: '水质指标名称',
    name: 'nameLike',
    type: 'input',
    placeholder: '请输入水质指标名称',
    attrs: {
      maxLength: 50
    },
    span: 8,
    wrapperCol: { span: 16 },
    listeners: {}
  }
];

export const columns = [
  {
    title: '指标名称',
    dataIndex: 'name',
    width: 250,
    ellipsis: true
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: 100,
    ellipsis: true
  },
  {
    title: '录入范围',
    dataIndex: 'range',
    width: 300,
    ellipsis: true
  },
  {
    title: '检测方法',
    dataIndex: 'methods'
  },
  {
    title: '是否启用',
    dataIndex: 'validFlag',
    type: 'switch',
    width: 120
  },
  {
    title: '操作',
    dataIndex: 'action',
    type: 'action',
    fixed: 'right',
    width: 200,
    events: [
      { key: 'delete', name: '删除' },
      { key: 'edit', name: '编辑' },
      { key: 'jumpStandard', name: '控制标准' }
      // { key: "jumpPoint", name: "采样点" },
    ]
  }
];

export const operators = [
  { key: 'eq', label: '=' },
  { key: 'gt', label: '>' },
  { key: 'lt', label: '<' },
  { key: 'ge', label: '≥' },
  { key: 'le', label: '≤' },
  { key: 'ne', label: '≠' },
  { key: 'bt', label: '介于' },
  { key: 'nb', label: '非介于' }
];
function testPositiveNumer(rule, value, callback, msg) {
  if (value && !/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(value)) {
    callback(new Error(msg));
  } else {
    callback();
  }
}
//判断是否是数字
function testNumer(rule, value, callback, msg) {
  if (value && !((typeof value === 'number' || typeof value === 'string') && !isNaN(value))) {
    callback(new Error(msg));
  } else {
    callback();
  }
}
