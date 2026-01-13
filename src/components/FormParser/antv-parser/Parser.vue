<script>
/* eslint-disable no-invalid-this */
/* eslint-disable nonblock-statement-body-position */
import render from '../antv-render/render.js';
import { deepClone, ajax, baseGet } from '../utils/index';
import renderForm from './renderForm';
import renderDescriptions from './renderDescriptions';
import serverConfig from '@/config/server.config';
import logicMixin from './logic';

let { API_BASE_URL: baseURL } = serverConfig;

const ruleTrigger = {
  'a-input': 'blur',
  'a-textarea': 'blur',
  'a-input-password': 'blur',
  'a-input-number': 'blur',
  'a-select': 'change',
  'a-radio-group': 'change',
  'a-checkbox-group': 'change',
  'a-cascader': 'change',
  'a-rate': 'change',
  'a-upload': 'change',
  'vc-upload': 'change',
  tinymce: 'change',
  'a-time-picker': 'change',
  'a-date-picker': 'change',
  'a-range-picker': 'change',
  'vc-year-picker': 'change',
  'vc-range-time': 'change',
  'vc-range-month': 'change'
};

const tagMappers = {
  'el-input': 'a-input',
  'el-input-number': 'a-input-number',
  'el-select': 'a-select',
  'el-radio-group': 'a-radio-group',
  'el-checkbox-group': 'a-checkbox-group',
  'el-cascader': 'a-cascader',
  'el-switch': 'a-switch',
  'el-slider': 'a-slider',
  'el-upload': 'vc-upload',
  'el-button': 'a-button',
  'el-card': 'a-card',
  'el-table': 'vc-table',
  'el-rate': 'a-rate',
  'el-color-picker': 'vc-color-picker',
  'el-time-picker': 'a-time-picker',
  'el-date-picker': 'a-date-picker',
  'a-year-picker': 'vc-year-picker',
  'a-upload': 'vc-upload'
};

const dateModes = ['week', 'month', 'year'];
const dateRangeModes = ['daterange', 'monthrange', 'datetimerange'];

function initFormTag(componentList) {
  componentList.forEach(cur => {
    const config = cur.__config__;

    if (config.componentName) {
      config.tag = config.componentName;
    }

    if (config.tag === 'el-input' && cur.type === 'textarea') {
      config.tag = 'a-textarea';
    }

    if (config.tag === 'el-input' && cur['show-password']) {
      config.tag = 'a-input-password';
    }

    if (config.tag === 'el-date-picker' && dateModes.includes(cur.type)) {
      config.tag = `a-${cur.type}-picker`;
    }

    if (config.tag === 'el-time-picker' && cur['is-range']) {
      config.tag = 'a-date-picker';
    }

    if (config.tag === 'el-date-picker' && dateRangeModes.includes(cur.type)) {
      config.tag = 'a-range-picker';
    }

    config.tag = tagMappers[config.tag] ? tagMappers[config.tag] : config.tag;

    if (config.children) initFormTag(config.children);
  });
}

function setValue(scheme, event, extra) {
  const config = scheme.__config__;
  let model = this[this.formConf.formModel];
  let value = model[scheme.__vModel__];

  if (value !== event) {
    this.$set(config, 'defaultValue', event);
    this.$set(this[this.formConf.formModel], scheme.__vModel__, event);
    this.checkLogic(scheme.__vModel__, event);
  }
}

function setOptions(options, scheme) {
  const config = scheme.__config__;
  const slot = scheme.__slot__;

  this.$set(slot, 'options', options);
}

function getFields(arr, readonly) {
  let fields = [];
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    let config = item.__config__;
    if (config.children) {
      let children = getFields(config.children, readonly);
      item.__config__.children = children;
    }
    if (readonly && config.showItem) {
      fields.push(item);
    } else if (!readonly && config.renderItem) {
      fields.push(item);
    } else if (config.layout === 'rowFormItem') {
      fields.push(item);
    }
  }

  return fields;
}

