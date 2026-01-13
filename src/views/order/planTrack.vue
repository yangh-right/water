<!--
 * @Author: wangyr
 * @Date: 2025-03-05 09:40:16
 * @LastEditors: wangyr
 * @LastEditTime: 2025-03-05 09:40:48
 * @Description:
-->
<template>
  <div class="supply-w-full supply-h-full">
    <div class="map-container supply-flex-1">
      <w-spin v-if="spinning" size="large" class="spinStyle"></w-spin>
      <mapbox-map v-if="shouldRenderMap" v-bind="mapProps" @initialize="onInitialize" />
    </div>
    <div class="supply-text-right supply-pt-5">
      <w-button @click="commit" class="supply-ml-5" type="primary">确定</w-button>
      <w-button @click="$emit('action', false)" class="supply-ml-5">取消</w-button>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash.clonedeep';
import Vue from 'vue';
import { mapboxDraw } from './models/mapboxDraw';
import { accessToken } from '@wpg/framework-vue';
import { mapActions, mapState } from 'vuex';
import '@wpg/map-vue/mapbox/index.css';
import { MapboxMap } from '@wpg/map-vue/mapbox';
import mapboxgl from '@wpg/mapbox-gl';
import * as turf from '@turf/turf';
import { createDefer } from '@/utils/util.js';
export default {
  name: 'planTrack',
  components: {
    MapboxMap
  },
  inject: ['state'],
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      map: null,
      shouldRenderMap: false,
      spinning: true,
      mapInitialized: false,
      eventHandlers: {}, // 存储事件处理函数
      defaultMapProps: {
        baseURL:
          process.env.NODE_ENV === 'production'
            ? `${window.location.origin}/main`
            : 'http://10.10.102.39:8877/main',
        token: '',
        theme: this.state.theme !== 'dark' ? 'LIGHT_WATER_SCREEN' : 'SUPPLY_WATER_SCREEN',
        controls: {
          coordinate: false,
          scale: false,
          layers: false,
          zoom: false,
          restore: false
        },
        controlsPosition: 'bottomright',
        mapOptions: {
          minZoom: 3,
          maxZoom: 18,
          preferCanvas: true,
          attributionControl: false // 禁用默认的属性控制
        }
      },
      mapConfig: {
        zoom: 13,
        center: [120.18923537, 30.39730649],
        clusterOptions: {
          minPoints: 5,
          maxZoom: 14,
          radius: 50
        }
      },
      events: [],
      planLine: this.value ? cloneDeep(this.value) : [],
      token: '',
      oldPath: '',
      mapLoadedDefer: null,
      popupObj: {},
      isShowPopup: false,
      movingMarker: null,
      animationFrameId: null,
      startTime: null,
      duration: 10000,
      originPath: '',
      safetyPopup: null,
      isDraw: false,
      safetyHatClickHandler: null
    };
  },
  computed: {
    ...mapState('resize', ['wScale', 'hScale', 'scale']),
    mapProps() {
      return {
        ...this.defaultMapProps,
        token: this.token,
        baseURL: this.defaultMapProps.baseURL
      };
    }
  },
  watch: {
    token: {
      immediate: true,
      handler(newToken) {
        if (newToken) {
          this.initializeMap();
        }
      }
    }
  },
  mounted() {},
  created() {
    if (accessToken.get()) {
      this.token = `Bearer ${accessToken.get()}`;
    }
  },
  methods: {
    commit() {
      if (this.isDraw) {
        this.planLine = mapboxDraw.getAll()?.features?.[0]?.geometry?.coordinates || [];
      }
      this.$emit('action', true, this.planLine);
    },
    async initializeMap() {
      try {
        this.shouldRenderMap = true;
        this.spinning = true;
      } catch (error) {
        console.error('地图初始化失败:', error);
        this.spinning = false;
      }
    },
    async onInitialize(map) {
      try {
        this.map = map;
        // 等待地图样式加载完成
        await new Promise(resolve => {
          if (map.isStyleLoaded()) {
            resolve();
          } else {
            this.map.once('style.load', resolve);
          }
        });
        setTimeout(() => {
          this.initDraw();
        }, 100);

        // 设置初始视图
        // this.setMapView();

        // 添加站点标记

        this.spinning = false;
        this.mapInitialized = true;
      } catch (error) {
        console.error('Map initialization error:', error);
      }
    },
    initDraw() {
      this.map.addControl(mapboxDraw, 'top-right');
      if (this.planLine.length) {
        let line = turf.lineString(this.planLine);
        let bbox = turf.bbox(line);
        this.map.fitBounds(
          [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]]
          ],
          {
            padding: { top: 100, bottom: 100, left: 20, right: 20 }
          }
        );

        // this.map.flyTo({ center: center, zoom: this.mapConfig.zoom });
        const lineData = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: this.planLine
              },
              properties: {}
            }
          ]
        };
        mapboxDraw.set(lineData);
        setTimeout(() => {
          let id = mapboxDraw.getAll()?.features?.[0]?.id;
          this.oldPath = id;
          this.originPath = id;
          mapboxDraw.changeMode('simple_select', { featureIds: [id] });
        }, 0);
      }

      this.events = {
        'draw.create': e => {
          let features = e?.features;
          if (features) {
            this.oldPath = features?.[0]?.id;
          }
        },
        'draw.delete': e => {
          if (this.oldPath === this.originPath) {
            mapboxDraw.delete(this.oldPath);
          }
        },
        'draw.modechange': e => {
          if (e.mode === 'draw_line_string') {
            mapboxDraw.delete(this.oldPath);
          }
        },
        'draw.actionable': e => {
          this.isDraw = true;
          if (this.map.getLayer('person-line')) {
            this.map.removeLayer('person-line');
          }
        }
      };
      Object.keys(this.events).forEach(eventName => {
        this.map.on(eventName, this.events[eventName]);
      });
    },
    setMapView() {
      this.map.flyTo({ center: this.mapConfig.center, zoom: this.mapConfig.zoom });
    }
  },
  beforeDestroy() {
    Object.keys(this.events).forEach(eventName => {
      this.map.off(eventName);
    });
  }
};
</script>

<style lang="less" scoped>
.map-container {
  width: 100%;
  height: calc(100% - 68px);
  position: relative;

  .spinStyle {
    position: absolute;
    left: 55%;
    top: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}

:deep(.mapboxgl-popup-close-button) {
  display: none;
}

:deep(.mapboxgl-popup-tip) {
  display: none;
}

:deep(.mapboxgl-popup-content) {
  background: unset;
}

:deep(.mapboxgl-canvas-container) {
  filter: brightness(1.5);
}

.custom-marker {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
