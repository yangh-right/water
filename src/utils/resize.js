export function installResize(Vue) {

  Vue.directive('resize', {
    /**
     * 指令的钩子函数绑定元素
     * @param el为绑定的元素
     * @param binding为绑定给指令的对象
     */
    bind(el, binding) {
      let width = '', height = '';
      function isReize() {
        const style = document.defaultView.getComputedStyle(el);
        if (width !== style.width || height !== style.height) {
          binding.value();  // 关键
        }
        width = style.width;
        height = style.height;
      }
      el.__vueSetInterval__ = setInterval(isReize, 300);
    },
    /**
     * 指令与元素解绑回调函数
     * @param el为绑定的元素
     */
    unbind(el) {
      clearInterval(el.__vueSetInterval__);
    }
  });
}
