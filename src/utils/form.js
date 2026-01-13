
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

function initFormTag(cur) {
  const config = cur.__config__;

  config._tag = config.tag;

  if (config.componentName) {
    config._tag = config.componentName;
  }

  if (config.tag === 'el-input' && cur.type === 'textarea') {
    config._tag = 'a-textarea';
  }

  if (config.tag === 'el-input' && cur['show-password']) {
    config._tag = 'a-input-password';
  }

  if (config.tag === 'el-date-picker' && dateModes.includes(cur.type)) {
    config._tag = `a-${cur.type}-picker`;
  }

  if (config.tag === 'el-time-picker' && cur['is-range']) {
    config._tag = 'a-date-picker';
  }

  if (config.tag === 'el-date-picker' && dateRangeModes.includes(cur.type)) {
    config._tag = 'a-range-picker';
  }

  config._tag = tagMappers[config._tag] ? tagMappers[config._tag] : config._tag;
}

export function changeTag(components) {
  components.forEach(item => {
    initFormTag(item);
  });

  return components;
}
