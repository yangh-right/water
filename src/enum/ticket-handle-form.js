/*
 * @Author: chenzh
 * @Date: 2021-01-22 10:29:49
 * @LastEditTime: 2023-06-29 15:31:37
 * @LastEditors: Do not edit
 * @Description:
 * @FilePath: /wisdomwatervue/src/enum/ticket-handle-form.js
 */

const planInspect = [
  {
    __config__: {
      label: '污水厂名称',
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
      renderItem: false,
      showItem: true
    },
    __readonly__: {
      span: 1
    },
    placeholder: '请输入污水厂名称',
    style: {
      width: '100%'
    },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    __vModel__: 'name'
  },
  {
    __config__: {
      label: '签到状态',
      showLabel: false,
      labelWidth: null,
      tag: 'ticket-signin',
      tagIcon: '',
      layout: 'colFormItem',
      span: 24,
      required: true,
      defaultValue: null,
      keepVModel: true,
      regList: [],
      changeTag: true,
      renderItem: true,
      showItem: true,
      url: '',
      method: ''
    },
    __readonly__: {
      span: 1
    },
    __slot__: {
      options: []
    },
    name: '',
    __vModel__: 'signIn'
  },
  {
    __config__: {
      label: '巡检结果',
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
          label: '正常',
          value: '1'
        },
        {
          label: '异常',
          value: '0'
        }
      ]
    },
    style: {},
    size: 'medium',
    disabled: false,
    __vModel__: 'deal_status'
  },
  {
    __config__: {
      label: '处理前图片',
      tag: 'el-upload',
      _tag: 'vc-upload',
      renderDefault: true,
      tagIcon: 'upload',
      layout: 'colFormItem',
      defaultValue: null,
      showLabel: true,
      labelWidth: null,
      required: true,
      span: 24,
      showTip: false,
      buttonText: '点击上传',
      regList: [],
      changeTag: true,
      fileSize: 2,
      sizeUnit: 'MB',
      renderItem: true,
      showItem: true
    },
    __slot__: {
      'list-type': true
    },
    __readonly__: {
      span: 3
    },
    action: '',
    disabled: false,
    accept: '',
    name: 'file',
    'auto-upload': true,
    'list-type': 'text',
    multiple: true,
    __vModel__: 'pre_processing_images'
  },
  {
    __config__: {
      label: '处理后图片',
      tag: 'el-upload',
      _tag: 'vc-upload',
      tagIcon: 'upload',
      renderDefault: true,
      layout: 'colFormItem',
      defaultValue: null,
      showLabel: true,
      labelWidth: null,
      required: true,
      span: 24,
      showTip: false,
      buttonText: '点击上传',
      regList: [],
      changeTag: true,
      fileSize: 2,
      sizeUnit: 'MB',
      renderItem: true,
      showItem: true
    },
    __slot__: {
      'list-type': true
    },
    __readonly__: {
      span: 3
    },
    action: '',
    disabled: false,
    accept: '',
    name: 'file',
    'auto-upload': true,
    'list-type': 'text',
    multiple: true,
    __vModel__: 'post_processing_images'
  },
  {
    __config__: {
      label: '巡检描述',
      labelWidth: null,
      showLabel: true,
      renderDefault: true,
      tag: 'el-input',
      tagIcon: '',
      required: true,
      layout: 'colFormItem',
      span: 24,
      regList: [],
      changeTag: true,
      renderItem: true,
      showItem: true
    },
    __readonly__: {
      span: 3
    },
    type: 'textarea',
    placeholder: '请输入巡检描述',
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
    __vModel__: 'remark'
  },
  {
    __config__: {
      label: '巡检协作人',
      labelWidth: null,
      showLabel: true,
      renderDefault: true,
      tag: 'el-input',
      tagIcon: '',
      required: true,
      layout: 'colFormItem',
      span: 24,
      regList: [],
      changeTag: true,
      renderItem: true,
      showItem: true
    },
    __readonly__: {
      span: 3
    },
    placeholder: '请输入巡检协作人',
    style: {
      width: '100%'
    },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    __vModel__: 'collaborative_people'
  }
];

