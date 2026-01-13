/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/* eslint-disable max-params */
import dateFormat from './utils/date-format';

export function renderDescription(h, confClone) {
  const config = confClone.__config__;
  const slots = confClone.__slot__ || {};
  const { tag, defaultValue, dataLabel = 'label', dataValue = 'value' } = config;

  let value = null;

  switch (tag) {
    case 'a-input':
    case 'a-textarea':
    case 'a-input-number':
    case 'a-input-password':
    case 'a-time-picker':
    case 'a-slider':
      value = makeValue(
        h,
        Array.isArray(defaultValue) ? defaultValue.join('-') : defaultValue,
        slots.suffix
      );
      break;
    case 'tinymce':
      value = renderHTML(h, defaultValue);
      break;
    case 'a-switch':
      let text = defaultValue ? confClone['active-text'] : confClone['inactive-text'];
      value = makeValue(h, text, '');
      break;
    case 'a-checkbox-group':
    case 'a-radio-group':
    case 'a-select':
      value = renderSelect(h, defaultValue, slots.options, dataLabel, dataValue);
      break;
    case 'a-cascader':
      value = renderCascader(h, defaultValue, confClone.options, dataLabel, dataValue);
    default:
      break;
  }

  return value;
}

export function renderDatePicker(h, conf) {
  let defaultValue = conf.__config__.defaultValue;
  let valueFormat = conf.format;
  let separator = conf['range-separator'];
  let value = dateFormat(defaultValue, valueFormat, separator);

  return makeValue(h, value);
}

function renderSelect(h, defaultValue, options = [], dataLabel, dataValue) {
  if (!Array.isArray(defaultValue)) {
    defaultValue = [defaultValue];
  }

  let values = defaultValue.map(v => {
    let item = options.find(item => item[dataValue] == v);
    let label = item ? item[dataLabel] : '';

    return label;
  });

  return makeValue(h, values.join(','), '');
}

function renderCascader(h, defaultValue, options = [], dataLabel, dataValue) {
  let cursor = { children: options };
  let currentIndex = 0;
  let values = [];

  while (cursor && cursor.children) {
    let item = cursor.children.find(item => item[dataValue] == defaultValue[currentIndex]);

    currentIndex++;
    cursor = item;
    if (item) {
      values.push(item[dataLabel]);
    }
  }
  return makeValue(h, values.join('/'));
}

function renderSwitch(h, defaultValue, activeText, inactiveText) {}

function renderHTML(h, value) {
  return <span class={'form-description-value'} domProps={{ innerHTML: value }}></span>;
}

function makeValue(h, value, suffix) {
  let unit = suffix ? <em class={'form-description-suffix'}>{suffix}</em> : null;

  return (
    <span class={'form-description-value'}>
      {value}
      {unit}
    </span>
  );
}
