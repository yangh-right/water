import moment from 'moment';
import confirm from './confirm';

import { message, notification, Modal } from '@wpg/design-vue';
import Axios from 'axios';
import request, { requestPublic } from '@/utils/request';
import { api } from '@/config/server.config';


export function installMoment(Vue) {
  Vue.prototype.$moment = moment;
}

export function installMessage(Vue) {
  Vue.prototype.$confirm = confirm;
  Vue.prototype.$message = message;
  Vue.prototype.$notification = notification;
  Vue.prototype.$info = Modal.info;
  Vue.prototype.$success = Modal.success;
  Vue.prototype.$error = Modal.error;
  Vue.prototype.$warning = Modal.warning;
}


export function getConfigFile(url = './config.json') {
  return Axios.get(url).then(({ data }) => {
    if (process.env.NODE_ENV !== 'development') {
      request.defaults.baseURL = `${data.baseUrl}/purificationApi`;
      requestPublic.defaults.baseURL = data.baseUrl
      api.baseUrl = data.baseUrl;
      api.wsBaseUrl = data.wsUrl;
    }
  });
}
