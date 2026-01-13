import BaiduMap from './map/Map.vue';
import BmView from './map/MapView.vue';

import BmControl from './controls/Control.vue';
import BmMarker from './overlays/Marker.vue';
import BmLabel from './overlays/Label.vue';
import BmAutoComplete from './others/AutoComplete.vue';

export default {
  install(Vue, options) {
    const { ak } = options;
    Vue.prototype._BMap = () => ({ ak });

    Vue.component('BaiduMap', BaiduMap);
    Vue.component('BmView', BmView);

    Vue.component('BmControl', BmControl);

    Vue.component('BmMarker', BmMarker);
    Vue.component('BmLabel', BmLabel);

    Vue.component('BmAutoComplete', BmAutoComplete);
  }
};

export { BaiduMap, BmView };
