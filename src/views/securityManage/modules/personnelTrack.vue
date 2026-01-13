<!--
 * @Author: wangyr
 * @Date: 2025-03-05 09:40:16
 * @LastEditors: wangyr
 * @LastEditTime: 2025-03-05 09:40:48
 * @Description:
-->
<template>
  <div class="map-container">
    <w-spin v-if="spinning" size="large" class="spinStyle"></w-spin>
    <mapbox-map v-if="shouldRenderMap" v-bind="mapProps" @initialize="onInitialize" />
  </div>
</template>

<script>
import Vue from 'vue';
import { accessToken } from '@wpg/framework-vue';
import { mapActions, mapState } from 'vuex';
import '@wpg/map-vue/mapbox/index.css';
import { MapboxMap } from '@wpg/map-vue/mapbox';
import mapboxgl from '@wpg/mapbox-gl';
import { GB } from './tools';
import { createDefer } from '@/utils/util.js';
export default {
  name: 'personnelTrack',
  components: {
    MapboxMap
  },
  props: {
    stationData: {
      type: Array,
      default: () => []
    },
    safetyInfo: {
      type: Object,
      default: () => {}
    },
    personLine: {
      type: Array,
      default: () => []
    }
  },
  inject: ['state'],
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
          maxZoom: 16,
          radius: 50
        }
      },
      token: '',
      mapLoadedDefer: null,
      popupObj: {},
      isShowPopup: false,
      movingMarker: null,
      animationFrameId: null,
      startTime: null,
      duration: 60000,
      safetyPopup: null,
      safetyHatClickHandler: null,
      pathLength: 0, // 添加总路径长度
      segmentLengths: [] // 添加每个线段的长度
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
    },
    'state.theme': {
      handler(newTheme) {
        if (this.map) {
          this.defaultMapProps.theme =
            newTheme !== 'dark' ? 'LIGHT_WATER_SCREEN' : 'SUPPLY_WATER_SCREEN';
          this.cleanup();
          setTimeout(() => {
            this.initializeMap();
          }, 800);
        }
      }
    },
    stationData: {
      deep: true,
      handler(newStationData) {
        if (newStationData.length && this.map) {
          this.addStationMarkers();
        }
      }
    },
    safetyInfo: {
      deep: true,
      handler(newSafetyInfo) {
        if (this.map && Object.keys(newSafetyInfo).length) {
          this.addSafetyMarkers();
        }
      }
    },
    personLine: {
      deep: true,
      handler(newPersonLine) {
        if (newPersonLine.length && this.map) {
          this.addPersonLine();
        }
      }
    }
  },
  mounted() {
    console.log('mounted', this.state);
  },
  methods: {
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
        this.mapLoadedDefer.resolve();

        // 等待地图样式加载完成
        await new Promise(resolve => {
          if (map.isStyleLoaded()) {
            resolve();
          } else {
            map.once('style.load', resolve);
          }
        });

        // 加载自定义标记
        await this.loadCustomMarkers();

        // 初始化地图视图和事件
        this.setupMapEvents();

        this.spinning = false;
        this.mapInitialized = true;
      } catch (error) {
        console.error('Map initialization error:', error);
      }
    },
    async loadCustomMarkers() {
      const staticPath = process.env.NODE_ENV === 'production' ? '/purificationBigPage' : '';
      const markerConfigs = [
        ['normal-marker', 'person_icon.png'],
        ['active-marker', 'person_icon_select.png'],
        ['trajectory_start', 'ic_trajectory_start.png'],
        ['trajectory_end', 'ic_trajectory_end.png'],
        ['ic_person', 'ic_person.png'],
        ['safety_hat', 'safety_hat.png']
      ];

      const loadImage = ([name, file]) => {
        if (this.map.hasImage(name)) return Promise.resolve();

        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            this.map.addImage(name, img);
            resolve();
          };
          img.onerror = reject;
          img.src = `${staticPath}/static/oneMap/${file}`;
        });
      };

      await Promise.all(markerConfigs.map(loadImage));
    },
    addSafetyMarkers() {
      let { y_point, x_point } = this.safetyInfo.location_info;

      // 移除已有的安全帽图层和数据源
      if (this.map.getLayer('safety-hat-layer')) {
        this.map.removeLayer('safety-hat-layer');
      }
      if (this.map.getSource('safety-hat-source')) {
        this.map.removeSource('safety-hat-source');
      }

      // 添加安全帽数据源
      this.map.addSource('safety-hat-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [y_point, x_point]
          },
          properties: {
            ...this.safetyInfo
          }
        }
      });

      // 添加安全帽图层
      this.map.addLayer({
        id: 'safety-hat-layer',
        type: 'symbol',
        source: 'safety-hat-source',
        layout: {
          'icon-image': 'safety_hat',
          'icon-size': 1,
          'icon-allow-overlap': true
        }
      });

      // 移除之前的点击事件监听器
      if (this.safetyHatClickHandler) {
        this.map.off('click', 'safety-hat-layer', this.safetyHatClickHandler);
      }

      // 添加点击事件处理
      this.safetyHatClickHandler = e => {
        if (this.safetyPopup) {
          this.safetyPopup.remove();
          this.safetyPopup = null;
        } else {
          this.safetyPopup = this.addPopup([y_point, x_point], {}, GB.safetyPopupConstructor, {
            site: this.safetyInfo
          });
        }
      };

      // 添加点击事件监听
      this.map.on('click', 'safety-hat-layer', this.safetyHatClickHandler);

      // 添加鼠标样式变化
      this.map.on('mouseenter', 'safety-hat-layer', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      this.map.on('mouseleave', 'safety-hat-layer', () => {
        this.map.getCanvas().style.cursor = '';
      });
    },
    addPersonLine() {
      // 移除已有的轨迹图层
      ['person-line', 'start-point', 'end-point'].forEach(layerId => {
        if (this.map.getLayer(layerId)) {
          this.map.removeLayer(layerId);
        }
      });

      if (this.map.getSource('person-line')) {
        this.map.removeSource('person-line');
      }

      // 计算路径总长度和每个线段的长度
      this.calculatePathLengths();

      // 创建轨迹线的GeoJSON数据
      const lineData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: this.personLine.map(point => [point.x, point.y])
            },
            properties: {}
          }
        ]
      };

      // 创建起点和终点的GeoJSON数据
      const pointsData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [this.personLine[0].x, this.personLine[0].y]
            },
            properties: {
              type: 'start'
            }
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [
                this.personLine[this.personLine.length - 1].x,
                this.personLine[this.personLine.length - 1].y
              ]
            },
            properties: {
              type: 'end'
            }
          }
        ]
      };

      // 添加轨迹线数据源
      this.map.addSource('person-line', {
        type: 'geojson',
        data: lineData
      });

      // 添加轨迹线图层
      this.map.addLayer({
        id: 'person-line',
        type: 'line',
        source: 'person-line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3388ff',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });

      // 添加起点终点数据源
      this.map.addSource('track-points', {
        type: 'geojson',
        data: pointsData
      });

      // 添加起点图层
      this.map.addLayer({
        id: 'start-point',
        type: 'symbol',
        source: 'track-points',
        filter: ['==', ['get', 'type'], 'start'],
        layout: {
          'icon-image': 'trajectory_start',
          'icon-size': 1,
          'icon-allow-overlap': true
        }
      });

      // 添加终点图层
      this.map.addLayer({
        id: 'end-point',
        type: 'symbol',
        source: 'track-points',
        filter: ['==', ['get', 'type'], 'end'],
        layout: {
          'icon-image': 'trajectory_end',
          'icon-size': 1,
          'icon-allow-overlap': true
        }
      });

      // 在添加完轨迹线和起终点后，添加移动的标记点
      this.addMovingMarker();
    },
    addStationMarkers() {
      // 移除已有的图层
      ['clusters', 'cluster-count', 'person-point'].forEach(layerId => {
        if (this.map.getLayer(layerId)) {
          this.map.removeLayer(layerId);
        }
      });

      if (this.map.getSource('stations')) {
        this.map.removeSource('stations');
      }

      // 创建GeoJSON数据
      const geojsonData = {
        type: 'FeatureCollection',
        features: this.stationData.map(site => {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [site.x, site.y]
            },
            properties: {
              id: site.cardId,
              name: site.entityName,
              status: 'normal'
            }
          };
        })
      };

      // 添加聚合数据源
      this.map.addSource('stations', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMinPoints: 5,
        clusterMaxZoom: 14, // 最大聚合级别
        clusterRadius: 50 // 聚合半径
      });

      // 添加聚合圆圈图层
      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'stations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#3388ff',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, // 默认半径
            10, // 数量阈值
            30, // 10个以上的半径
            20, // 数量阈值
            40 // 20个以上的半径
          ],
          'circle-opacity': 0.6,
          'circle-stroke-color': 'rgba(255, 255, 255, 1)',
          'circle-stroke-width': 2
        }
      });

      // 添加聚合数字图层
      this.map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'stations',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 16,
          'text-font': ['Arial Unicode MS Bold']
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // 添加未聚合的点图层
      this.map.addLayer({
        id: 'person-point',
        type: 'symbol',
        source: 'stations',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': ['match', ['get', 'status'], 'active', 'active-marker', 'normal-marker'],
          'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 16, 1],
          'icon-allow-overlap': true
        }
      });

      // 添加聚合点击事件
      this.map.on('click', 'clusters', e => {
        const features = this.map.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });

        if (!features.length) {
          console.log('未找到聚合点特征');
          return;
        }

        try {
          const clusterId = features[0].properties.cluster_id;
          const source = this.map.getSource('stations');

          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) {
              console.error('获取聚合展开层级失败:', err);
              return;
            }

            // 确保有坐标
            if (features[0].geometry && features[0].geometry.coordinates) {
              this.map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom + 1, // 增加一个层级以确保更好的展开效果
                duration: 500 // 添加动画持续时间
              });
            }
          });
        } catch (error) {
          console.error('处理聚合点击事件失败:', error);
        }
      });

      // 添加未聚合点的点击事件
      this.map.on('click', 'person-point', e => {
        if (!e.features || !e.features.length) return;
        const feature = e.features[0].properties;
        const siteData = this.stationData.find(site => site.cardId === feature.id);

        if (!siteData) {
          console.error('未找到对应的站点数据');
          return;
        }

        if (this.popupObj[feature.id]) {
          this.popupObj[feature.id].remove();
          this.popupObj[feature.id] = null;
          this.updateMarkerStatus(feature.id, 'normal');
        } else {
          // 关闭其他所有弹窗
          Object.keys(this.popupObj).forEach(key => {
            if (this.popupObj[key]) {
              this.popupObj[key].remove();
              this.popupObj[key] = null;
              this.updateMarkerStatus(key, 'normal');
            }
          });

          // 显示当前点击的弹窗
          this.popupObj[feature.id] = this.genSitePopup(siteData);
          this.updateMarkerStatus(feature.id, 'active');
        }
      });

      // 添加鼠标样式变化
      this.map.on('mouseenter', 'clusters', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      this.map.on('mouseleave', 'clusters', () => {
        this.map.getCanvas().style.cursor = '';
      });

      // 添加鼠标样式变化
      this.map.on('mouseenter', 'person-point', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      this.map.on('mouseleave', 'person-point', () => {
        this.map.getCanvas().style.cursor = '';
      });
    },
    handlePopup() {
      // 移除判断取反的逻辑
      this.stationData.forEach(site => {
        if (this.isShowPopup) {
          // 如果已经存在popup，先移除
          if (this.popupObj[site.cardId]) {
            this.popupObj[site.cardId].remove();
          }
          // 创建新的popup
          this.popupObj[site.cardId] = this.genSitePopup(site);
        } else {
          // 关闭popup
          if (this.popupObj[site.cardId]) {
            this.popupObj[site.cardId].remove();
            this.popupObj[site.cardId] = null;
          }
        }
      });
    },
    // 生成站点弹窗
    genSitePopup(site) {
      // 确保site数据完整
      if (!site || !site.x || !site.y) {
        console.error('站点数据不完整:', site);
        return null;
      }
      const props = {
        site: {
          ...site // 直接使用传入的site数据
        }
      };
      try {
        const popup = this.addPopup([site.x, site.y], {}, GB.sitePopupConstructor, props);
        return popup;
      } catch (error) {
        console.error('创建popup失败:', error);
        return null;
      }
    },
    addPopup(latLng, popupConfig, PopupCtor, popupProps) {
      let that = this;
      let popup = new mapboxgl.Popup({
        closeButton: false,
        // closeOnClick: false,
        offset: [0, -40]
      });
      const instance = new PopupCtor({
        parent: this,
        data() {
          return {
            ...popupProps
          };
        },
        methods: {
          viewTracks() {
            that.$emit('viewTracks', this.site);
          }
        }
      });

      const el = instance.$mount().$el;
      popup
        .setDOMContent(el)
        .setLngLat(latLng)
        .addTo(this.map);
      return popup;
    },
    hideSitePopup(id) {
      this.popupObj[id].remove();
      this.popupObj[id] = null;
    },
    setupMapEvents() {
      const events = {
        zoom: this.handleMapZoom,
        'mouseenter-clusters': () => this.updateCursor('pointer'),
        'mouseleave-clusters': () => this.updateCursor(''),
        'mouseenter-person-point': () => this.updateCursor('pointer'),
        'mouseleave-person-point': () => this.updateCursor('')
      };

      Object.entries(events).forEach(([event, handler]) => {
        const [eventName, layer] = event.split('-');
        const boundHandler = handler.bind(this);

        if (layer) {
          this.map.on(eventName, layer, boundHandler);
          this.eventHandlers[event] = { layer, handler: boundHandler };
        } else {
          this.map.on(eventName, boundHandler);
          this.eventHandlers[event] = { handler: boundHandler };
        }
      });
    },
    updateCursor(cursor) {
      if (this.map) {
        this.map.getCanvas().style.cursor = cursor;
      }
    },
    handleMapZoom() {
      const zoom = this.map.getZoom();
      this.mapConfig.zoom = zoom;
    },
    setMapView() {
      this.map.flyTo({ center: this.mapConfig.center, zoom: this.mapConfig.zoom });
    },
    initializeDefers() {
      this.mapLoadedDefer = createDefer();

      Promise.all([this.mapLoadedDefer]).then(() => {
        this.setupMapEvents();
      });
    },
    cleanup() {
      // 清理事件监听
      Object.entries(this.eventHandlers).forEach(([event, { layer, handler }]) => {
        if (layer) {
          this.map?.off(event.split('-')[0], layer, handler);
        } else {
          this.map?.off(event, handler);
        }
      });
      this.eventHandlers = {};

      // 清理动画
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      // 清理地图实例
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      // 移除resize监听
      window.removeEventListener('resize', this.handleResize);

      this.shouldRenderMap = false;
      this.mapInitialized = false;
    },
    // 添加更新marker状态的方法
    updateMarkerStatus(id, status) {
      const source = this.map.getSource('stations');
      if (source) {
        const data = source._data; // 获取当前数据
        const features = data.features.map(f => {
          if (f.properties.id === id) {
            return {
              ...f,
              properties: {
                ...f.properties,
                status: status
              }
            };
          }
          return f;
        });

        source.setData({
          type: 'FeatureCollection',
          features: features
        });
      }
    },
    addMovingMarker() {
      // 移除已有的移动标记
      if (this.map.getLayer('moving-point')) {
        this.map.removeLayer('moving-point');
      }
      if (this.map.getSource('moving-point')) {
        this.map.removeSource('moving-point');
      }

      // 创建移动点的数据源
      this.map.addSource('moving-point', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [this.personLine[0].x, this.personLine[0].y]
          }
        }
      });

      // 添加移动点图层
      this.map.addLayer({
        id: 'moving-point',
        type: 'symbol',
        source: 'moving-point',
        layout: {
          'icon-image': 'ic_person',
          'icon-size': 0.24,
          // 'icon-rotate': ['get', 'bearing'],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });

      // 开始动画
      this.startAnimation();
    },
    startAnimation() {
      this.startTime = performance.now();
      this.animate();
    },
    animate() {
      const currentTime = performance.now();
      const elapsed = currentTime - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);

      // 如果动画完成，重新开始
      if (progress === 1) {
        this.startTime = currentTime;
        this.animate();
        return;
      }

      // 计算当前位置
      const currentPosition = this.interpolatePosition(progress);

      // 更新标记位置和方向
      const source = this.map.getSource('moving-point');
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {
            bearing: currentPosition.bearing
          },
          geometry: {
            type: 'Point',
            coordinates: [currentPosition.x, currentPosition.y]
          }
        });
      }

      // 继续动画
      this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    },
    calculatePathLengths() {
      this.segmentLengths = [];
      this.pathLength = 0;

      for (let i = 0; i < this.personLine.length - 1; i++) {
        const start = this.personLine[i];
        const end = this.personLine[i + 1];
        const segmentLength = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        this.segmentLengths.push(segmentLength);
        this.pathLength += segmentLength;
      }
    },
    interpolatePosition(progress) {
      if (this.pathLength === 0) return { x: 0, y: 0, bearing: 0 };

      // 计算目标距离
      const targetDistance = progress * this.pathLength;

      // 找到目标线段
      let accumulatedDistance = 0;
      let segmentIndex = 0;

      while (
        segmentIndex < this.segmentLengths.length &&
        accumulatedDistance + this.segmentLengths[segmentIndex] < targetDistance
      ) {
        accumulatedDistance += this.segmentLengths[segmentIndex];
        segmentIndex++;
      }

      // 如果已经到达终点
      if (segmentIndex >= this.segmentLengths.length) {
        const lastPoint = this.personLine[this.personLine.length - 1];
        const secondLastPoint = this.personLine[this.personLine.length - 2];
        return {
          x: lastPoint.x,
          y: lastPoint.y,
          bearing: this.calculateBearing(secondLastPoint, lastPoint)
        };
      }

      // 计算在当前线段上的进度
      const remainingDistance = targetDistance - accumulatedDistance;
      const segmentProgress = remainingDistance / this.segmentLengths[segmentIndex];

      const start = this.personLine[segmentIndex];
      const end = this.personLine[segmentIndex + 1];

      // 计算当前位置
      const x = start.x + (end.x - start.x) * segmentProgress;
      const y = start.y + (end.y - start.y) * segmentProgress;

      // 计算方向角度
      const bearing = this.calculateBearing(start, end);

      return { x, y, bearing };
    },

    calculateBearing(start, end) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      return (Math.atan2(dx, dy) * 180) / Math.PI;
    }
  },
  created() {
    if (accessToken.get()) {
      this.token = `Bearer ${accessToken.get()}`;
    }
    this.initializeDefers();
  },
  beforeDestroy() {
    this.cleanup();
  }
};
</script>

<style lang="less" scoped>
.map-container {
  width: 100%;
  height: 100%;
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
