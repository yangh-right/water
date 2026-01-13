import { checkValueLogic } from './valueLogic';
import { checkEventLogic } from './eventLogic';
import { deepClone, convertValue } from './util';

function getDefaults(fields, listeners, defaultProps = {}) {
  const result = {};
  const props = Object.keys(defaultProps);

  const controlledKeys = {};

  listeners.forEach(logic => {
    logic.effects.forEach(effect => {
      controlledKeys[effect.key] = controlledKeys[effect.key] || [];
      effect.properties.forEach(prop => {
        if (controlledKeys[effect.key].indexOf(prop.key) === -1) {
          controlledKeys[effect.key].push(prop.key);
        }
      });
    });
  });

  function getDefaultResult(schema, data, props) {
    // eslint-disable-next-line guard-for-in
    props.forEach(prop => {
      const item = schema[prop];

      if (typeof item === 'object') {
        data[prop] = deepClone(item);
      } else {
        data[prop] = item || defaultProps[prop];
      }
    });
  }

  // eslint-disable-next-line guard-for-in
  fields.forEach(schema => {
    let key = schema.__vModel__;
    let controlledKey = controlledKeys[key] || [];
    result[key] = {};
    result[key]['__config__'] = {};

    controlledKey.forEach(k => {
      result[key][k] = schema[k];
    });
    getDefaultResult(schema['__config__'], result[key]['__config__'], props);
  });

  return result;
}

export default {
  created() {
    this.checkLogic();
  },

  methods: {
    checkLogic(name, value) {
      let listeners = (this.formConf.listeners || []).filter(o => o.key);

      if (listeners.length) {
        this.defaults = getDefaults(this.formConf.fields, listeners, {
          showItem: true,
          renderItem: true,
          defaultValue: undefined
        });

        this.runValueLogic(name, value);
        this.runEventLogic(name, value);
      }
    },

    runValueLogic(name, value, config) {
      let listeners = (this.formConfCopy.listeners || []).filter(o => o.key && o.type === 'value');
      let model = this[this.formConf.formModel];

      const valueTypes = {};
      Object.keys(model || {}).forEach(k => {
        valueTypes[k] = typeof model[k];
      });

      const controlledKeys = [];
      const hiddenKeys = [];
      // eslint-disable-next-line guard-for-in
      for (const key in model) {
        listeners
          .filter(logic => logic.key === key)
          .forEach(logic => {
            logic.effects.forEach(effect => {
              let properties = (effect.properties || []).filter(o => o.key === 'hidden');

              if (controlledKeys.indexOf(effect.key) === -1) {
                if (properties.length) {
                  hiddenKeys.push(effect.key);
                } else {
                  controlledKeys.push(effect.key);
                }
              }
            });
          });
      }

      let { patches, scripts } = checkValueLogic(listeners, model, valueTypes);

      this.applyHidden(patches, hiddenKeys);
      this.applyPatches(patches, controlledKeys);

      this.runScripts(scripts);
    },

    runEventLogic(name, value, config) {
      let listeners = (this.formConfCopy.listeners || []).filter(
        o => o.key === name && o.type === 'event'
      );
      const controlledKeys = [];
      const hiddenKeys = [];
      // eslint-disable-next-line guard-for-in
      listeners.forEach(logic => {
        logic.effects.forEach(effect => {
          let properties = (effect.properties || []).filter(o => o.key === 'hidden');

          if (controlledKeys.indexOf(effect.key) === -1) {
            if (properties.length) {
              hiddenKeys.push(effect.key);
            } else {
              controlledKeys.push(effect.key);
            }
          }
        });
      });

      let { patches, scripts } = checkEventLogic(listeners, 'change');

      this.applyHidden(patches, hiddenKeys);
      this.applyPatches(patches, controlledKeys);

      this.runScripts(scripts);
    },

    applyHidden(patches, hiddenKeys) {
      const propsMerged = {};

      patches.forEach(patch => {
        // eslint-disable-next-line guard-for-in
        for (const key in patch) {
          propsMerged[key] = propsMerged[key] || {};
          propsMerged[key] = patch[key];
        }
      });

      hiddenKeys
        .filter(o => o)
        .forEach(key => {
          let prop = this.formConf.readonly ? 'showItem' : 'renderItem';
          let defaultValue = this.defaults[key]['__config__'][prop];
          let val = propsMerged[key] ? !propsMerged[key]['hidden'] : defaultValue;

          if (val) {
            this.show(key);
          } else {
            this.hide(key);
          }
        });
    },

    applyPatches(patches, controlledKeys) {
      const propsMerged = {};

      patches.forEach(patch => {
        // eslint-disable-next-line guard-for-in
        for (const key in patch) {
          let target = patch[key];
          if (target.hasOwnProperty('hidden')) {
            delete target['hidden'];
          }

          propsMerged[key] = propsMerged[key] || {};
          Object.assign(propsMerged[key], target);
        }
      });

      const controlledDefaults = {};
      controlledKeys.forEach(key => {
        let target = deepClone(this.defaults[key]);

        if (target.__config__ && target.__config__.defaultValue) {
          target['value'] = target.__config__.defaultValue;
        }
        if (!(key in this.defaults)) return;
        delete target['__config__'];
        controlledDefaults[key] = target;
      });
      const result = { ...controlledDefaults, ...propsMerged };

      // eslint-disable-next-line guard-for-in
      for (const key in result) {
        let keys = Object.keys(result[key]).filter(o => o);
        keys.forEach(prop => {
          let value = convertValue(result[key][prop], this.formModel(), {});
          this.setProp(key, prop, value);
        });
      }
    },

    runScripts(scripts) {
      scripts.forEach(script => {
        this.execScript(script);
      });
    },

    execScript(script) {
      let ctx = this;
      let formData = this.formModel();

      try {
        // eslint-disable-next-line no-new-func
        const func = new Function('ctx', 'formData', script);
        return func(ctx, formData);
      } catch (error) {
        console.log(error);
      }
    }
  }
};
