import { Modal } from '@wpg/design-vue';
import modalConfirm from '@wpg/design-vue/es/modal/confirm';

const iconColorMap = {
  primary: '#0ACC9D',
  danger: '#F64357',
  warning: '#FFBF00'
};

// confirm图标全局替换
function confirm(props) {
  let config = {
    ...props,
    okText: props.okText || '确定',
    cancelText: props.cancelText || '取消',
    type: 'confirm',
    closable: true,
    icon: h =>
      h('i', {
        style: {
          display: 'block',
          margin: '15px',
          color: iconColorMap.warning
        },
        class: ['icon-ic_report_problem', 'supply-text-5xl']
      }),
    okCancel: true
  };

  return modalConfirm(config);
}

// 路由切换Modal关闭
Modal.watch.$route = function() {
  if (this.visible) {
    this.handleCancel();
  }
};

export default confirm;
