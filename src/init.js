/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2024-06-06 16:13:22
 * @LastEditors: wangyr
 */
import store from '@/store';
import { getSysParamByCode } from '@/api';

export async function getAllSysDict() {
  store.dispatch('dict/GenerateDictory');
  store.dispatch('dict/GetStandardName');
}
export async function getSystemInfo() {
  return Promise.allSettled([
    getSysParamByCode('stagger_control'),
    getSysParamByCode('hideTank'),
    getSysParamByCode('hideNotice'),
    getSysParamByCode('pump_data_refresh_rate'),
    getSysParamByCode('mapLevel'),
    getSysParamByCode('map_strategy'),
    getSysParamByCode('mapBg'),
    getSysParamByCode('mapIconEnlarge')
  ]).then(
    ([
      staggerControl,
      hideTank,
      hideNotice,
      refreshInterval,
      mapLevel,
      mapType,
      mapBg,
      mapIconEnlarge
    ]) => {
      if (hideTank.status === 'fulfilled') {
        store.dispatch('configure/setHasStaggerControl', staggerControl.value?.resultData || '0');
      }
      if (hideTank.status === 'fulfilled') {
        store.dispatch('configure/setHideTank', hideTank.value?.resultData === '1' ? true : false);
      }
      if (hideNotice.status === 'fulfilled') {
        store.dispatch(
          'configure/setHasNotice',
          hideNotice.value?.resultData !== '1' ? true : false
        );
      }
      if (refreshInterval.status === 'fulfilled') {
        store.dispatch(
          'configure/setRefreshInterval',
          parseInt([refreshInterval.value?.resultData]) || 10000
        );
      }
      if (mapLevel.status === 'fulfilled') {
        store.dispatch('configure/setMapLevel', parseInt([mapLevel.value?.resultData]) || 18);
      }
      if (mapType.status === 'fulfilled') {
        store.dispatch('configure/setMapStrategy', mapType.value?.resultData || 'BD');
      }
      if (mapBg.status === 'fulfilled') {
        store.dispatch('configure/setMapBg', mapBg.value?.resultData !== '1' ? false : true);
      }
      if (mapIconEnlarge.status === 'fulfilled') {
        store.dispatch('map/set_map_icon_size', mapIconEnlarge.value?.resultData || '1');
      }
      store.dispatch('configure/init');
    }
  );
}
