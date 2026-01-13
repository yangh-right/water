// prettier-ignore
const table = [
  {
    title: '水箱巡检内容',
    fields: [
      { title: '环境卫生', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '排水系统', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '箱体', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '人孔（检修孔）', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '防虫网罩', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '各类阀件', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '附属管道', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '内外扶梯', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '水位控制装置', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '浮球控制阀/遥控浮球阀', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '固定拉筋', options: ['正常', '非正常'], remark: 'string', show: ['quarter', 'year'] },
      { title: '负压保护功能测试', options: ['正常', '非正常'], remark: 'string', show: ['quarter', 'year'] }
    ]
  },
  {
    title: '污水厂巡检内容',
    fields: [
      { title: '环境卫生', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '排水系统', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '水泵运行温度检测', options: ['正常', '非正常'], remark: 'number', show: ['week', 'month', 'quarter', 'year'] },
      { title: '水泵机械密封检测', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '水泵外露部件', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '电动机运行现象', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '电动机工作电流检测', options: ['正常', '非正常'], remark: 'number', show: ['week', 'month', 'quarter', 'year'] },
      { title: '电动机工作电压检测', options: ['正常', '非正常'], remark: 'number', show: ['week', 'month', 'quarter', 'year'] },
      { title: '电动机声音', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '水泵外观是否掉漆', options: ['是', '否'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '电动机振动', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '水泵运行水位检测', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '水泵振动检测', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '压力表、压力变送器', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '电动机温度', options: ['正常', '非正常'], remark: 'number', show: ['month', 'quarter', 'year'] },
      { title: '电动机轴承', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '电动机散热系统清理', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '除湿机', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '安防系统', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] }
    ]
  },
  {
    title: '控制柜巡检内容',
    fields: [
      { title: '箱体外观', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '工作电源', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '工作电压', options: ['正常', '非正常'], remark: 'number', show: ['week', 'month', 'quarter', 'year'] },
      { title: '各类指示灯及旋转开关', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '断电复位', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '控制仪表', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '空气开关', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '接触器', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '热继电器、中间继电器', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '接线端', options: ['是', '否'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '变频器运行频率、温度、电流、故障记录', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: 'PLC', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '文本显示器', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '手自动切换', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '定时切换功能测试', options: ['正常', '非正常'], remark: 'string', show: ['quarter', 'year'] },
      { title: '故障互投功能测试', options: ['正常', '非正常'], remark: 'string', show: ['quarter', 'year'] },
      { title: '电气除尘', options: ['是', '否'], remark: 'string', show: ['year'] },
      { title: '元器件电路紧线', options: ['是', '否'], remark: 'string', show: ['year'] }
    ]
  },
  {
    title: '其他',
    fields: [
      { title: '污水厂内各类阀门', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '污水厂内的附属管道', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '标示牌是否完整', options: ['是', '否'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '污水厂内通风状况', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '污水厂内照明设施', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '污水厂门、窗', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '消毒设施', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '污水厂墙面', options: ['正常', '非正常'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '进出水压力表是否与触摸屏一致', options: ['是', '否'], remark: 'string', show: ['week', 'month', 'quarter', 'year'] },
      { title: '止回阀', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '历史记录', options: ['正常', '非正常'], remark: 'string', show: ['month', 'quarter', 'year'] },
      { title: '水力阀、过滤器清理检查', options: ['正常', '非正常'], remark: 'string', show: ['year'] },
      { title: '紧固螺栓', options: ['是', '否'], remark: 'string', show: ['year'] }
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
    tip: '',
    name: 'file',
    accept: '',
    __slot__: { 'list-type': true },
    disabled: false,
    multiple: true,
    __config__: {
      tag: 'vc-file-upload',
      _tag: 'vc-file-upload',
      span: 24,
      label: '文件上传',
      limit: 9,
      layout: 'colFormItem',
      regList: [],
      tagIcon: 'upload',
      fileSize: 10,
      required: false,
      showItem: true,
      sizeUnit: 'MB',
      changeTag: true,
      showLabel: true,
      buttonText: '点击上传',
      labelWidth: null,
      renderItem: true,
      defaultValue: null
    },
    __vModel__: `field_file_${fields.length}`,
    buttonText: '点击上传',
    'auto-upload': true,
    __readonly__: { span: 2 }
  });
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
      label: '巡检日期',
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
      label: '巡检人员',
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
      label: '巡检结果',
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

export default function makeInspectFields(type) {
  let fields = [];

  createHeader(fields);

  table.forEach((item, index) => {
    let label = createLabel(item.title, index);
    let row = createRow(item.fields, type, index);

    fields.push(label);
    fields.push(row);
  });

  createFooter(fields);

  return fields;
}
