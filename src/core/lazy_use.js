/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-04-02 18:21:28
 * @LastEditTime: 2024-04-26 14:04:57
 * @LastEditors: wangyr
 */
import Vue from 'vue';
import '@wpg/map-vue/dist/index.css';
import PageLoading from '@/components/PageLoading';
import BaiduMap from '@/components/BaiduMap';
import ESign from '@/components/ESign';
import STable from '@/components/Table';
import CustomTooltip from '@/components/CustomTooltip';
import VcSteps from '@/components/Steps/index';
import TableSearch from '@/components/TableSearch';
import VcInputAddress from '@/components/InputAddress';
import TicketTree from '@/components/TicketTree';
import { VueAxios } from '@/utils/request';
import './directives/action';
import ClickOutside from 'vue-click-outside';
import { permission } from './directives/permission';
import { scrollLoad } from './directives/scrollLoad';
import { inputFilter } from './directives/inputFilter';
import ReturnControl from '@/components/returnControl';
import loading from './loading';
import { installMessage, installMoment } from './bootstrap';
import { installResize } from '@/utils/resize';
import VueCompositionAPI from '@vue/composition-api';
import SimpleModule from '@/components/SimpleModule';
import { VUE_APP_AK } from '@/constants';
import './echarts';
import './formDesign';
import './antd';
import VcSpace from '@/components/vcSpace/index.js';
import draggable from 'vuedraggable';
import echartsLightTheme from '@/components/echarts/themes/wpg.light.json';
import echartsDarkTheme from '@/components/echarts/themes/wpg.dark.json';
import VueTypedJs from 'vue-typed-js'
import * as echarts from 'echarts';

echarts.registerTheme('wpg.light', echartsLightTheme);
echarts.registerTheme('wpg.dark', echartsDarkTheme);
// 兼容处理
echarts.registerTheme('lightTheme', echartsLightTheme);
echarts.registerTheme('darkTheme', echartsDarkTheme);
Vue.use(VueTypedJs)

// 用于自定义表单address-input
Vue.use(BaiduMap, {
  ak: VUE_APP_AK
});
Vue.use(STable);
Vue.use(CustomTooltip);
Vue.use(SimpleModule);
Vue.use(TableSearch);
Vue.use(VcSteps); // 未知
Vue.use(TicketTree); // 表单生成器的依赖
Vue.use(ESign); // TicketTree
Vue.use(VcInputAddress); // 未知
Vue.use(VueAxios); // formParser
Vue.use(ReturnControl);
Vue.use(PageLoading);
Vue.use(installMoment);
Vue.use(installMessage);
Vue.use(installResize);
Vue.directive('permission', permission);
Vue.directive('inputFilter', inputFilter);
Vue.directive('scrollLoad', scrollLoad);
Vue.use(loading);
Vue.use(VueCompositionAPI);
Vue.component('VSpace', VcSpace);
Vue.component('Draggable', draggable);
Vue.directive('clickOutside', ClickOutside);
// import WaterComponents from '@wpg/waterwork-modules';

// Vue.use(WaterComponents);

// process.env.NODE_ENV !== 'production' && console.warn('[antd-pro] NOTICE: Antd use lazy-load.');

Vue.prototype.$echarts = echarts;
