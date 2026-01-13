/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-08-10 09:21:03
 * @LastEditTime: 2022-11-23 16:36:49
 * @LastEditors: huhaiou
 */
import serverconfig from "./server.config";

export default {
  // 地图坐标系前后端映射
  crsMap: (function () {
    const f2b = {
        'BD': 'BD09',
        'GD': 'GCJ02',
        'TD': 'WGS84', // '4326',
        'CUSTOM': 'EPSG'
      },
      b2f = Object.entries(f2b).reduce((a, [k, v]) => {
        a[v] = k;
        return a;
      }, {});
    return {
      f2b,
      b2f
    }
  }()),
  // 服务类型映射
  serverType: {
    0: 'GeoServer',
    1: 'Arcgis'
  },
  // 目前支持的geoserver坐标系
  supportGeoserverCRS: ['4326'],
  // 地址逆解析坐标系映射
  coordTypeMap: {
    TD: 'wgs84ll',
    GD: 'gcj02ll',
    BD: 'bd09ll'
  },
  // 在线地图配置
  onlineMap: {
      // 百度地图
      'BD': {
        name: '百度地图',
        crs: 'Baidu',
        vecLayers: [
          // "https://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20180711&scale=1&ak=0F7691e465f5d7d161a4771f48ee38ff&styles=t%3Aland%7Ce%3Aall%7Cc%3A%23edf3f3ff%2Ct%3Awater%7Ce%3Aall%7Cc%3A%23bdd5dbff%2Ct%3Agreen%7Ce%3Aall%7Cc%3A%23dee5e5ff%2Ct%3Aall%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aroad%7Ce%3Ag.s%7Cc%3A%23dbdbdbff%2Ct%3Aall%7Ce%3Al.t.f%7Cc%3A%237b7a7cff%2Ct%3Aall%7Ce%3Al.t.s%7Cc%3A%23fbfffeff%2Ct%3Aroad%7Ce%3Ag.f%7Cc%3A%23e6eaeaff%2Ct%3Amanmade%7Ce%3Ag.f%7Cc%3A%23dee5e5ff%2Ct%3Amanmade%7Ce%3Al%7Cv%3Aoff%2Ct%3Aeducationlabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Amedicallabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Abuilding%7Ce%3Aall%7Cv%3Aoff%7Cc%3A%23dee5e5ff%2Ct%3Ascenicspotslabel%7Ce%3Al%7Cv%3Aoff",
          // 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1'
          'http://api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20180711&scale=1&ak=0F7691e465f5d7d161a4771f48ee38ff&styles=t%3Aland%7Ce%3Aall%7Cc%3A%23edf3f3ff%2Ct%3Awater%7Ce%3Aall%7Cc%3A%23bdd5dbff%2Ct%3Agreen%7Ce%3Aall%7Cc%3A%23dee5e5ff%2Ct%3Aall%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aroad%7Ce%3Ag.s%7Cc%3A%23dbdbdbff%2Ct%3Aall%7Ce%3Al.t.f%7Cc%3A%237b7a7cff%2Ct%3Aall%7Ce%3Al.t.s%7Cc%3A%23fbfffeff%2Ct%3Aroad%7Ce%3Ag.f%7Cc%3A%23e6eaeaff%2Ct%3Amanmade%7Ce%3Ag.f%7Cc%3A%23dee5e5ff%2Ct%3Amanmade%7Ce%3Al%7Cv%3Aoff%2Ct%3Aeducationlabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Amedicallabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Abuilding%7Ce%3Aall%7Cv%3Aoff%7Cc%3A%23dee5e5ff%2Ct%3Ascenicspotslabel%7Ce%3Al%7Cv%3Aoff'
        ],
        imgLayers: [
          'http://shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46',
          'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020'
        ],
        config: {
          maxZoom: 18,
          minZoom: 5,
          subdomains: '012',
          tms: true
        }
      },
      // 天地图
      'TD': {
        name: '天地图',
        crs: 'EPSG3857',
        vecLayers: [
          'https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=f53070ab4ca2d504e1b53d42949fac14',
          'https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=f53070ab4ca2d504e1b53d42949fac14'
        ],
        imgLayers: [
          'https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=f53070ab4ca2d504e1b53d42949fac14',
          'https://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=f53070ab4ca2d504e1b53d42949fac14'
        ],
        config: {
          maxZoom: 18,
          minZoom: 1,
          subdomains: "01234567",
        }
      },
      // 高德地图
      'GD': {
        name: '高德地图',
        crs: 'EPSG3857',
        vecLayers: ["http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"],
        imgLayers: [
          'https://webst0{s}.is.autonavi.com/appmaptile?style=6&scl=1&x={x}&y={y}&z={z}',
          'https://wprd02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8&ltype=11'
        ],
        config: {
          maxZoom: 18,
          minZoom: 3,
          subdomains: "1234"
        }
      }
  },
  gisOrigin: serverconfig.GIS_ORIGIN_URL,
}
