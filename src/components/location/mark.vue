<template>
  <div class="module">
    <w-spin v-if="addressLoading"/>
    <leaflet-map
      v-if="token"
      :key="mapKey"
      ref="wpgMap"
      v-bind="mapProps"
      :token="token"
      @initialize="mapLoaded"
    />
    <template v-if="openSearch">
      <!--   地址搜索控件   -->
      <location-search
        ref="locationSearch"
        :zoom="mapLevel"
        :map-type="latLngType"
        @change="handleLocationSearch"
      />
    </template>
  </div>
</template>

<script>
import L from 'leaflet';
import mapConfig from '@/config/map.config';
import { getReverseGeocode as apiGetReverseGeocode } from '@/api/index.js';
import { LeafletMap } from '@wpg/map-vue';
import { toggleBaseMap } from '@/core/mixins';
// import "@wpg/map-vue/dist/index.css";
import { mapActions } from 'vuex';
import { mapState } from 'vuex';
import { accessToken } from '@wpg/framework-vue';
import storage from '@/utils/storage';

export default {
  name: 'LocationMark',
  components: {
    LocationSearch: () => import('./search'),
    LeafletMap,
  },
  inheritAttrs: false,
  props: {
    // 是否开启搜索功能
    openSearch: {
      type: Boolean,
      default: false
    },
    mapKey: {
      type: [String, Number],
      default: Date.now()
    },
    // 初始marker定位
    location: [String, Object],
    // 地图中心点和缩放
    // center: [String, Array, Object],
    zoom: {
      type: [String, Number],
      default: 10
    },
  },
  mixins: [toggleBaseMap],
  data() {
    return {
      tileLayerGroup: null, // 地图底图图层组
      curLocation: null,  // 当前坐标
      curAddress: void 0, // 当前地址
      addressLoading: false,  // 地址loading
      token: `Bearer ${accessToken.get()}`,
      defaultMapProps: { // 地图配置
        controls: {
          coordinate: false,
          scale: false,
          layers: false,
          zoom: true,
          restore: true,
          fullscreen: false
        },
        controlsPosition: 'bottomright',
        mapOptions: {
          maxZoom: 18
        }
      },
      latLngType: '',
      mapLevel: 14
    };
  },
  computed: {
    ...mapState('configure', ['typeMapProps', 'typeMap']),
    ...mapState('map', ['center']),
    mapProps() {
      return {
        ...this.defaultMapProps,
        ...this.typeMapProps
      };
    }
  },
  watch: {
    curLocation(val) {
      this.addMarker(val);
    },
    curAddress(val) {
      this.addPopup(this.curLocation, val);
    },
    addressLoading(val) {
      this.$emit('loadChange', val);
    },
    // zoom(val){
    //   this.resetMapCenter(this.curLocation, Number(val));
    // }
  },
  created() {
    this.initData();
  },
  methods: {
    ...mapActions('dict', ['GetDict']),
    /**
     * 初始化数据
     */
    initData() {
      // 无需响应式的数据初始化
      this.map = null;  // 地图实例
      this.layerGroup = null;  // 图层组
    },
    /**
     * 地图加载完毕
     * @param map
     */
    mapLoaded(map) {
      // 地图类型
      this.latLngType = this.$refs.wpgMap.getBasemaps()[0].latLngType;

      // 初始化地图
      this.map = map;

      // 添加图层
      this.layerGroup = L.layerGroup().addTo(this.map);
      this.tileLayerGroup = L.layerGroup().addTo(this.map);

      // 初始化地图底图样式
      this.changeMapTheme();

      // 添加地图事件
      this.map.on('click', this.handleMapClick);
      this.$on('hook:beforeDestroy', () => {
        this.map && this.map.off('click', this.handleMapClick);
      });

      // 地图缩放事件
      this.map.on('zoom', this.handleMapZoom);
      this.$on('hook:beforeDestory', () => {
        this.map && this.map.off('zoom', this.handleMapZoom)
      })

      // 初始化中心点
      this.initLocation();
      this.resetMapCenter(this.curLocation, Number(this.zoom));

      // 搜索框重置
      this.$refs.locationSearch && this.$refs.locationSearch.reset();
      this.mapLevel = this.map.getZoom();
    },
    /**
     * 处理地图点击事件
     * @param latlng
     */
    handleMapClick({ latlng }) {
      this.curLocation = latlng;
      this.curAddress = void 0;
      this.reverseGeocoding(latlng);
    },
    /**
     * 处理地图缩放事件
     * @param latlng
     */
    handleMapZoom(){
      const zoom = this.map.getZoom();
      this.$emit('changeZoom', zoom);
    },
    /**
     * 地址逆解析
     * @param latLng
     * @returns {Promise<void>}
     */
    async reverseGeocoding({lat, lng}) {
      this.curAddress = ''; // 重置为空，不然同一地址无法触发监听导致不显示popup
      try {
        this.addressLoading = true;
        const result = await apiGetReverseGeocode({
          from: this.latLngType,
          location: {
            lng,
            lat
          }
        });
        this.curAddress = result?.formatted_address ?? '';
      } catch (err) {
      } finally {
        this.addressLoading = false;
      }
      // 地址逆解析完成触发数据分派
      this.emitChange();
    },
    /**
     * 添加marker
     * @param latLng
     */
    addMarker(latLng) {
      if (!latLng.lat || !latLng.lng) return;
      let { lat, lng } = latLng;
      this.layerGroup.clearLayers();
      L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: require('@/assets/images/default/ic_location_on.png'),
          iconSize: 50,
          iconAnchor: [25, 42]
        })
      }).addTo(this.layerGroup);
    },
    /**
     * 添加popup
     * @param latLng
     * @param content
     */
    addPopup(latLng, content) {
      if (this.isCustomMap || !content || !latLng.lat || !latLng.lng) return;
      let { lat, lng } = latLng;
      this.map.openPopup(content, [lat, lng], {
        offset: [0, -30],
        closeButton: false
      });
    },
    /**
     * 初始化坐标点
     */
    async initLocation() {
      let _location = this.location;
      if (typeof this.location === 'object') {
        let { address, point } = this.location;
        _location = point;
        this.curAddress = address;
      }
      if (_location) {
        this.curLocation = _location;
      }
      if (this.curLocation?.lat) {
        // let [lat, lng] = this.curLocation;
        // await this.reverseGeocoding({lat, lng});
      } else {
        let [lat, lng] = this.center;
        this.resetMapCenter({lat, lng},Number(this.zoom));
      }
    },
    /**
     * 重置地图中心点
     * @param latLng
     * @param zoom
     */
    resetMapCenter(latLng, zoom = 10) {
      if (!latLng || !latLng.lat || !latLng.lng) return;
      try {
        this.map.setView([latLng.lat, latLng.lng], zoom, { animate: false });
        this.$refs.wpgMap.setDefaultView([latLng.lat, latLng.lng], zoom);
      } catch (err) {
        console.error(err);
      }
    },
    /**
     * 处理地址搜索
     * @param location
     * @param address
     */
    handleLocationSearch(location, address) {
      this.curLocation = location;
      this.curAddress = address;
      this.resetMapCenter(location, 18);
      // 搜索完成触发数据分派
      this.emitChange();
    },
    /**
     * 分派坐标和地址数据
     */
    emitChange() {
      storage.set('mapCompression', 'WGS84');
      this.$emit('change', this.latLngType, this.curLocation, this.curAddress);
    },
  }
};
</script>

<style scoped lang="less">
.module {
  position: relative;
  height: 100%;

  .wpg-spin {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, .05);
  }
}

.map {
  width: 100%;
  height: 100%;

  &-search {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
  }

  &-control {
    position: absolute;
    right: 10px;
    bottom: 80px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    background-clip: padding-box;
    border: 2px solid rgba(0, 0, 0, .2);
    border-radius: 4px;

    i {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      color: #000;
      font-size: 20px;
      cursor: pointer;

      &:not(:first-of-type) {
        border-top: 1px solid #ccc;
      }

      &:hover {
        background-color: #f4f4f4;
      }
    }
  }
}
</style>
