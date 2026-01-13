/* eslint-disable no-invalid-this */
/* eslint-disable padded-blocks */
import { deepClone, ajax, funcfySchema } from '../utils/index';

function setValue(scheme, event, extra) {
  const config = scheme.__config__;
  this.$set(config, 'defaultValue', event);
  this.$set(this[this.formConf.formModel], scheme.__vModel__, event);

  checkLinkages.call(this, scheme.__vModel__, event, this[this.formConf.formModel], extra);
}

// eslint-disable-next-line max-params
function checkLinkages(name, value, formData, extra) {
  this.checkLogic(name, value);
  this.$emit('valueChange', name, value, formData, extra);
}

export function renderTable(h, scheme) {
  let cloneScheme = deepClone(scheme);
  let config = cloneScheme.__config__;
  let data = cloneScheme.data;
  let { children } = config;

  let columns = children.map(item => {
    return {
      title: item.label,
      dataIndex: item.prop,
      key: item.prop
    };
  });

  cloneScheme.dataSource = data;
  cloneScheme.columns = columns;
  cloneScheme.rowKey = config.rowKey;
  cloneScheme.data = config.url
    ? parameter => {
        let params = { current: parameter.pageNo, size: parameter.pageSize };

        return ajax(
          config,
          {
            ...this.params,
            params
          },
          this.$axios
        );
      }
    : null;
  cloneScheme.dataKeys = {
    current: config.currentKey,
    total: config.totalKey,
    records: config.dataKey
  };
  cloneScheme.canResize = false;

  return <render conf={cloneScheme} />;
}

export function buildListeners(scheme) {
  const methods = scheme.__methods__ || {};
  const listeners = {};

  // 给__methods__中的方法绑定this和event
  Object.keys(methods).forEach(key => {
    listeners[key] = event => methods[key].call(this, event);
  });

  // 响应 render.js 中的 vModel $emit('input', val)
  let originInput = listeners.input;
  listeners.input = (event, extra) => {
    originInput && originInput.call(this, event, extra);
    setValue.call(this, scheme, event, extra);
  };

  return listeners;
}

export function renderElement(h, scheme, description = false) {
  const { formConfCopy } = this;
  const listeners = buildListeners.call(this, scheme);

  let child = null;
  if (scheme.__config__.tag === 'vc-table') {
    child = renderTable.call(this, h, scheme);
  } else {
    child = (
      <render
        conf={scheme}
        description={description}
        disabled={formConfCopy.disabled || scheme.disabled}
        {...{ on: listeners }}
      />
    );
  }

  return child;
}