const planTankClear = [
  {
    __config__: {
      label: '水箱名称',
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
      renderItem: false,
      showItem: true
    },
    __readonly__: {
      span: 1
    },
    placeholder: '请输入水箱名称',
    style: {
      width: '100%'
    },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    __vModel__: 'name'
  },
  {
    __config__: {
      label: '签到状态',
      showLabel: true,
      labelWidth: null,
      defaultValue: null,
      tag: 'ticket-signin',
      tagIcon: '',
      layout: 'colFormItem',
      span: 24,
      required: true,
      keepVModel: true,
      regList: [],
      changeTag: true,
      renderItem: true,
      showItem: true,
      url: '',
      method: ''
    },
    __readonly__: {
      span: 1
    },
    __slot__: {
      options: []
    },
    name: '',
    __vModel__: 'signIn'
  },
  {
    __config__: {
      label: '清洗结果',
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
          label: '已完成',
          value: '1'
        },
        {
          label: '未完成',
          value: '0'
        }
      ]
    },
    style: {},
    size: 'medium',
    disabled: false,
    __vModel__: 'deal_status'
  },
  {
    __config__: {
      label: '清洗前图片',
      tag: 'el-upload',
      _tag: 'vc-upload',
      renderDefault: true,
      tagIcon: 'upload',
      layout: 'colFormItem',
      defaultValue: null,
      showLabel: true,
      labelWidth: null,
      required: true,
      span: 24,
      showTip: false,
      buttonText: '点击上传',
      regList: [],
      changeTag: true,
      fileSize: 2,
      sizeUnit: 'MB',
      renderItem: true,
      showItem: true
    },
    __slot__: {
      'list-type': true
    },
    __readonly__: {
      span: 3
    },
    action: '',
    disabled: false,
    accept: '',
    name: 'file',
    'auto-upload': true,
    'list-type': 'text',
    multiple: true,
    __vModel__: 'pre_processing_images'
  },
  {
    __config__: {
      label: '清洗后图片',
      tag: 'el-upload',
      _tag: 'vc-upload',
      tagIcon: 'upload',
      renderDefault: true,
      layout: 'colFormItem',
      defaultValue: null,
      showLabel: true,
      labelWidth: null,
      required: true,
      span: 24,
      showTip: false,
      buttonText: '点击上传',
      regList: [],
      changeTag: true,
      fileSize: 2,
      sizeUnit: 'MB',
      renderItem: true,
      showItem: true
    },
    __slot__: {
      'list-type': true
    },
    __readonly__: {
      span: 3
    },
    action: '',
    disabled: false,
    accept: '',
    name: 'file',
    'auto-upload': true,
    'list-type': 'text',
    multiple: true,
    __vModel__: 'post_processing_images'
  },
  {
    __config__: {
      label: '清洗描述',
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
      renderItem: true,
      showItem: true
    },
    __readonly__: {
      span: 3
    },
    type: 'textarea',
    placeholder: '请输入清洗描述',
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
    __vModel__: 'remark'
  },
  {
    __config__: {
      label: '清洗协作人',
      labelWidth: null,
      showLabel: true,
      renderDefault: true,
      tag: 'el-input',
      tagIcon: '',
      required: true,
      layout: 'colFormItem',
      span: 24,
      regList: [],
      changeTag: true,
      renderItem: true,
      showItem: true
    },
    __readonly__: {
      span: 3
    },
    placeholder: '请输入清洗协作人',
    style: {
      width: '100%'
    },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    __vModel__: 'collaborative_people'
  }
];

const maintain = [
  {
    __config__: {
      label: '配件名称',
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
      renderItem: false,
      showItem: true
    },
    __readonly__: {
      span: 1
    },
    placeholder: '请输入配件名称',
    style: {
      width: '100%'
    },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    __vModel__: 'name'
  },
  {
    __config__: {
      label: '签到状态',
      showLabel: true,
      labelWidth: null,
      defaultValue: null,
      tag: 'ticket-signin',
      tagIcon: '',
      layout: 'colFormItem',
      span: 24,
      required: true,
      keepVModel: true,
      regList: [],
      changeTag: true,
      renderItem: true,
      showItem: true,
      url: '',
      method: ''
    },
    __readonly__: {
      span: 1
    },
    __slot__: {
      options: []
    },
    name: '',
    __vModel__: 'signIn'
  },
  {
    __config__: {
      label: '保养结果',
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
          label: '已完成',
          value: '1'
        },
        {
          label: '未完成',
          value: '0'
        }
      ]
    },
    style: {},
    size: 'medium',
    disabled: false,
    __vModel__: 'deal_status'
  },
  {
    __config__: {
      label: '保养前图片',
      tag: 'el-upload',
      _tag: 'vc-upload',
      renderDefault: true,
      tagIcon: 'upload',
      layout: 'colFormItem',
      defaultValue: null,
      showLabel: true,
      labelWidth: null,
      required: true,
      span: 24,
      showTip: false,
      buttonText: '点击上传',
      regList: [],
      changeTag: true,
      fileSize: 2,
      sizeUnit: 'MB',
      renderItem: true,
      showItem: true
    },
    __slot__: {
      'list-type': true
    },
    __readonly__: {
      span: 3
    },
    action: '',
    disabled: false,
    accept: '',
    name: 'file',
    'auto-upload': true,
    'list-type': 'text',
    multiple: true,
    __vModel__: 'pre_processing_images'
  },
  {
    __config__: {
      label: '保养后图片',
      tag: 'el-upload',
      _tag: 'vc-upload',
      tagIcon: 'upload',
      renderDefault: true,
      layout: 'colFormItem',
      defaultValue: null,
      showLabel: true,
      labelWidth: null,
      required: true,
      span: 24,
      showTip: false,
      buttonText: '点击上传',
      regList: [],
      changeTag: true,
      fileSize: 2,
      sizeUnit: 'MB',
      renderItem: true,
      showItem: true
    },
    __slot__: {
      'list-type': true
    },
    __readonly__: {
      span: 3
    },
    action: '',
    disabled: false,
    accept: '',
    name: 'file',
    'auto-upload': true,
    'list-type': 'text',
    multiple: true,
    __vModel__: 'post_processing_images'
  },
  {
    __config__: {
      label: '保养描述',
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
      renderItem: true,
      showItem: true
    },
    __readonly__: {
      span: 3
    },
    type: 'textarea',
    placeholder: '请输入保养描述',
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
    __vModel__: 'remark'
  },
  {
    __config__: {
      label: '保养协作人',
      labelWidth: null,
      showLabel: true,
      renderDefault: true,
      tag: 'el-input',
      tagIcon: '',
      required: true,
      layout: 'colFormItem',
      span: 24,
      regList: [],
      changeTag: true,
      renderItem: true,
      showItem: true
    },
    __readonly__: {
      span: 3
    },
    placeholder: '请输入保养协作人',
    style: {
      width: '100%'
    },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    __vModel__: 'collaborative_people'
  }
];

export default Object.freeze({
  planInspect,
  planTankClear,
  maintain
});
