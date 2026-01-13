<template>
  <div class="module">
    <w-spin v-if="addressLoading" />
    <leaflet-map
      v-if="token"
      :key="mapKey"
      ref="wpgMap"
      v-bind="mapProps"
      :token="token"
      @initialize="mapLoaded"
    />
  </div>
</template>

<script>
import L from 'leaflet';
import people_free from '@/assets/images/default/map/people_free.png';
import people_busy from '@/assets/images/default/map/people_busy.png';
import mapConfig from '@/config/map.config';
import { getReverseGeocode } from '@/api/index.js';
import { getUserDetail } from '@/api/map';
import { LeafletMap } from '@wpg/map-vue';
import { toggleBaseMap } from '@/core/mixins';
import { LatLngsAnimate } from '@/views/home/animate';
import { createMarker } from '@/views/home/components/use';
import { mapActions } from 'vuex';
import { mapState } from 'vuex';
import { accessToken } from '@wpg/framework-vue';
import storage from '@/utils/storage';
import { getUserSetting } from '@/api/manage';
import { GB, AddPopup } from '@/views/home/models/tools';
import gcoord from 'gcoord';

export default {
  name: 'trailMap',
  components: {
    LeafletMap
  },
  inheritAttrs: false,
  props: {
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
    }
  },
  mixins: [toggleBaseMap],
  data() {
    return {
      curLocation: null, // 当前坐标
      curAddress: void 0, // 当前地址
      addressLoading: false, // 地址loading
      token: `Bearer ${accessToken.get()}`,
      ratio: 1,
      currentPersonLayer: null, // 人员定位marker图层组
      personTrailLayer: null, // 人员轨迹图层
      personInfoPopup: null,
      trailPopup: null,
      tileLayerGroup: null, // 地图底图图层组
      animatePersons: [],
      defaultMapProps: {
        // 地图配置
        controls: {
          coordinate: true,
          scale: true,
          layers: false,
          zoom: true,
          restore: true,
          fullscreen: false
        },
        mapOptions: {
          maxZoom: 18
        }
      },
      latLngType: '',
      mapLevel: 14
    };
  },
  computed: {
    ...mapState('configure', ['typeMapProps']),
    ...mapState('map', ['center']),
    mapProps() {
      return {
        ...this.defaultMapProps,
        ...this.typeMapProps
      };
    }
  },
  created() {
    this.initData();
  },
  mounted() {
    //人员轨迹事件
    this.$bus.$on('currentPerson', res => {
      this.onCurrentPersonChange(res);
    });
    this.$bus.$on('trailChange', res => {
      this.onTrailChange(res);
    });
    this.$bus.$on('trailPlayChange', res => {
      this.onTrailPlayChange(res);
    });
    this.$bus.$on('prev', () => {
      this.prevTrailPath();
    });
    this.$bus.$on('next', () => {
      this.nextTrailPath();
    });
  },
  activated() {
    this.map?.invalidateSize(true);
  },
  destroyed() {
    //销毁人员轨迹事件监听
    this.$bus.$off(['currentPerson', 'trailChange', 'trailPlayChange', 'prev', 'next']);
  },
  methods: {
    ...mapActions('dict', ['GetDict']),
    /**
     * 初始化数据
     */
    initData() {
      // 无需响应式的数据初始化
      this.map = null; // 地图实例
      this.layerGroup = null; // 图层组
      this.tileLayerGroup = L.layerGroup();
      this.currentPersonLayer = L.layerGroup();
      this.personInfoPopup = L.layerGroup();
      this.personTrailLayer = L.layerGroup();
      this.trailPopup = this.genTrailPopup({});
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

      // 初始化地图底图样式
      this.changeMapTheme();

      // 初始化中心点
      this.initLocation();
      // this.resetMapCenter(this.curLocation, Number(this.zoom));

      // 搜索框重置
      this.$refs.locationSearch && this.$refs.locationSearch.reset();
      this.mapLevel = this.map.getZoom();

      this.tileLayerGroup.addTo(this.map);
      this.currentPersonLayer.addTo(this.map);
      this.personInfoPopup.addTo(this.map);
      this.personTrailLayer.addTo(this.map);

      if (this.map && this.$refs.wpgMap) {
        // 初始化的时候要根据主题确认地图底图样式
        this.changeMapTheme();
      }
    },
    genTrailPopup(trail) {
      const props = {
        trail,
        visible: false
      };
      const popup = AddPopup(
        trail.data ?? [0, 0],
        {
          offset: [20, '0%']
        },
        GB.TrailPopupConstructor,
        props,
        null,
        this
      );
      return popup;
    },
    /**
     * 实时人员位置
     * @param {Array} personList
     */
    onCurrentPersonChange(personList) {
      console.log('personList', personList);

      for (let person of personList) {
        const { lat, lng, status /** 0 离线  */ } = person;
        const iconUrl = status === '0' ? people_free : people_busy;
        const marker = createMarker({ lat, lng }, { iconUrl });
        const popup = this.genPeoplePopup(person);
        this.personInfoPopup.addLayer(popup);
        marker.on('click', () => {
          // 获取地址
          getReverseGeocode({
            from: this.latLngType,
            location: { lat, lng }
          }).then(result => {
            popup.vm.people.userAddress = result?.formatted_address;
          });

          getUserDetail(person.id).then(result => {
            const detail = result?.resultData?.[0] ?? {};
            const iconUrl = detail.status === '0' ? people_free : people_busy;
            popup.vm.people.ticketInfoMapVOList = detail.ticketInfoMapVOList ?? [];
            marker.setIcon(
              L.icon({
                iconSize: [12, 36],
                iconUrl
              })
            );
          });
          popup.vm.visible = !popup.vm.visible;
          // 此叠加层置于其他叠加层之前
          if (popup.vm.visible) popup.bringToFront();
        });
        this.currentPersonLayer.addLayer(marker);
      }
      // const first = personList[0];
      // if (first) {
      //   this.setView([first.lat, first.lng], 18);
      // }
    },
    /**
     * 轨迹播放开关
     * @param {*} param0
     */
    onTrailPlayChange({ paused, ratio }) {
      this.ratio = ratio;
      this.paused = paused;

      this.animatePersons.forEach(item => {
        if (paused) {
          item.pause();
          item.setRatio(ratio);
        } else {
          item.resume();
          item.setRatio(ratio);
        }
      });
    },
    /**
     * 轨迹播放上一帧
     */
    prevTrailPath() {
      this.animatePersons.forEach(item => {
        item.prevPath();
      });
    },
    /**
     * 轨迹播放下一帧
     */
    nextTrailPath() {
      this.animatePersons.forEach(item => {
        item.nextPath();
      });
    },
    /**
     * 定义轨迹起点终点marker
     * @param site
     * @return {any}
     */
    genTrailEndMarker(type = 'start', latLng, color) {
      const state = {
        type,
        color
      };
      const marker = this.addMarker(
        latLng,
        {},
        type === 'start' ? GB.StartTrailMarkerConstructor : GB.EndTrailMarkerConstructor,
        state,
        type === 'start'
          ? {
              iconSize: 40,
              iconAnchor: [40 / 2, 40 / 2]
            }
          : {
              iconSize: 40,
              iconAnchor: [40 / 2, 40]
            }
      );
      return marker;
    },
    /**
     * 添加marker
     * @param latLng  经纬度
     * @param markerConfig  marker配置
     * @param markerCtor  marker构造器
     * @param markerProps marker传递props
     * @param iconConfig  icon配置
     * @returns {any}
     */
    addMarker(latLng, markerConfig, MarkerCtor, markerProps, iconConfig) {
      let marker = L.marker(latLng, {
        riseOnHover: true,
        ...markerConfig
      });
      // 屏蔽marker的双击事件，防止触发不必要的地图缩放
      marker.on('dblclick', () => undefined);
      // 创建自定义icon
      const instance = new MarkerCtor({
        parent: this,
        data() {
          return {
            ...markerProps
          };
        }
      });
      marker.vm = instance;
      let iconSize = markerProps?.site?.ticketAbout === 'user' ? [17, 41] : [22, 22];
      if (markerProps?.site?.list?.length > 1) iconSize = [36, 22];
      const icon = L.divIcon({
        className: 'dp_custom_marker',
        html: instance.$mount().$el,
        iconSize: new L.point(iconSize),
        iconAnchor: [iconSize[0] / 2, iconSize[1]],
        ...iconConfig
      });
      marker.setIcon(icon);
      return marker;
    },
    /**
     * 人员派单
     */
    addTicket() {
      this.$emit('addTicket');
    },
    /**
     * 人员轨迹起点、终点、运动
     * @param {*} paths
     */
    onTrailChange(paths) {
      this.animatePersons.forEach(item => {
        item.stop();
      });
      this.animatePersons = [];
      this.personTrailLayer.clearLayers();
      let hasSetView = false;
      // console.log('ggg',paths)
      paths.forEach(({ id, path, color, name, meta }) => {
        if (!path.length) {
          return;
        }
        // 开始标记
        const start = this.genTrailEndMarker('start', path[0].data[0], color);

        start.on('mousemove', e => {
          this.trailPopup.vm.visible = true;
          this.trailPopup.vm.trail = {
            address: path[0].address,
            date: path[0].pointDate,
            color,
            name
          };
          this.trailPopup.setLatLng(e.latlng);
          L.DomEvent.stopPropagation(e);
        });

        const last = path[path.length - 1];
        const lastFreg = path[path.length - 1].data;
        // 结束标记
        const end = this.genTrailEndMarker('end', lastFreg[lastFreg.length - 1], color);

        end.on('mousemove', e => {
          this.trailPopup.vm.visible = true;
          this.trailPopup.vm.trail = {
            address: last.address,
            date: last.pointDate,
            color,
            name
          };
          this.trailPopup.setLatLng(e.latlng);
          L.DomEvent.stopPropagation(e);
        });

        this.personTrailLayer.addLayer(end);
        this.personTrailLayer.addLayer(start);
        if (!hasSetView) {
          hasSetView = true;
          this.resetMapCenter(path[0].data[0], 15);
        }

        // 轨迹线
        for (let index = 0; index < path.length; index++) {
          const freg = path[index];
          // let tempLatLag = [[freg.data[0][0] - 0.0060,freg.data[0][1] - 0.0065],[freg.data[1][0] - 0.0060,freg.data[1][1] - 0.0065]]
          const line = L.polyline(freg.data, {
            color
          });
          this.personTrailLayer.addLayer(line);

          line.on('mousemove', e => {
            this.trailPopup.vm.visible = true;
            this.trailPopup.vm.trail = {
              address: freg.address,
              date: freg.pointDate,
              color,
              name
            };
            this.trailPopup.setLatLng(e.latlng);
            L.DomEvent.stopPropagation(e);
          });
        }

        // 人员轨迹的移动
        const marker = createMarker({ lat: 0, lng: 0 }, { iconUrl: people_busy });
        this.personTrailLayer.addLayer(marker);

        const animate = new LatLngsAnimate({
          latLngs: meta.map(segs => {
            return segs.map(({ appealLat, appealLng }) => {
              return gcoord
                .transform(
                  [Number(appealLng), Number(appealLat)],
                  gcoord.BD09,
                  gcoord[this.latLngType]
                )
                .reverse();
            });
          }),
          onUpdate(latLng) {
            marker.setLatLng(latLng);
          },
          onCompleted() {
            console.log('completed');
          }
        });
        animate.setRatio(this.ratio);
        animate.start();

        this.animatePersons.push(animate);
      });
    },
    /**
     * 人员详情弹出
     * @param {*} people
     */
    genPeoplePopup(people) {
      const props = {
        people,
        visible: false,
        addTicket: this.addTicket
      };
      const popup = AddPopup(
        [people.lat, people.lng],
        {
          offset: [20, '0%']
        },
        GB.PeoplePopupConstructor,
        props,
        null,
        this
      );
      return popup;
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
      if (this.curLocation?.lat && this.curLocation?.lng) {
        this.resetMapCenter(this.curLocation, Number(this.zoom));
      } else {
        let { status, resultData } = await getUserSetting('mapCenter');
        if (status === 'complete' && resultData) {
          if (!resultData.value) return;
          const { point, mapLevel } = JSON.parse(resultData.value);
          this.resetMapCenter(point, Number(mapLevel));
        }
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
    }
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
    background-color: rgba(255, 255, 255, 0.05);
  }
  /deep/ .dpPopup {
    margin-bottom: 0;
    pointer-events: none;

    &:hover {
      z-index: 1;
    }
    &.leaflet-popup {
      left: 20px !important;
    }
    .leaflet-popup-content-wrapper {
      padding: 0;
      background-color: transparent;
      border-radius: 6px;
      box-shadow: none;
    }

    .leaflet-popup-content {
      width: auto !important;
      margin: 0;

      & > div {
        pointer-events: auto;
      }

      p {
        margin-top: 0;
        margin-bottom: 0;
      }
    }

    .leaflet-popup-tip-container {
      display: none;
    }
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
    border: 2px solid rgba(0, 0, 0, 0.2);
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
