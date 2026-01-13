/*
 * @Author: chenzh
 * @Date: 2021-04-20 10:38:44
 * @LastEditTime: 2021-04-22 09:41:23
 * @LastEditors: chenzh
 * @Description:
 * @FilePath: /uni-app/components/form-parser-uni/eventLogic.js
 */
export function checkEventLogic(eventLogics, eventType) {
  const patches = [];
  const scripts = [];

  for (let i = 0; i < eventLogics.length; i++) {
    const logic = eventLogics[i];

    /* eslint no-case-declarations: 0 */
    switch (logic.trigger) {
      case 'script':
        logic.script && scripts.push(logic.script);
        break;
      case 'prop':
        const patch = {};
        // get event type: on-click => click
        if (logic.action !== eventType) continue;

        for (let j = 0; j < logic.effects.length; j++) {
          const effect = logic.effects[j];
          const props = {};

          effect.properties.forEach((_) => {
            props[_.key] = _.valueType === 'prop' ? `{{formData.${_.value}}}` : _.value;
          });
          patch[effect.key] = props;
        }

        Object.keys(patch).length && patches.push(patch);
        break;
      default:
        break;
    }
  }

  return { patches, scripts };
}
