/*
 * @Author: wangyr
 * @Date: 2023-04-11 11:33:16
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-29 15:33:39
 * @Description:
 */
// prettier-ignore
const table = [
  {
    title: '水箱维保内容',
    fields: [
      { title: '是否清洗消毒水箱', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否清洁水箱外部卫生', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否处理箱体焊缝', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否加固及密封人孔(检修孔)', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否冲洗水箱水位计', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否清洗过滤器/倒流防止器', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否保养浮球控制阀/遥控浮球阀', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否对松动拉筋加固', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] }
    ]
  },
  {
    title: '控制柜维保内容',
    fields: [
      { title: '是否清理控制柜外体灰尘等', options: ['是', '否'], remark: 'string', show: ['quarter', 'semi', 'year'] },
      { title: '是否对电气元器件进行除尘', options: ['是', '否'], remark: 'string', show: ['quarter', 'semi', 'year'] },
      { title: '是否检查散热器温度并清洁散热器', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否紧固接线端子', options: ['是', '否'], remark: 'string', show: ['year'] }
    ]
  },
  {
    title: '设备机组维保内容',
    fields: [
      { title: '是否固定基础螺栓', options: ['是', '否'], remark: 'string', show: ['year'] },
      { title: '是否清理电动机外体灰尘等', options: ['是', '否'], remark: 'string', show: ['year'] },
      { title: '是否对水泵轴承加油', options: ['是', '否'], remark: 'string', show: ['year'] },
      { title: '是否处理老化减震器', options: ['是', '否'], remark: 'string', show: ['year'] },
      { title: '是否处理电动机外壳接地', options: ['是', '否'], remark: 'string', show: ['year'] },
      { title: '是否处理辅助仪表', options: ['是', '否'], remark: 'string', show: ['year'] }
    ]
  },
  {
    title: '其他',
    fields: [
      { title: '是否检查水箱自洁消毒器冷凝水管的通畅', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否对水力阀和过滤器进行清理', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否对基础槽钢进行油漆修补', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否清洗紫外线消毒器石英套管', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否检查并更换紫外线消毒器灯管', options: ['是', '否'], remark: 'string', show: ['semi', 'year'] },
      { title: '是否更换绝缘不达标的电源线', options: ['是', '否'], remark: 'string', show: ['year'] },
      { title: '是否对对污水厂内各类设备进行油漆修补', options: ['是', '否'], remark: 'string', show: ['year'] }
    ]
  }
];

const OPTION_MAP = {
  是: '1',
  否: '0',
  正常: '1',
  非正常: '0'
};

export function createLabel(text, index) {
  return {
    bold: false,
    align: 'left',
    color: '#141414',
    italic: false,
    throuth: false,
    fontSize: 14,
    underline: false,
    __config__: {
      tag: 'form-text',
      _tag: 'form-text',
      span: 24,
      label: '文字',
      layout: 'colFormItem',
      regList: [],
      tagIcon: 'input',
      required: false,
      showItem: true,
      changeTag: true,
      showLabel: false,
      labelWidth: null,
      renderItem: true,
      defaultValue: text
    },
    __vModel__: `field_label_${index}`,
    __readonly__: { span: 3 }
  };
}

export function createRow(fields, type, index) {
  let row = {
    type: 'default',
    align: 'top',
    justify: 'start',
    __config__: {
      span: 24,
      layout: 'rowFormItem',
      children: []
    }
  };

  let list = fields.filter(o => o.show.includes(type));

  list.forEach((field, idx) => {
    let options = field.options.map(o => ({ label: o, value: OPTION_MAP[o] }));
    row.__config__.children.push({
      size: 'medium',
      style: {},
      __slot__: {
        options
      },
      disabled: false,
      __config__: {
        tag: 'el-radio-group',
        _tag: 'a-radio-group',
        span: 12,
        label: `${idx + 1}.${field.title}`,
        border: false,
        layout: 'colFormItem',
        regList: [],
        tagIcon: 'radio',
        dataType: 'static',
        required: true,
        showItem: true,
        changeTag: true,
        showLabel: true,
        labelWidth: null,
        optionType: 'default',
        renderItem: true
      },
      __vModel__: `field_radio_${index}_${idx}`,
      __readonly__: { span: 1 }
    });
    row.__config__.children.push({
      style: { width: '100%' },
      disabled: false,
      readonly: false,
      clearable: true,
      maxlength: null,
      __config__: {
        tag: field.remark === 'string' ? 'el-input' : 'el-input-number',
        _tag: field.remark === 'string' ? 'a-input' : 'a-input-number',
        span: 12,
        label: '备注',
        layout: 'colFormItem',
        regList: [],
        tagIcon: 'input',
        required: false,
        showItem: true,
        changeTag: true,
        showLabel: true,
        labelWidth: null,
        renderItem: true
      },
      __vModel__: `field_remark_${index}_${idx}`,
      placeholder: '请输入备注',
      'prefix-icon': '',
      'suffix-icon': '',
      __readonly__: { span: 2 },
      'show-word-limit': false
    });
  });

  return row;
}

export function createFooter(fields) {
  fields.push({
    __config__: {
      tag: 'e-sign',
      _tag: 'e-sign',
      span: 24,
      label: '电子签名',
      layout: 'colFormItem',
      regList: [],
      tagIcon: '',
      required: true,
      showItem: true,
      changeTag: true,
      showLabel: true,
      labelWidth: null,
      renderItem: true,
      defaultValue: null
    },
    __vModel__: `field_esign_${fields.length}`,
    __readonly__: { span: 2 }
  });
}

export function createHeader(fields) {
  fields.push({
    __config__: {
      label: '项目名称',
      labelWidth: null,
      showLabel: false,
      renderDefault: true,
      tag: 'pump-table',
      required: false,
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
    style: {
      width: '100%'
    },
    __vModel__: 'currentId'
  });

  fields.push({
    __config__: {
      label: '维保日期',
      tag: 'el-date-picker',
      tagIcon: 'date',
      defaultValue: null,
      showLabel: true,
      labelWidth: null,
      span: 24,
      layout: 'colFormItem',
      required: true,
      regList: [],
      changeTag: true,
      renderItem: true,
      showItem: true
    },
    __readonly__: {
      span: 1
    },
    placeholder: '请选择',
    type: 'datetime',
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    format: 'yyyy-MM-dd',
    'value-format': 'yyyy-MM-dd',
    readonly: false,
    __vModel__: 'inspect_time'
  });

  fields.push({
    // 组件的自定义配置
    __config__: {
      label: '维保人员',
      labelWidth: null,
      showLabel: true,
      changeTag: true,
      keepVModel: true,
      tag: 'el-input',
      tagIcon: 'input',
      defaultValue: undefined,
      required: false,
      layout: 'colFormItem',
      span: 24,
      // 正则校验规则
      regList: [],
      renderItem: false,
      showItem: false,
      hideItemValue: false
    },
    __readonly__: {
      span: 1
    },
    // 组件的插槽属性
    __slot__: {
      prepend: '',
      append: '',
      suffix: ''
    },
    // 其余的为可直接写在组件标签上的属性
    placeholder: '请输入',
    style: { width: '100%' },
    clearable: true,
    'prefix-icon': '',
    'suffix-icon': '',
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    __vModel__: 'inspect_username'
  });

  fields.push({
    __config__: {
      label: '到达时间',
      tag: 'el-date-picker',
      tagIcon: 'date',
      defaultValue: null,
      showLabel: true,
      labelWidth: null,
      span: 24,
      layout: 'colFormItem',
      required: true,
      regList: [],
      changeTag: true,
      renderItem: true,
      showItem: true
    },
    __readonly__: {
      span: 1
    },
    placeholder: '请选择',
    type: 'datetime',
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    format: 'yyyy-MM-dd hh:mm',
    'value-format': 'yyyy-MM-dd hh:mm',
    readonly: false,
    __vModel__: 'arrive_time'
  });

  fields.push({
    __config__: {
      label: '离开时间',
      tag: 'el-date-picker',
      tagIcon: 'date',
      defaultValue: null,
      showLabel: true,
      labelWidth: null,
      span: 24,
      layout: 'colFormItem',
      required: true,
      regList: [],
      changeTag: true,
      renderItem: true,
      showItem: true
    },
    __readonly__: {
      span: 1
    },
    placeholder: '请选择',
    type: 'datetime',
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    format: 'yyyy-MM-dd hh:mm',
    'value-format': 'yyyy-MM-dd hh:mm',
    readonly: false,
    __vModel__: 'leave_time'
  });

  fields.push({
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
      span: 8,
      optionType: 'default',
      regList: [],
      required: true,
      border: false,
      renderItem: true,
      showItem: true,
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
  });
}

export default function makeMaintainFields(type) {
  let fields = [];

  createHeader(fields);

  table.forEach((item, index) => {
    let label = createLabel(item.title, index);
    let row = createRow(item.fields, type, index);

    if (row.__config__.children.length) {
      fields.push(label);
      fields.push(row);
    }
  });

  createFooter(fields);

  return fields;
}
