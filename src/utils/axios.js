/*
 * @Description:
 * @Author: limz
 * @Date: 2021-06-10 13:33:40
 * @LastEditTime: 2021-09-08 15:44:59
 * @LastEditors: limz
 */
const VueAxios = {
  vm: {},
  // eslint-disable-next-line no-unused-vars
  install(Vue, instance) {
    if (this.installed) {
      return;
    }
    this.installed = true;

    if (!instance) {
      // eslint-disable-next-line no-console
      console.error('You have to install axios');
      return;
    }

    Vue.axios = instance;
    window.$axios = instance;

    Object.defineProperties(Vue.prototype, {
      $axios: {
        get: function get() {
          return instance;
        }
      },
      $http: {
        get: function get() {
          return instance;
        }
      }
    });
  }
};

export { VueAxios };
