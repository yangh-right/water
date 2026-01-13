/* eslint-disable no-invalid-this */
import VcYearPicker from '../vc-year-picker';
import FormText from '../form-text';

import { deepClone } from '../utils/index';
import { renderDescription, renderDatePicker } from './renderDescription';

const componentChild = {};
const attrChild = {};
const AntvInputElems = ['a-input', 'a-textarea', 'a-input-password'];
const AntvGroupElems = ['a-radio-group', 'a-checkbox-group', 'vc-color-picker'];
const datePickerElems = [
  'a-date-picker',
  'a-week-picker',
  'a-month-picker',
  'a-range-picker',
  'vc-year-picker',
  'vc-range-time',
  'vc-range-month'
];
const disabledElems = ['a-button'];

/**
 * 将./slots中的文件挂载到对象componentChild上
 * 文件名为key，对应JSON配置中的__config__.tag
 * 文件内容为value，解析JSON配置中的__slot__
 */
const slotsFiles = require.context('./slots', false, /\.js$/);
const keys = slotsFiles.keys() || [];
keys.forEach(key => {
  const tag = key.replace(/^\.\/(.*)\.\w+$/, '$1');
  const value = slotsFiles(key).default;
  componentChild[tag] = value;
});

const attrsFiles = require.context('./attrs', false, /\.js$/);
const attrKeys = attrsFiles.keys() || [];
attrKeys.forEach(key => {
  const tag = key.replace(/^\.\/(.*)\.\w+$/, '$1');
  const value = attrsFiles(key).default;
  attrChild[tag] = value;
});

function getUploadSuccessFiles(fileList) {
  return fileList.map(file => {
    return {
      uid: file.uid,
      name: file.name,
      status: file.status,
      url: file.response ? file.response.id : ''
    };
  });
}

function vModel(dataObject, defaultValue) {
  let tag = this.tag || this.conf.__config__.tag;
  let valueProp = tag === 'a-switch' ? 'checked' : 'value';

  dataObject.props[valueProp] = defaultValue;

  dataObject.on.input = (event, extra) => {
    let value = event;
    if (AntvInputElems.indexOf(tag) > -1) {
      value = event.target.value;
    }

    this.$emit('input', value, extra);
  };

  dataObject.on.change = (event, extra) => {
    // 部分元素没有发送 input，手动触发
    if (tag === 'a-upload') {
      let fileList = getUploadSuccessFiles(event.fileList);
      this.$emit('input', fileList);
    } else if (!(AntvInputElems.indexOf(tag) > -1) && !(AntvGroupElems.indexOf(tag) > -1)) {
      this.$emit('input', event);
    }

    this.$emit('change', event, extra);
  };

  dataObject.on.blur = event => {
    this.$emit('blur', event);
  };
}

function mountSlotFlies(h, confClone, children) {
  const tag = this.tag || confClone.__config__.tag;
  const childObjs = componentChild[tag];
  if (childObjs) {
    Object.keys(childObjs).forEach(key => {
      const childFunc = childObjs[key];
      if (confClone.__slot__ && confClone.__slot__[key]) {
        children.push(childFunc(h, confClone, key));
      }
    });
  }
}

function emitEvents(confClone) {
  ['on', 'nativeOn'].forEach(attr => {
    const eventKeyList = Object.keys(confClone[attr] || {});
    eventKeyList.forEach(key => {
      const val = confClone[attr][key];
      if (typeof val === 'string') {
        confClone[attr][key] = event => this.$emit(val, event);
      }
    });
  });
}

// eslint-disable-next-line max-params
function buildDataObject(confClone, dataObject, disabled, readonly) {
  const tag = this.tag || confClone.__config__.tag;

  Object.keys(confClone).forEach(key => {
    const val = confClone[key];
    if (key === '__vModel__') {
      vModel.call(this, dataObject, confClone.__config__.defaultValue);
    } else if (dataObject[key] !== undefined) {
      if (
        dataObject[key] === null ||
        dataObject[key] instanceof RegExp ||
        ['boolean', 'string', 'number', 'function'].includes(typeof dataObject[key])
      ) {
        dataObject[key] = val;
      } else if (Array.isArray(dataObject[key])) {
        dataObject[key] = [...dataObject[key], ...val];
      } else {
        dataObject[key] = { ...dataObject[key], ...val };
      }
    } else {
      let buildAttrFunc = attrChild[tag];
      if (buildAttrFunc) {
        buildAttrFunc.call(this, dataObject.attrs, key, val);
      } else {
        dataObject.attrs[key] = val;
      }
    }
  });
  if (tag === 'a-select' ) {
    dataObject.props.getPopupContainer = triggerNode => {
      return triggerNode.parentNode || document.body;
    };
  }
  if (datePickerElems.includes(tag)) {
    dataObject.props.getCalendarContainer = triggerNode => {
      return triggerNode.parentNode || document.body;
    };
  }

  dataObject.props.disabled = !!disabled;
  dataObject.attrs.disabled = !!disabled;
  dataObject.props.readonly = !!readonly;

  // 清理属性
  clearAttrs(dataObject);
}

function clearAttrs(dataObject) {
  delete dataObject.attrs.__config__;
  delete dataObject.attrs.__slot__;
  delete dataObject.attrs.__methods__;
  delete dataObject.attrs.__readonly__;
  delete dataObject.attrs.__listeners__;
}

function makeDataObject() {
  return {
    class: {},
    attrs: {},
    props: {},
    domProps: {},
    nativeOn: {},
    on: {},
    style: {},
    directives: [],
    scopedSlots: {},
    slot: null,
    key: null,
    ref: null,
    refInFor: true
  };
}

function renderDesctiption(h) {
  const confClone = deepClone(this.conf);
  const tag = this.tag || confClone.__config__.tag;
  const disabled = !disabledElems.includes(tag);
  const readonly = true;

  if (datePickerElems.includes(tag)) {
    return renderDatePicker.call(this, h, confClone);
  } else {
    const value = renderDescription.call(this, h, confClone);
    if (!value) {
      return renderFormItem.call(this, h, disabled, readonly);
    }

    return value;
  }
}

function renderFormItem(h, disabled, readonly) {
  const dataObject = makeDataObject();
  const confClone = deepClone(this.conf);
  const children = this.$slots.default || [];
  const tag = this.tag || this.conf.__config__.tag;

  // 如果slots文件夹存在与当前tag同名的文件，则执行文件中的代码
  mountSlotFlies.call(this, h, confClone, children);

  // 将字符串类型的事件，发送为消息
  emitEvents.call(this, confClone);

  // 将json表单配置转化为vue render可以识别的 “数据对象（dataObject）”
  buildDataObject.call(this, confClone, dataObject, disabled, readonly);

  return h(tag, dataObject, children);
}

export default {
  props: {
    conf: {
      type: Object,
      required: true
    },
    description: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    tag: {
      type: String,
      default: '',
      required: false
    }
  },
  components: {
    VcYearPicker,
    FormText
  },
  render(h) {
    if (this.description) {
      return renderDesctiption.call(this, h);
    }

    return renderFormItem.call(this, h, this.disabled, false);
  }
};
