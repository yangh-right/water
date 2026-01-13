import { isURL, isEmail, postcode, bank, haoreg, max50, max100, max500 } from '@/utils/validator';

export const searchForm = {
         waterPlantId: '',
         nameLike: undefined,
         phoneLike: undefined,
         pageFlag: true,
         pageSize: 20,
         currentPage: 1,
         total: 0
       };

export const headerFields = [
  {
    label: '商家名称',
    name: 'nameLike',
    type: 'input',
    placeholder: '请输入商家名称',
    attrs: {
      allowClear: true
    }
  },
  {
    label: '联系电话',
    name: 'phoneLike',
    type: 'input',
    placeholder: '请输入联系电话',
    attrs: {
      allowClear: true
    }
  },
  {
    label: '商家性质',
    name: 'merchantNature',
    type: 'select',
    options: [],
    placeholder: '不限',
    extraOption: [
      {
        label: '不限',
        value: ''
      }
    ],
    attrs: {
      allowClear: true
    }
  }
];

export const columns = [
  {
    title: '商家名称',
    dataIndex: 'name',
    key: 'name',
    width: 120,
    ellipsis: true
  },
  {
    title: '商家性质',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    ellipsis: true
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    width: 150,
    ellipsis: true
  },
  {
    title: '联系电话',
    dataIndex: 'contactsPhone',
    key: 'contactsPhone',
    width: 120,
    ellipsis: true
  },
  {
    title: '关联设备',
    dataIndex: 'deviceNum',
    key: 'deviceNum',
    type: 'link',
    width: 100
  },
  {
    title: '操作',
    width: 220,
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

export const fields = [
  {
    name: 'name',
    type: 'input',
    label: '商家名称',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    placeholder: '请填写商家名称',
    attrs: {
      maxLength: 50
    },
    rules: [
      { required: true, message: '请填写商家名称!' },
      { validator: max50, trigger: 'change' }
    ]
  },
  {
    name: 'property',
    type: 'checkbox-group',
    label: '商家性质',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    options: [
      { label: '供应商', value: 2 },
      { label: '生产厂商', value: 1 }
    ],
    rules: [{ required: true, message: '请选择商家性质!' }],
    placeholder: '请选择商家性质'
  },
  {
    name: 'address',
    type: 'input',
    label: '地址',
    span: 24,
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
    attrs: {
      maxLength: 50
    },
    rules: [
      { required: true, message: '请填写商家地址!' },
      { validator: max50, trigger: 'change' }
    ],
    placeholder: '请填写商家地址'
  },
  {
    name: 'contactsPhone',
    type: 'input',
    label: '联系电话',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    attrs: {
      maxLength: 50
    },
    rules: [
      { required: true, message: '请填写商家联系电话!' },
      { validator: max50, trigger: 'change' }
    ],
    placeholder: '请填写商家联系电话'
  },
  {
    name: 'url',
    type: 'input',
    label: '网址',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    placeholder: '请填写网址',
    attrs: {
      maxLength: 100
    },
    rules: [
      { validator: isURL, trigger: 'change' },
      { validator: max100, trigger: 'change' }
    ]
  },
  {
    name: 'contacts',
    type: 'input',
    label: '联系人',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    placeholder: '请填写联系人',
    attrs: {
      maxLength: 50
    },
    rules: [{ validator: max50, trigger: 'change' }]
  },
  {
    name: 'email',
    type: 'input',
    label: 'E-mail',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    placeholder: '请填写E-mail',
    attrs: {
      maxLength: 50
    },
    rules: [
      { validator: isEmail, trigger: 'change' },
      { validator: max50, trigger: 'change' }
    ]
  },
  {
    name: 'postcode',
    type: 'input',
    label: '邮编',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    placeholder: '请填写邮编',
    rules: [{ validator: postcode, trigger: 'change' }]
  },
  {
    name: 'remark',
    type: 'textarea',
    label: '备注',
    placeholder: '请填写备注',
    span: 24,
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
    attrs: {
      maxLength: 500
    },
    rules: [{ validator: max500, trigger: 'change' }]
  }
];
