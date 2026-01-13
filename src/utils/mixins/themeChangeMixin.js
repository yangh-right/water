/*
 * @Author: wangyr
 * @Date: 2023-02-14 09:31:21
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-02-14 09:49:00
 * @Description:
 */
import { isFunction } from 'lodash-es';
import { getBaseTheme } from '@/utils/util.js';

export default {
  inject: ['state'],
  computed: {
    baseTheme() {
      return getBaseTheme(this.state.theme);
    },
  },
  watch: {
    'state.theme'(theme) {
      if (isFunction(this.themeChange)) {
        this.themeChange(theme);
      }
    },
  },
};
