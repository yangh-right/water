import { max50 } from '@/utils/validator';
export const columnsData = [
  { title: '序号', width: 80, dataIndex: 'key', key: 'key', defaultValue: ' ' },
  {
    title: '构筑物名称',
    width: 160,
    ellipsis: true,
    dataIndex: 'name',
    key: 'name',
    defaultValue: ' '
  },
  {
    title: '构筑物编码',
    width: 120,
    ellipsis: true,
    dataIndex: 'coding',
    key: 'coding',
    defaultValue: ' '
  },
  {
    title: '类型',
    width: 120,
    ellipsis: true,
    defaultValue: ' ',
    dataIndex: 'type',
    key: 'type',
    scopedSlots: { customRender: 'type' }
  },
  {
    title: '工艺处理段',
    width: 120,
    ellipsis: true,
    defaultValue: ' ',
    dataIndex: 'processingType',
    key: 'processingType',
    scopedSlots: { customRender: 'processingType' }
  },
  {
    title: '设备数量',
    width: 100,
    dataIndex: 'num',
    key: 'num',
    scopedSlots: { customRender: 'num' }
  },
  { title: '创建人', width: 120, ellipsis: true, dataIndex: 'createUser', key: 'createUser' },
  { title: '创建时间', width: 160, dataIndex: 'createTime', key: 'createTime', type: 'datetime' },
  {
    title: '操作',
    width: 200,
    key: 'operation',
    dataIndex: 'operation',
    fixed: 'right',
    scopedSlots: { customRender: 'operation' }
  }
];

export const fieldsList = [
  {
    search: true,
    name: 'waterPlantId',
    type: 'select',
    span: 8,
    label: '选择污水厂'
  },
  {
    label: '构筑物名称',
    name: 'keyword',
    type: 'input',
    placeholder: '请输入',
    listeners: {},
    attrs: {
      maxLength: 50
    },

    span: 8
  }
];
export const genFieldsStructureModal = vm => {
  let fieldList = [
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
      name: 'name',
      label: '构筑物名称',
      type: 'input',
      placeholder: '请填写构筑物名称',
      required: true,
      span: 12,
      rules: [
        { required: true, message: '请填写构筑物名称' },
        { validator: max50, trigger: 'change' }
      ],
      wrapperCol: { span: 16 }
    },
    {
      name: 'coding',
      label: '构筑物编码',
      type: 'input',
      placeholder: '请填写构筑物编码',
      required: true,
      span: 12,
      rules: [
        { required: true, message: '请填写构筑物编码' },
        { validator: max50, trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            if (/[\u4e00-\u9fa5]+/g.test(value)) {
              callback(new Error('构筑物编码不能为汉字'));
            } else {
              callback();
            }
          },
          trigger: 'change'
        }
      ],

      wrapperCol: { span: 16 }
    },
    {
      name: 'processingType',
      label: '工艺处理段',
      type: 'select',
      placeholder: '请选择工艺处理段',
      required: true,
      span: 12,
      rules: [{ required: true, message: '请选择工艺处理段' }],
      wrapperCol: { span: 16 },
      listeners: {
        change: vm.handleProcessTypeChange.bind(null)
      }
    },

    {
      name: 'type',
      label: '类型',
      type: 'select',
      placeholder: '请选择类型',
      required: true,
      span: 12,
      options: [
        { label: '构筑物', value: 0 },
        { label: '水池', value: 1 }
      ],
      rules: [{ required: true, message: '请选择类型' }],
      wrapperCol: { span: 16 },
      listeners: {
        change: vm.handleSelectChange //  // 这里的事件会传递给 `w-select`
      }
    },
    {
      name: 'sort',
      label: '排序',
      type: 'input',
      placeholder: '请填写',
      span: 12,
      wrapperCol: { span: 16 },
      rules: [
        { required: true, message: '请填写序号' },
        {
          validator: (rule, value, callback) => {
            if (!/(^[0-9]*[1-9][0-9]*$)/.test(value)) {
              callback(new Error('请填写正整数'));
            } else {
              callback();
            }
          },
          trigger: 'change'
        }
      ]
    }
  ];
  return fieldList;
};

export const fieldsPoolModal = [
  {
    name: 'name',
    label: '池体编号',
    placeholder: '请填写池体编号',
    type: 'input',
    required: true,
    span: 24,
    wrapperCol: { span: 20 },
    attrs: {
      maxLength: 50
    }
  },
  {
    name: 'locations',
    label: '位置',
    type: 'select',
    span: 24,
    wrapperCol: { span: 20 }
  }
];

export const operationRequestDict = {
  addStructure: {
    url: '/place',
    method: 'post'
  },
  editStructure: {
    url: '/place',
    method: 'put'
  },
  addPool: {
    url: '/place/createFacility',
    method: 'post'
  },
  editPool: {
    url: '/place/createFacility',
    method: 'put'
  }
};
