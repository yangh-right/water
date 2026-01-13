import { Spin } from '@wpg/design-vue';

export const PageLoading = {
  name: 'PageLoading',
  props: {
    tip: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'large'
    }
  },
  render() {
    const style = {
      textAlign: 'center',
      background: 'rgba(255,255,255,.4)',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1100
    };
    const spinStyle = {
      position: 'absolute',
      left: '50%',
      top: '40%',
      transform: 'translate(-50%, -50%)'
    };
    return (
      <div style={style}>
        <Spin size={this.size} style={spinStyle} tip={this.tip} />
      </div>
    );
  }
};

const version = '0.0.1';
const loading = {};
loading.newInstance = (Vue, options) => {
  let domId = options.domId ? '#'+options.domId : 'body';
  let target = options.domId ? document.querySelector(domId) : document.body;
  let loadingElement = document.querySelector(`${domId}>div[type=loading]`);
  if (!loadingElement) {
    loadingElement = document.createElement('div');
    loadingElement.setAttribute('type', 'loading');
    loadingElement.setAttribute('class', 'wpg-loading-wrapper');
    if(target) target.appendChild(loadingElement);
  }
  const cdProps = {size: 'large', tip: '', ...options};
  let instance = new Vue({
    data() {
      return {
        ...cdProps
      };
    },
    render() {
      const { tip, size} = this;
      const props = {};
      this.tip && (props.tip = tip);
      this.size && (props.size = size);
      if (this.visible) {
        return <PageLoading {...{ props }} />;
      }
      return null;
    }
  }).$mount(loadingElement);

  function update(config) {
    const {size, tip, visible } = { ...cdProps, ...config };
    instance.$set(instance, 'visible', visible);
    if (tip) {
      instance.$set(instance, 'tip', tip);
    }
    if (size) {
      instance.$set(instance, 'size', size);
    }
  }

  return {
    instance,
    update
  }
};

const api = {
  Vue:'',
  instances:{},
  show: function(options = {}) {
    let domId = options.domId ? options.domId : 'body';
    if(this.instances[domId]){
      if(this.instances[domId].visible) return false;
      this.instances[domId].update({...options,  visible:true});
    }else{
      this.instances[domId] = loading.newInstance(this.Vue, {domId:'', ...options, visible: true })
    }
  },
  hide: function(options = {}) {
    let domId = options.domId ? options.domId : 'body'
    this.instances[domId].update({...options,  visible:false});
  }
};

const install = function(Vue, options) {
  if (Vue.prototype.$loadingDom) {
    return;
  }
  api.Vue = Vue;
  Vue.prototype.$loadingDom = api;
};
export default {
  version,
  install
};