export default {
  components: {
    render
  },
  mixins: [logicMixin],
  props: {
    formConf: {
      type: Object,
      required: true
    },
    params: {
      type: Object
    },
    baseURL: {
      type: String,
      default: ''
    }
  },
  data() {
    // let fields = this.formConf.fields;

    // if (!this.formConf.disabled) {
    //   this.formConf.fields = getFields(fields, this.formConf.readonly);
    // }
    if (this.formConf.fields) initFormTag(this.formConf.fields);

    // this.formConf.formModel = 'formData';

    const data = {
      formConfCopy: deepClone(this.formConf),
      [this.formConf.formModel]: {},
      [this.formConf.formRules]: {}
    };
    if (data.formConfCopy.fields) {
      this.initFormData(data.formConfCopy.fields, data[this.formConf.formModel]);
    }
    if (!this.formConf.disabled && data.formConfCopy.fields) {
      this.buildRules(data.formConfCopy.fields, data[this.formConf.formRules]);
    }

    return data;
  },
  methods: {
    initFormData(componentList, formData) {
      componentList.forEach(cur => {
        const config = cur.__config__;

        if (config.tag !== 'vc-table' && config.url && config.method) {
          config.url = `${this.baseURL || baseURL}${config.url}`;
          ajax(config, this.params, this.$axios).then(res => {
            if (res) {
              setOptions.call(this, baseGet(res, config.dataKey), cur);
            }
          });
        }

        if (cur.__vModel__) formData[cur.__vModel__] = config.defaultValue;
        if (config.children) this.initFormData(config.children, formData);
      });
    },

    buildRules(componentList, rules) {
      componentList.forEach(cur => {
        const config = cur.__config__;
        if (!config.regList) {
          config.regList = [];
        }
        if (Array.isArray(config.regList)) {
          if (config.required) {
            const required = {
              required: config.required,
              message: cur.placeholder
            };
            if (Array.isArray(config.defaultValue)) {
              required.type = 'array';
              required.message = `请至少选择一个${config.label}`;
            }
            required.message === undefined && (required.message = `${config.label}不能为空`);
            config.regList.push(required);
          }
          rules[cur.__vModel__] = config.regList.map(item => {
            item.pattern && (item.pattern = eval(item.pattern));
            item.trigger = ruleTrigger && ruleTrigger[config.tag];
            return item;
          });
        }
        if (config.children) this.buildRules(config.children, rules);
      });
    },

    formModel() {
      return this[this.formConf.formModel];
    },

    setProp(key, prop, value) {
      if (this.formConfCopy.fields) this.formConfCopy.fields.forEach(item => {
        if (item.__vModel__ === key) {
          item[prop] = value;
        }
      });
    },

    /**
     * 显示一个或多个组件
     */
    show(key) {
      this.formConfCopy.fields.forEach(item => {
        if (item.__vModel__ === key) {
          if (this.formConf.readonly) {
            item.__config__.showItem = true;
            item.__config__.hideItemValue = false;
          } else {
            item.__config__.renderItem = true;
          }
        }
      });
    },

    /**
     * 隐藏一个或多个组件
     */
    hide(key) {
      this.formConfCopy.fields.forEach(item => {
        if (item.__vModel__ === key) {
          if (this.formConf.readonly) {
            item.__config__.showItem = false;
            item.__config__.hideItemValue = false;
          } else {
            item.__config__.renderItem = false;
          }
        }
      });
    },

    /**
     * 设置组件的options
     */
    setFormOptions(key, options) {
      this.formConfCopy.fields.forEach(item => {
        // const options = opts[item.__vModel__];
      });
    },
    /**
     * 表单验证
     */
    checkForm() {
      return new Promise((resolve, reject) => {
        this.$refs[this.formConf.formRef].validate(valid => {
          resolve(valid);
        });
      });
    },
    /**
     * 填充数据
     */
    fillForm(data) {
      let this_ = this;

      function fill(fields) {
        fields.forEach(item => {
          const val = data[item.__vModel__];

          if (typeof val !== 'undefined') {
            setValue.call(this_, item, val);
          }

          if (item.__config__.children && item.__config__.children.length) {
            fill(item.__config__.children);
          }
        });
      }

      if (this.formConfCopy.fields) fill(this.formConfCopy.fields);
    },

    resetForm() {
      this.formConfCopy = deepClone(this.formConf);
      this.$refs[this.formConf.formRef].resetFields();
      this.$emit('reset');
    },

    submitForm() {
      this.$refs[this.formConf.formRef].validate(valid => {
        if (!valid) return false;
        // 触发sumit事件
        this.$emit('submit', this[this.formConf.formModel]);
        return true;
      });
    }
  },

  render(h) {
    if (this.formConf.readonly) {
      return renderDescriptions.call(this, h);
    }
    return renderForm.call(this, h);
  }
};
</script>

<style lang="less">
.ant-form-parser {
  &.ant-form--label-left {
    .ant-form-item-label {
      text-align: left;
    }
  }

  &.ant-form--label-right {
    .ant-form-item-label {
      text-align: right;
    }
  }

  &.ant-form-horizontal {
    .ant-form-item {
      display: flex;
    }

    .ant-form-item-label {
      padding-right: 2px !important;
    }

    .ant-form-item-control-wrapper {
      flex: 1;
    }

    // .ant-form-item-children {
    //   position: relative;
    //   display: block;
    // }
  }

  .ant-form--submit-btns {
    .ant-btn {
      margin-right: 15px;
    }
  }

  .ant-upload-select-picture-card i {
    font-size: 30px;
  }

  .ant-upload__tip {
    margin-top: 8px;
    font-size: 12px;
  }
}

.form-descriptions {
  .form-description-item {
    display: flex;
    margin-bottom: 15px;
  }

  .form-description-item-hidden {
    display: none;
  }

  .form-description-item-column {
    flex-direction: column;

    .form-description-value-wrapper {
      flex: auto;
      margin-top: 5px;
    }
  }

  .form-description-item-label {
    font-weight: 600;
    vertical-align: top;

    &::after {
      position: relative;
      top: -0.5px;
      margin: 0 8px 0 2px;
      content: ' ';
    }
  }

  .form-description-value-wrapper {
    flex: 1;
    word-break: break-all;

    .ant-rate {
      font-size: 12px;
    }

    .vc-color-picker {
      display: block;
      width: 18px;
      height: 18px;

      .vc-color-picker__mask {
        display: none;
      }

      .vc-color-picker__trigger {
        width: 18px;
        height: 18px;
        padding: 0;
      }

      .vc-color-picker__color {
        border: 0;
      }
    }
  }

  .form-description-item-colon {
    &::after {
      content: ':';
    }
  }

  .form-description-item-value {
    font-style: normal;
  }

  .form-description-suffix {
    font-style: normal;
  }
}
</style>
