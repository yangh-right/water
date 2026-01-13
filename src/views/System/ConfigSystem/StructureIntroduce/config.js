export const columnsData = [
  {
    title: '序号',
    width: 80,
    dataIndex: 'key',
    key: 'key',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '区域名称',
    width: 160,
    ellipsis: true,
    dataIndex: 'areaName',
    key: 'areaName'
  },
  {
    title: '长度(m)',
    width: 120,
    ellipsis: true,
    dataIndex: 'length',
    key: 'length'
  },
  {
    title: '宽度(m)',
    width: 120,
    ellipsis: true,
    dataIndex: 'width',
    key: 'width'
  },
  {
    title: '高度(m)',
    width: 120,
    ellipsis: true,
    dataIndex: 'height',
    key: 'height'
  },
  {
    title: '占地面积(㎡)',
    width: 120,
    ellipsis: true,
    dataIndex: 'landArea',
    key: 'landArea'
  },
  {
    title: '功能描述',
    width: 300,
    ellipsis: true,
    dataIndex: 'functionDesc',
    key: 'functionDesc'
  },
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
    label: '区域名称',
    name: 'areaName',
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
    // {
    //   name: 'waterPlantId',
    //   label: '选择污水厂',
    //   placeholder: '请选择污水厂',
    //   type: 'select',
    //   required: true,
    //   span: 12,
    //   wrapperCol: { span: 16 }
    // },
    {
      name: 'areaName',
      label: '区域名称',
      type: 'input',
      placeholder: '请填写区域名称',
      span: 12,
      wrapperCol: { span: 16 }
    },

    {
      name: 'length',
      label: '长度(m)',
      type: 'input-number',
      placeholder: '请填写长度',
      span: 12,
      attrs: { min: 0 },
      wrapperCol: { span: 16 }
    },
    {
      name: 'width',
      label: '宽度(m)',
      type: 'input-number',
      placeholder: '请填写宽度',
      span: 12,
      wrapperCol: { span: 16 }
    },
    {
      name: 'height',
      label: '高度(m)',
      type: 'input-number',
      placeholder: '请填写高度',
      span: 12,
      wrapperCol: { span: 16 }
    },
    {
      name: 'landArea',
      label: '占地面积(㎡)',
      type: 'input-number',
      placeholder: '请填写占地面积',
      span: 12,
      wrapperCol: { span: 16 }
    },
    {
      name: 'functionDesc',
      label: '功能描述	',
      type: 'textarea',
      placeholder: '请填写功能描述',
      span: 24,
      wrapperCol: { span: 20 }
    }
  ];
  return fieldList;
};
