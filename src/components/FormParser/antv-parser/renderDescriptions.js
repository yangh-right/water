import { renderElement } from './renderElement';

function renderDescriptionsItem(h, elementList) {
  const { formConfCopy } = this;
  const column = formConfCopy.column || 2;

  return elementList
    .filter(scheme => scheme.__config__.layout === 'rowFormItem' || scheme.__config__.showItem)
    .map(scheme => {
      const config = scheme.__config__;
      const readonly = scheme.__readonly__ || {};
      const col = readonly.span || (config.span * column) / 24 || column;

      let span = (col / column) * 24;
      span = span > 24 ? 24 : span;

      const labelCls = {
        'form-description-item-label': true,
        'form-description-item-colon':
          typeof formConfCopy.colon === 'undefined' || formConfCopy.colon
      };
      const colCls = {
        'form-description-item': true,
        [`form-description-item-${config.tag}`]: config.tag,
        'form-description-item-hidden': config.hideItemValue,
        'form-description-item-column': [
          'pump-tree',
          'device-tree',
          'DeviceTree',
          'fitting-tree',
          'tank-tree',
          'device-table',
          'component-table',
          'pump-table',
          'vc-file-upload'
        ].includes(config.tag)
      };
      let child = renderElement.call(this, h, scheme, formConfCopy.readonly);

      if (config.layout === 'colFormItem') {
        return (
          <w-col class={colCls} span={span}>
            {config.showLabel ? <div class={labelCls}>{config.label}</div> : null}
            <div class="form-description-value-wrapper">{child}</div>
          </w-col>
        );
      } else if (config.layout === 'rowFormItem') {
        return renderDescriptionsItem.call(this, h, config.children);
      }

      throw new Error(`没有与${config.layout}匹配的layout`);
    });
}

export default function renderDescriptions(h) {
  const { formConfCopy } = this;
  let classNames = {
    'form-descriptions': true
  };

  return (
    <w-row class={classNames}>{renderDescriptionsItem.call(this, h, formConfCopy.fields)}</w-row>
  );
}
