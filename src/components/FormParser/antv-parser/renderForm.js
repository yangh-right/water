import { renderElement } from './renderElement';

const layoutMappers = {
  top: 'vertical',
  left: 'horizontal',
  right: 'horizontal'
};

const layouts = {
  colFormItem(h, scheme, colConf) {
    const config = scheme.__config__;
    let labelWidth = config.labelWidth || colConf.labelWidth;

    labelWidth = labelWidth ? `${labelWidth}px` : null;
    if (config.showLabel === false) labelWidth = '0';

    let labelCol = {
      style: { minWidth: labelWidth }
    };
    let colStyle = {
      display: typeof config.hiddenItem === 'undefined' || config.hiddenItem ? 'block' : 'none'
    };
    let child = renderElement.call(this, h, scheme);

    return (
      <w-col key={scheme.__vModel__} span={config.span} style={colStyle}>
        <w-form-model-item
          label-col={labelCol}
          label={config.showLabel ? config.label : ''}
          prop={scheme.__vModel__}
        >
          {child}
        </w-form-model-item>
      </w-col>
    );
  },
  rowFormItem(h, scheme) {
    let child = renderChildren.apply(this, arguments);

    if (scheme.type === 'flex') {
      child = (
        <w-row type={scheme.type} justify={scheme.justify} align={scheme.align}>
          {child}
        </w-row>
      );
    } else {
      child = <w-row gutter={scheme.gutter}>{child}</w-row>;
    }

    return (
      <w-col key={scheme.__vModel__} span={24}>
        {child}
      </w-col>
    );
  }
};

function renderChildren(h, scheme) {
  const config = scheme.__config__;
  if (!Array.isArray(config.children)) return null;
  return renderFormItem.call(this, h, config.children);
}

function formBtns(h) {
  const { formConfCopy } = this;
  const position = layoutMappers[formConfCopy.labelPosition];
  const labelWidth = formConfCopy.labelWidth ? `${formConfCopy.labelWidth}px` : null;
  const formBtnsStyle = {
    'padding-left': position === 'horizontal' ? labelWidth : null
  };

  return (
    <w-col class="ant-form--submit-btns" style={formBtnsStyle} span={24}>
      <w-form-model-item>
        <w-button type="primary" onClick={this.submitForm}>
          提交
        </w-button>
        <w-button onClick={this.resetForm}>重置</w-button>
      </w-form-model-item>
    </w-col>
  );
}

export function renderFormItem(h, elementList) {
  const { formConfCopy } = this;
  let colConf = {
    labelWidth: formConfCopy.labelWidth
  };
  let rowConf = {};
  // eslint-disable-next-line no-param-reassign
  if (!elementList) elementList = [];
  return elementList
    .filter(scheme => scheme.__config__.layout === 'rowFormItem' || scheme.__config__.renderItem)
    .map(scheme => {
      const config = scheme.__config__;
      const layout = layouts[config.layout];

      if (layout) {
        return layout.call(this, h, scheme, config.layout === 'rowFormItem' ? rowConf : colConf);
      }
      throw new Error(`没有与${config.layout}匹配的layout`);
    });
}

export default function renderForm(h) {
  const { formConfCopy } = this;
  let classNames = {
    'ant-form-parser': true,
    [`ant-form--label-${formConfCopy.labelPosition}`]: formConfCopy.labelPosition
  };

  return (
    <w-form-model
      class={classNames}
      layout={layoutMappers[formConfCopy.labelPosition]}
      disabled={formConfCopy.disabled}
      ref={formConfCopy.formRef}
      // model不能直接赋值 https://github.com/vuejs/jsx/issues/49#issuecomment-472013664
      props={{ model: this[formConfCopy.formModel] }}
      rules={this[formConfCopy.formRules]}
    >
      <w-row gutter={formConfCopy.gutter}>
        {renderFormItem.call(this, h, formConfCopy.fields)}
        {formConfCopy.formBtns && formBtns.call(this, h, formConfCopy)}
      </w-row>
    </w-form-model>
  );
}
