<template>
  <div class="map" ref="map"></div>
</template>

<script>
import Url from "url-parse";
import querystring from "querystring";
import mapConfig from '@/config/map.config';
import getLayerInfo from "./models/getLayerInfo";
import './models/leafletControlExtend';
import mapResize from "./models/mapResize";
import axios from 'axios';
import {debounce} from 'throttle-debounce';
import {transformLngLat} from "@/components/wpgMap/models/utils";
import {transXyToLnglat as apiTransXyToLnglat} from '@/api';

const GB = {
  onlineMapTypes: Object.keys(mapConfig.onlineMap),
  mapServerTypes: Object.keys(mapConfig.serverType).map(v => +v),
  antLineLimit: 5000, // 蚂蚁线数据加载限制，过多会卡顿，影响用户体验
  antLineOptions: {
    delay: 3000,
    dashArray: [2, 50],   //[脉冲的长度，脉冲间的间隔]
    weight: 3,
    color: "#4362FF",   //#4362FF    颜色2:线条底色
    pulseColor: "#000",  //#F8F7F3   颜色1：脉冲色
    hardwareAccelerated: false
  }
};

export default {
  name: "index",
  inheritAttrs: false,
  mixins: [mapResize],
  props: {
    // 用于重置地图，如地图切换时
    id: [Number, String],
    // 地图类型
    mapType: {
      type: String,
      validator(value) {
        // BD=>百度地图，TD=>天地图，GD=>高德地图，CUSTOM=>自定义地图（需要传mapServer和mapUrl）
        return [...GB.onlineMapTypes, 'CUSTOM'].indexOf(value) !== -1;
      },
      default: GB.onlineMapTypes[0]
    },
    // 地图服务类型
    mapServer: {
      type: Number,
      validator(value) {
        // 0=>geoserver，1=>arcgis，参考map.config.js
        return GB.mapServerTypes.indexOf(value) !== -1;
      },
      default: GB.mapServerTypes[0]
    },
    // 地图链接
    mapUrl: String,
    // 中心点和缩放
    // 项目中经常用到字符串坐标，且经度在前纬度在后，如‘117.2285842,34.1433506’，所以兼容该格式字符串解析
    // 数组坐标遵循leaflet，纬度在前，经度在后
    center: [Object, Array, String],
    zoom: Number,
    // 地图控制器
    control: {
      type: String,
      validator(value) {
        return !value || ['topleft', 'topright', 'bottomleft', 'bottomright'].indexOf(value) !== -1;
      }
    },
    // 卫星地图可见性（仅针对在线地图，且高德卫星地图暂无注解）
    satelliteMapVisible: Boolean,
    // 图层
    layers: Array,
    // 图层显示控制，整体控制传boolean，细节控制传图层id数组
    layersVisible: {
      type: [Boolean, Array],
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    isCustomMap() {
      return this.mapType === 'CUSTOM';
    },
    realCenter() {
      return transformLngLat(this.center);
    }
  },
  watch: {
    id: 'initFrame',
    satelliteMapVisible: 'showOnlineMap',
    layersVisible: 'showLayers'
  },
  mounted() {
    this.initData();
    this.initFrame();
  },
  methods: {
    /**
     * 初始化数据
     */
    initData() {
      // 无需响应式的数据初始化
      this.map = null;  // 地图实例
      this.mapInitInfo = {};  // 地图初始信息（主要用于回到中心点）
      this.vecMapGroup = null;  // 矢量地图图层组
      this.imgMapGroup = null;  // 卫星地图图层组
      this.layerList = [];  // 图层列表
      this.layersGroup = null;  // 第三方自定义图层组（geoserver、arcgis）
    },
    /**
     * 初始化界面
     */
    async initFrame() {
      // 移除之前的地图并初始化数据
      if (this.map) {
        this.map.remove();
        this.initData();
      }
      // 判断地图类型
      if (this.isCustomMap) {
        await this.initCustomMap();
      } else {
        this.initOnlineMap();
      }
      if (!this.map) {
        return this.$message.warn('地图初始化失败，请检查相关参数');
      }
      // 添加地图缩放控件和回到中心点控件
      if (this.control) {
        L.control.zoom({position: this.control, zoomInTitle: '放大', zoomOutTitle: '缩小'}).addTo(this.map);
        L.control.center({position: this.control, centerTitle: '回到中心点'}).addTo(this.map);
      }
      // 派发地图实例
      this.$emit('loaded', this.map);
      // 添加图层
      this.addMapLayers();
      // 添加事件
      this.initEvent();
    },
    /**
     * 初始化事件
     */
    initEvent() {
      // 展示图层防抖，zoom和move同时触发或多操作同时进行时减少调用
      const debounceShowLayers = debounce(100, false, this.showLayers);
      const zoomEvents = () => {
        debounceShowLayers();
      };
      const moveEvents = () => {
        debounceShowLayers();
      };
      this.map.on('zoom', zoomEvents);
      this.map.on('move', moveEvents);
      this.map.on('goCenter', this.goCenter);
      this.$once('hook:beforeDestroy', () => {
        this.map.off('zoom', zoomEvents);
        this.map.off('move', moveEvents);
        this.map.off('goCenter', this.goCenter);
      });
    },
    /**
     * 初始化在线地图
     */
    initOnlineMap() {
      const _mapConfig = mapConfig.onlineMap[this.mapType];
      // 定义地图初始信息
      this.mapInitInfo.center = this.realCenter || [39.90960456049752, 116.3972282409668]; // 北京天安门
      this.mapInitInfo.zoom = this.zoom || 14;
      // 创建地图容器
      this.map = L.map(this.$refs.map, {
        crs: L.CRS[_mapConfig.crs],
        center: this.mapInitInfo.center,
        zoom: this.mapInitInfo.zoom,
        zoomControl: false,
        attributionControl: false,
      });
      // 添加地图类型标志
      L.control.attribution({prefix: _mapConfig.name, position: 'bottomleft'}).addTo(this.map);
      // 创建矢量和卫星图层组
      this.vecMapGroup = L.layerGroup();
      this.imgMapGroup = L.layerGroup();
      // 创建矢量和卫星图层
      const layerArr = [{
        layers: 'vecLayers',
        to: this.vecMapGroup
      }, {
        layers: 'imgLayers',
        to: this.imgMapGroup
      }];
      layerArr.forEach(ly => {
        if (_mapConfig[ly.layers]) {
          _mapConfig[ly.layers].forEach(layer => {
            L.tileLayer(layer, {
              maxZoom: 18,
              minZoom: 1,
              subdomains: '012',
              ..._mapConfig.config
            }).setZIndex(-1).addTo(ly.to);
          });
        }
      });
      // 展示图层
      this.showOnlineMap();
    },
    /**
     * 初始化自定义地图
     */
    async initCustomMap() {
      if (!this.mapUrl) {
        return this.$message.warn('自定义地图需要传地图URL');
      }
      // 获取图层信息
      const res = await getLayerInfo(this.mapServer, this.mapUrl);
      if (!res) {
        this.$message.warn('自定义地图信息获取失败');
        return;
      }
      const {category, type} = res;
      // 判断初始化哪种自定义地图
      if (category === 'geoserver' && type === 'WMS') {
        await this.initGeoserverMap(res);
      } else if (category === 'arcgis' && type === 'feature') {
        this.initArcgisMap(res);
      } else {
        this.$message.warn(`暂不支持${category}的${type}作为自定义地图`);
      }
    },
    /**
     * 初始化arcgis地图
     * @param res
     * @returns {number}
     */
    initArcgisMap(res) {
      // 创建自定义坐标系CRS
      const {fullExtent: bounds, maxScale = -Infinity, minScale = Infinity, tileInfo: {origin, lods, rows}, mapName, spatialReference: {wkid}} = res.origin;
      const _lods = lods.filter(v => v.scale >= maxScale && v.scale <= minScale),
        resolutions = _lods.map(v => v.resolution),
        customProj = L.extend({}, L.Projection.LonLat, {
          bounds: new L.Bounds([bounds.xmin, bounds.ymin], [bounds.xmax, bounds.ymax])
        }),
        customCRS = L.extend({}, L.CRS, {
          scale(zoom) {
            return 1 / resolutions[zoom];
          },
          transformation: L.transformation(1, -origin.x, -1, origin.y),
          projection: customProj
        });
      // 定义地图初始信息
      this.mapInitInfo.center = this.realCenter || [(bounds.ymin + bounds.ymax) / 2, (bounds.xmin + bounds.xmax) / 2];
      this.mapInitInfo.zoom = this.zoom || (_lods[0]?.level ?? 0);
      // 创建地图容器
      this.map = L.map(this.$refs.map, {
        crs: customCRS,
        center: this.mapInitInfo.center,
        zoom: this.mapInitInfo.zoom,
        zoomControl: false,
        attributionControl: false,
      });
      // 添加地图类型标志
      L.control.attribution({prefix: `自定义地图 arcgis ${wkid}`, position: 'bottomleft'}).addTo(this.map);
      // 创建地图层
      L.tileLayer(this.mapUrl + "/tile/{z}/{y}/{x}", {
        tileSize: rows,
        maxZoom: _lods[_lods.length - 1].level,
        minZoom: _lods[0].level,
      }).setZIndex(-1).addTo(this.map);
    },
    /**
     * 初始化geoserver地图
     * @param res
     */
    async initGeoserverMap(res) {
      const {category, crs, origin} = res;
      // if (!~mapConfig.supportGeoserverCRS.indexOf(crs)) {
      //   this.$message.warn(`暂不支持显示坐标系为[${crs}]的${category}图层，目前支持的${category}坐标系有[${mapConfig.supportGeoserverCRS.join()}]`);
      //   return;
      // }
      // 自动生成中心点
      let _center = null, _bounds = [[origin.bbox[1], origin.bbox[0]], [origin.bbox[3], origin.bbox[2]]];
      // 通过接口转xy坐标为经纬度（通过值是否在[-90, 90]区间判断坐标类型，不严谨），经纬度坐标：[lng,lat,lng,lat]；xy坐标：[x,y,x,y]
      if (!origin.bbox.some(v => v >= -90 && v <= 90)) {
        try {
          const lngLat = await apiTransXyToLnglat({
            sourceCrs: crs,
            points: _bounds.map(v => v.slice().reverse())
          });
          _bounds = lngLat.map(v => v.reverse().map(vv => +vv));
        } catch (err) {
        }
      }
      _center = [(_bounds[0][0] + _bounds[1][0]) / 2, (_bounds[0][1] + _bounds[1][1]) / 2];
      // 定义地图初始信息
      this.mapInitInfo.center = this.realCenter || _center;
      this.mapInitInfo.zoom = this.zoom || 10;
      // 创建地图容器
      this.map = L.map(this.$refs.map, {
        crs: L.CRS.EPSG4326,  // 投影坐标都可以用4326显示，非投影坐标暂时也统一用4326
        center: this.mapInitInfo.center,
        zoom: this.mapInitInfo.zoom,
        zoomControl: false,
        attributionControl: false
      });
      // 添加地图类型标志
      L.control.attribution({prefix: `自定义地图 ${category} ${crs}`, position: 'bottomleft'}).addTo(this.map);
      // 创建地图层
      const _url = new Url(this.mapUrl);
      const _query = querystring.parse(_url.query.substr(1));
      L.tileLayer.wms(_url.origin + _url.pathname, {
        layers: _query.layers,
        format: 'image/png',
        transparent: true,
        identify: false,
        minZoom: 0,
        maxZoom: 18,
        noWrap: true,
        bounds: _bounds
      }).setZIndex(-1).addTo(this.map);
    },
    /**
     * 重置地图中心点
     * @param latLng
     * @param zoom
     * @param fromGoCenter 是否来自goCenter方法，防止陷入死循环
     */
    resetMapCenter(latLng, zoom = 10, fromGoCenter) {
      if (!latLng) return;
      try {
        this.map.setView(latLng, zoom, {animate: false});
      } catch (err) {
        !fromGoCenter && this.goCenter();
      }
    },
    /**
     * 回到地图中心点
     */
    goCenter(center, zoom) {
      if (center && zoom) {
        this.mapInitInfo.center = center;
        this.mapInitInfo.zoom = zoom;
      }
      if (this.mapInitInfo.center) {
        this.resetMapCenter(this.mapInitInfo.center, this.mapInitInfo.zoom, true);
      }
    },
    /**
     * 展示在线地图
     */
    showOnlineMap() {
      if (this.isCustomMap) return;
      if (this.satelliteMapVisible) {
        this.map.removeLayer(this.vecMapGroup).addLayer(this.imgMapGroup);
      } else {
        this.map.removeLayer(this.imgMapGroup).addLayer(this.vecMapGroup);
      }
    },
    /**
     * 添加图层
     */
    addMapLayers() {
      if (!this.layers || !this.layers.length) return;

      this.layerList = [];
      if (this.layersGroup) {
        this.layersGroup.clearLayers();
      } else {
        this.layersGroup = L.layerGroup().addTo(this.map);
      }

      const addLayerFun = this.isCustomMap && this.mapServer === 1 ? this.addArcgisLayer : this.addGeoserverLayer;
      Promise.all(this.layers.map(addLayerFun)).finally(this.showLayers);
    },
    /**
     * 添加geoserver图层
     * @param layer
     * @return {Promise<void>}
     */
    async addGeoserverLayer(layer) {
      if (!layer) return;
      const isAntLine = !!layer.antLine;
      let layerConfig = {
        data: layer
      };

      if (!isAntLine) {
        // 加载普通图层（普通图层直接配置，蚂蚁线需要实时获取加载）
        const _url = new Url(layer.layerUrl);
        const _query = querystring.parse(_url.query.substr(1));
        const _layer = L.tileLayer.wms(_url.origin + _url.pathname, {
          crs: L.CRS.EPSG4326,  // geoserver图层指定4326坐标系，防止在线地图上发生偏移
          layers: _query.layers,
          format: 'image/png',
          transparent: true,
          identify: false,
          minZoom: 0,
          maxZoom: 18,
          noWrap: true
        });
        _layer.setZIndex(layer.dataSort);
        layerConfig.layer = _layer;
      }
      this.layerList.push(layerConfig);
    },
    /**
     * 添加arcgis图层
     * @param layer
     * @return {Promise<void>}
     */
    async addArcgisLayer(layer) {
      if (!layer) return;
      const isAntLine = !!layer.antLine;
      let layerConfig = {
        data: layer
      };

      if (!isAntLine) {
        // 加载普通图层（普通图层直接配置，蚂蚁线需要实时获取加载）
        const res = await getLayerInfo(1, layer.layerUrl);
        const {maxScale = -Infinity, minScale = Infinity, tileInfo: {lods, rows}} = res.origin;
        const _lods = lods.filter(v => v.scale >= maxScale && v.scale <= minScale);
        // 纠正最大缩放
        let layerMaxZoom = _lods[_lods.length - 1].level, mapMaxZoom = this.map.getMaxZoom();
        if (layerMaxZoom > mapMaxZoom) {
          layerMaxZoom = mapMaxZoom;
        } else {
          this.map.setMaxZoom(layerMaxZoom);
        }
        const _layer = L.tileLayer(layer.layerUrl + "/tile/{z}/{y}/{x}", {
          tileSize: rows,
          maxZoom: layerMaxZoom,
          minZoom: _lods[0].level,
        });

        _layer.setZIndex(layer.dataSort);
        layerConfig.layer = _layer;
      }
      this.layerList.push(layerConfig);
    },
    /**
     * 添加蚂蚁线图层（包括geoserver和arcgis）
     */
    async addAntLineLayer(config) {
      const {data, layer, key} = config;
      const mapServer = this.isCustomMap ? this.mapServer : 0;
      const bounds = this.map.getBounds();
      let newLayer = null;

      // 生成新的蚂蚁线
      if (mapServer === 0) {
        // geoserver蚂蚁线
        const _url = new Url(data.layerUrl);
        let _query = querystring.parse(_url.query.substr(1));
        // 更新链接里获取的数据量（wfs版本不一样字段不一样）
        _query.maxFeatures && (_query.maxFeatures = GB.antLineLimit);
        _query.count && (_query.count = GB.antLineLimit);
        // 添加bbox
        _query.BBOX = bounds._southWest.lng + ',' + bounds._southWest.lat + ',' + bounds._northEast.lng + ',' + bounds._northEast.lat;
        const _newUrl = _url.origin + _url.pathname + '?' + querystring.stringify(_query);
        try {
          const {data: {features = []}} = await axios.get(_newUrl);
          // 新蚂蚁线加载方法
          const _paths = features.map(feature => this.flatAntLineArray(feature.geometry.coordinates).map(v => v.reverse()));
          newLayer = L.polyline.antPath(_paths, GB.antLineOptions);
        } catch (err) {
          console.error('Geoserver蚂蚁线加载失败', err);
        }
      } else {
        // arcgis蚂蚁线
        try {
          const opts = {
            f: "pjson",
            geometry: {
              xmin: bounds._southWest.lng,
              ymin: bounds._southWest.lat,
              xmax: bounds._northEast.lng,
              ymax: bounds._northEast.lat,
            },
          }, limit = 1000;
          // arcgis蚂蚁线单次最多只能返回1000条数据，所以需要先获取总条数再根据设置的上限循环请求
          const {data: {count = 0}} = await axios.get(data.layerUrl + '/query', {
            params: {
              ...opts,
              returnCountOnly: true
            }
          });
          let _paths = [];
          if (count > 0) {
            let reqs = Array.from({length: Math.ceil(Math.min(count, GB.antLineLimit) / limit)}, (_, i) => {
              return axios.get(data.layerUrl + '/query', {params: {...opts, resultOffset: limit * i}});
            });
            let resArr = await Promise.all(reqs);
            _paths = resArr.reduce((arr, res) => {
              const _arr = res.data.features.reduce((arr2, feature) => {
                const _arr2 = feature.geometry.paths.map(path => this.flatAntLineArray(path).map(v => v.reverse()));
                return arr2.concat(_arr2);
              }, []);
              return arr.concat(_arr);
            }, []);
          }
          newLayer = L.polyline.antPath(_paths, GB.antLineOptions);
        } catch (err) {
          console.error('Arcgis蚂蚁线加载失败', err);
        }
      }
      // 校验数据是否有效
      if (key !== config.key) return;
      // 移除旧的蚂蚁线
      if (layer && this.layersGroup.hasLayer(layer)) {
        this.layersGroup.removeLayer(layer);
      }
      // 加载新图层
      config.layer = newLayer;
      config.layer && this.layersGroup.addLayer(config.layer);
    },
    /**
     * 展平蚂蚁线数组（多维数组转二维数组）
     * @param arr
     * @returns {[]}
     */
    flatAntLineArray(arr) {
      let _arr = [], _temp = [];
      arr.forEach(v => {
        if (Array.isArray(v)) {
          _arr = _arr.concat(this.flatAntLineArray(v));
        } else {
          _temp.push(v);
        }
      });
      if (_temp.length) {
        _arr.push(_temp);
      }
      return _arr;
    },
    /**
     * 展示图层
     */
    showLayers() {
      if (!this.map) return;
      const zoom = this.map.getZoom(),
        isBol = typeof this.layersVisible === 'boolean',
        isArr = Array.isArray(this.layersVisible);

      if (isBol && !this.layersVisible) {
        this.layersGroup.clearLayers();
      } else {
        this.layerList.forEach(layerConfig => {
          const {data, layer} = layerConfig;
          // 蚂蚁线数据有效性校验
          layerConfig.key = Date.now();

          if (data.layerZoom <= zoom && (isBol && this.layersVisible || isArr && ~this.layersVisible.indexOf(data.id))) {
            if (data.antLine) {
              // 蚂蚁线
              this.addAntLineLayer(layerConfig);
            } else {
              // 普通图层
              if (!this.layersGroup.hasLayer(layer)) {
                this.layersGroup.addLayer(layer);
              }
            }
          } else if (layer && this.layersGroup.hasLayer(layer)) {
            this.layersGroup.removeLayer(layer);
          }
        });
      }
    },
  }
}
</script>

<style scoped lang="less">
.map {
  height: 100%;
  background-color: #f8f9fa;
}
</style>
