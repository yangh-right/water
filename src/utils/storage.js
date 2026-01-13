import { APP_PREFIX } from '@/constants';
import Vue from 'vue';
import Storage from 'vue-ls';

const storageOptions = {
  namespace: `${APP_PREFIX}__`, // key prefix: ;
  name: 'ls', // name variable Vue.[ls] or this.[$ls],
  storage: 'local' // storage name session, local, memory
}

Vue.use(Storage, storageOptions);
const storage = Vue.ls;

export default storage;
