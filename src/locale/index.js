/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-04-21 10:08:38
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-05-06 10:17:19
 * @Description: 
 */
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { localeCache } from '@wpg/framework-vue';
import FormDesign from '@wpg/form-design';
import VcDesign from '@wpg/vc-design';

import LOCALE_ZH_CN from './lang/zh-CN';
import LOCALE_ZH_TW from './lang/zh-TW';
import LOCALE_EN from './lang/en-US';

import storage from '@/utils/storage';
import { LANG } from '@/enum/appEnum';

const { locale: localeForm } = FormDesign;
const { locale: localeVc } = VcDesign;

Vue.use(VueI18n);

const fallbackLocale = 'zh_CN';

const lang = getLang();

const i18n = new VueI18n({
  locale: lang,
  fallbackLocale,
  messages: {
    zh_CN: LOCALE_ZH_CN.message,
    zh_TW: LOCALE_ZH_TW.message,
    en_US: LOCALE_EN.message
  }
});

localeVc.use(lang);
localeForm.use(lang);

export function getLang() {
  if (localeCache) {
    return localeCache.get();
  }

  let locale = storage.get(`locale`);
  if (locale) {
    return locale;
  }

  return fallbackLocale;
}

export function getLangEnum() {
  let lang = getLang();

  return LANG[lang];
}

export function setLang(lang) {
  i18n.locale = lang;

  localeVc.use(lang);
  localeForm.use(lang);
}

export default i18n;
