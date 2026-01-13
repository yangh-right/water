/*
 * @Author: limz
 * @Date: 2022-08-02 11:00:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-01-17 10:37:32
 * @Description:
 */
export const flatZoneTree = function(tree) {
  return tree.reduce((result, node) => {
    const { name, id, children, data } = node;
    const zone = { name, id, data };
    if (Array.isArray(children)) {
      result = [...result, zone, ...flatZoneTree(children)];
    } else {
      result = [...result, zone];
    }
    return result;
  }, []);
};

// 组件封装 分区样式
import Vue from 'vue';
import SiteMarker from './siteMarker.vue';
import SitePopup from './sitePopup.vue';

import ClusterIcon from './clusterIcon.vue';
import EndTrailMarker from './EndTrailMarker.vue';
import StartTrailMarker from './StartTrailMarker.vue';
import PeoplePopup from '../../home/models/PeoplePopup';
import TrailPopup from './TrailPopup.vue';
export const GB = {
         siteMarkerConstructor: Vue.extend(SiteMarker),
         sitePopupConstructor: Vue.extend(SitePopup),
         ClusterIconConstructor: Vue.extend(ClusterIcon),
         PeoplePopupConstructor: Vue.extend(PeoplePopup),
         EndTrailMarkerConstructor: Vue.extend(EndTrailMarker),
         StartTrailMarkerConstructor: Vue.extend(StartTrailMarker),
         TrailPopupConstructor: Vue.extend(TrailPopup),
         // 分区样式
         zoneStyle: {
           color: '#333',
           weight: 1,
           opacity: 0.33,
           fillColor: 'transparent',
           fillOpacity: 0.2,
           dashArray: [5, 5]
         },
         // 分区悬浮样式
         zoneHoverStyle: {
           weight: 2,
           fillOpacity: 0.4
         },
         // 二级分区样式
         zoneStyle2: {
           color: '#646666',
           weight: 2,
           opacity: 1,
           fillColor: 'transparent',
           fillOpacity: 0,
           dashArray: [5, 5]
           // interactive: false
         },
         // 边界样式
         boundaryStyle: {
           className: 'zone-boundary',
           color: '#646666',
           weight: 2,
           opacity: 1,
           fillColor: 'transparent',
           fillOpacity: 0,
           interactive: false
         },
         // 遮罩样式
         maskStyle: {
           color: 'transparent',
           weight: 2,
           opacity: 1,
           fillColor: '#ffffff',
           fillOpacity: 0.5
         },
         // 二级分区缩放等级临界值
         zoneZoomLimit: 13
       };

/**
 * 添加 popup
 * @param {*} latLng
 * @param {*} popupConfig
 * @param {*} PopupCtor
 * @param {*} popupProps
 * @returns
 */
export function AddPopup(latLng, popupConfig, PopupCtor, popupProps, methods, that) {
  const popup = L.popup({
    autoPan: false,
    className: 'dpPopup',
    offset: [0, -45],
    maxWidth: 500,
    closeButton: false,
    autoClose: false,
    closeOnEscapeKey: false,
    closeOnClick: false,
    ...popupConfig
  });
  const instance = new PopupCtor({
    parent: that,
    data() {
      return {
        ...popupProps
      };
    },
    methods: {
      showAlarmModal(item) {
        const { pumpHouseId, pumpHouseName } = this.site;
        methods(pumpHouseId, pumpHouseName, item);
      }
    }
  });
  const el = instance.$mount().$el;
  popup.vm = instance;
  popup.setLatLng(latLng);
  popup.setContent(el);
  return popup;
}

/**
 * 处理热力分析数据
 * @param {*} data
 * @returns
 */
export function DealHeatData(data) {
  const { _list, heatType, colors, threshold } = data;
  // threshold 分成 6 个值对应图例
  let a1 = (threshold[1] - threshold[0]) / 5;
  let a2 = (threshold[2] - threshold[1]) / 5;
  const values = [
    threshold[0],
    threshold[0] + 2 * a1,
    threshold[0] + 4 * a1,
    threshold[1] + a2,
    threshold[1] + 3 * a2,
    threshold[2]
  ].map(v => v.toFixed(2));

  let wList = ['0.2', '0.4', '0.6', '0.8', '1'];
  let vList = [0, 10, 20, 50, 80, 100];
  if (heatType === 'alarmAnalysis') {
    wList.reverse();
    vList.reverse();
  }
  let gradient = {};
  let list =
    _list.map(r => {
      let val = heatType === 'pressure' ? r.value : r.alarmCount;
      let weight = vList[0];
      if (val > values[4]) {
        weight = vList[1];
        gradient[wList[0]] = colors[4];
      } else if (val > values[3]) {
        weight = vList[2];
        gradient[wList[1]] = colors[3];
      } else if (val > values[2]) {
        weight = vList[3];
        gradient[wList[2]] = colors[2];
      } else if (val > values[1]) {
        weight = vList[4];
        gradient[wList[3]] = colors[1];
      } else {
        weight = vList[5];
        gradient[wList[4]] = colors[0];
      }
      return {
        ...r,
        weight
      };
    }) || [];
  return { list, gradient, values };
}

/**
 * 获取当前地图可视区域 marker
 */
import turfContains from '@turf/boolean-contains';
export function GetMarkersInView(markerLayerGroup, map) {
  //获取地图视图的经纬度边界
  const {
    _southWest: { lat: wLat, lng: wLng },
    _northEast: { lat: nLat, lng: nLng }
  } = map.getBounds();
  let latlngs = [
    [wLat, wLng],
    [nLat, wLng],
    [nLat, nLng],
    [wLat, nLng]
  ];
  const polygon = L.polygon(latlngs); // 视图边界范围
  // 视图内所有 marker
  let markers = markerLayerGroup
    .getLayers()
    .filter(marker => turfContains(polygon.toGeoJSON(), marker.toGeoJSON()));
  return markers || [];
}
