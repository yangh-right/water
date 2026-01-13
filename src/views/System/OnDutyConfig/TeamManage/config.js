import moment from 'moment';

export const fields = [
  {
    label: '选择污水厂：',
    name: 'waterPlantId',
    type: 'select',
    colon: true,
    span: 8,
    wrapperCol: { span: 18 }
  },
  {
    label: '班组名称：',
    name: 'nameLike',
    type: 'input',
    placeholder: '请输入班组名称',
    colon: true,
    attrs: {
      maxLength: 32
    },
    span: 8,
    wrapperCol: { span: 18 }
  }
];

export const modelFields = [
  {
    submit: true,
    required: true,
    colon: true,
    name: 'waterPlantId',
    label: '选择污水厂',
    type: 'select',
    options: [],
    disabled: false
  },
  {
    submit: true,
    required: true,
    colon: true,
    name: 'name',
    label: '班组名称',
    type: 'input',
    placeholder: '请输入班组名称',
    disabled: false
  },
  {
    submit: true,
    colon: true,
    required: true,
    name: 'crews',
    label: '班组人员',
    disabled: false,
    type: 'tree-select',
    attrs: {
      'tree-data': [],
      'dropdown-style': {
        maxHeight: '300px',
        overflow: 'auto'
      },
      replaceFields: {
        title: 'name',
        key: 'key',
        value: 'id'
      },
      'tree-default-expand-all': true,
      multiple: true
    }
  },
  {
    submit: true,
    colon: true,
    disabled: false,
    name: 'remark',
    label: '备注',
    type: 'input'
  }
];

export const columns = [
  {
    title: '班组名称',
    dataIndex: 'name',
    ellipsis: true,
    width: 150
  },
  {
    title: '班组人员',
    dataIndex: 'crewName',
    width: 150,
    ellipsis: true
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    ellipsis: true,
    customRender: text => {
      return moment(text).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    ellipsis: true
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime',
    ellipsis: true,
    customRender: text => {
      return moment(text).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  {
    title: '修改人',
    dataIndex: 'updateUser',
    ellipsis: true
  },
  {
    title: '是否有效',
    width: 100,
    dataIndex: 'validFlag',
    type: 'switch'
  },
  {
    title: '操作',
    width: 120,
    type: 'action',
    events: [
      {
        key: 'infoEdit',
        name: '修改'
      },
      {
        key: 'infoDetail',
        name: '详情'
      }
    ]
  }
];
export const res = {
  count: 3,
  errorCode: null,
  errorMessage: null,
  resultData: [
    {
      createTime: 1650356126000,
      createUser: '污水厂管理员',
      crew: '869d28ecf5071b5a81c92c4ea4feb922',
      crewName: '赵陆',
      id: '1821a33dcb73a5523f0a633585e82860',
      name: '三组1',
      remark: null,
      updateTime: 1650525434000,
      updateUser: '污水厂管理员',
      validFlag: 1,
      waterPlantId: '1515879694258409473',
      waterPlantName: null
    },
    {
      createTime: 1650356118000,
      createUser: '污水厂管理员',
      crew: 'e032902cadc93bc74ca8ab34aa60fb23,4a8f9870b86958bb45a110f3b82020fd',
      crewName: '污水厂管理员,李斯',
      id: '85b0746cfd3c2ad2a3f45cbc44bbe4c2',
      name: '二组',
      remark: null,
      updateTime: 1650356118000,
      updateUser: '污水厂管理员',
      validFlag: 1,
      waterPlantId: '1515879694258409473',
      waterPlantName: null
    },
    {
      createTime: 1650356102000,
      createUser: '污水厂管理员',
      crew: '478f0699f6b14a207329378d5801a8e8,43c3d55e44aebaccb7858724424d6398',
      crewName: '王五,张三',
      id: '7513e91cb2e7e5e51ca19a7360e7f15b',
      name: '一组',
      remark: null,
      updateTime: 1650356102000,
      updateUser: '污水厂管理员',
      validFlag: 1,
      waterPlantId: '1515879694258409473',
      waterPlantName: null
    }
  ],
  status: 'complete',
  success: true
};
