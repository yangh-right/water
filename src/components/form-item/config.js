const types = {
  SEARCH: 'search',
  INFO: 'info',
  SUBMIT: 'submit'
};

const REQUIRED_RULE = {
  required: true,
  message: '该字段不能为空!',
  trigger: 'change'
};

const defaultReplaceFields = {
  children: 'children',
  title: 'title',
  key: 'key',
  value: 'value'
};

export { types, defaultReplaceFields, REQUIRED_RULE };

export function isFunction(fn) {
  return typeof fn === 'function' ? true : false;
}
