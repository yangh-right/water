import store from '@/store';


export const permission = {
  inserted: function(el, binding, vnode) {
    const arg = binding.arg;
    // 按钮权限
    if (arg === 'button') {
      if (!store.state.setting.buttonCodes[binding.value]) {
        vnode.elm.parentElement.removeChild(vnode.elm);
      }
    }
    // 菜单权限
    if (arg === 'menu') {
      if (!store.getters['setting/menuList'].find(v => v.buttonCode === binding.value)) {
        vnode.elm.parentElement.removeChild(vnode.elm);
      }
    }
  }
}
