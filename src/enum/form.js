export const CREATE_FIELDS = [
  {
    __config__: {
      label: '工单标题',
      labelWidth: null,
      showLabel: true,
      changeTag: true,
      tag: 'el-input',
      _tag: 'a-input',
      tagIcon: 'input',
      required: true,
      renderDefault: true,
      layout: 'colFormItem',
      span: 24,
      document: 'https://element.eleme.cn/#/zh-CN/component/input',
      regList: [{ max: 30, message: '工单标题长度最大30' }],
      renderItem: true,
      showItem: true,
      formId: 1041604040229158,
      renderKey: '1041604040229158'
    },
    __readonly__: {
      span: 1
    },
    __slot__: {
      prepend: '',
      append: '',
      suffix: ''
    },
    placeholder: '请输入工单标题',
    style: {
      width: '100%'
    },
    clearable: true,
    'prefix-icon': '',
    'suffix-icon': '',
    maxlength: 30,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    __vModel__: 'title'
  },
  {
    __config__: {
      label: '工单优先级',
      showLabel: true,
      labelWidth: null,
      tag: 'el-select',
      _tag: 'a-select',
      renderDefault: true,
      tagIcon: 'select',
      layout: 'colFormItem',
      span: 24,
      required: true,
      regList: [],
      dataType: 'dynamic',
      dataKey: 'resultData',
      dataLabel: 'name',
      dataValue: 'code',
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/select',
      renderItem: true,
      showItem: true,
      formId: 1021603345078439,
      renderKey: '1021603345078439',
      url: '/planTankClear/getSysDictItemByCode/ticket_priority',
      method: 'get'
    },
    __readonly__: {
      span: 1
    },
    __slot__: {},
    placeholder: '请选择工单优先级',
    style: {
      width: '100%'
    },
    clearable: true,
    disabled: false,
    filterable: false,
    multiple: false,
    __vModel__: 'priority'
  },
  {
    __config__: {
      label: '工单描述',
      labelWidth: null,
      showLabel: true,
      renderDefault: true,
      tag: 'el-input',
      _tag: 'a-textarea',
      tagIcon: 'textarea',
      required: true,
      layout: 'colFormItem',
      span: 24,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/input',
      renderItem: true,
      showItem: true,
      formId: 1041603345109287,
      renderKey: '1041603345109287'
    },
    __readonly__: {
      span: 1
    },
    type: 'textarea',
    placeholder: '请输入工单描述',
    autosize: {
      minRows: 4,
      maxRows: 4
    },
    style: {
      width: '100%'
    },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    __vModel__: 'questionDescribe'
  }
];

export const ARRIVE_FIELDS = [];

export const DEAL_FIELDS = [];

export const APPROVAL_FIELDS = [
  {
    __config__: {
      label: '是否审核通过',
      labelWidth: null,
      showLabel: true,
      tag: 'el-radio-group',
      renderDefault: true,
      _tag: 'a-radio-group',
      tagIcon: 'radio',
      changeTag: true,
      layout: 'colFormItem',
      span: 24,
      optionType: 'default',
      regList: [],
      required: true,
      border: false,
      document: 'https://element.eleme.cn/#/zh-CN/component/radio',
      renderItem: true,
      showItem: true,
      formId: 1051604381311778,
      renderKey: '1051604381311778',
      dataType: 'static'
    },
    __readonly__: {
      span: 1
    },
    __slot__: {
      options: [
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        }
      ]
    },
    style: {},
    size: 'medium',
    disabled: false,
    __vModel__: 'approval_status'
  },
  {
    __config__: {
      label: '审核意见',
      labelWidth: null,
      showLabel: true,
      tag: 'el-input',
      _tag: 'a-textarea',
      renderDefault: true,
      tagIcon: 'textarea',
      required: true,
      layout: 'colFormItem',
      span: 24,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/input',
      renderItem: true,
      showItem: true,
      formId: 1061604381359840,
      renderKey: '1061604381359840'
    },
    __readonly__: {
      span: 1
    },
    type: 'textarea',
    placeholder: '请输入审核意见',
    autosize: {
      minRows: 4,
      maxRows: 4
    },
    style: {
      width: '100%'
    },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    __vModel__: 'approval_reason'
  }
];

export const OTHER_FIELDS = [];

export default Object.freeze({
  create: CREATE_FIELDS,
  arrive: ARRIVE_FIELDS,
  deal: DEAL_FIELDS,
  approval: APPROVAL_FIELDS,
  other: OTHER_FIELDS
});
