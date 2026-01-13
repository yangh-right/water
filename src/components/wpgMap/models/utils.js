/**
 * 将经纬度坐标（可以是字符串或数组或对象）转成leaflet的经纬度对象
 * 项目中经常用到字符串坐标，且经度在前纬度在后，如‘117.2285842,34.1433506’，所以兼容该格式字符串解析
 * 数组坐标遵循leaflet，纬度在前，经度在后
 * @param lngLat
 */
export function transformLngLat(lngLat = {}) {

  let _lngLat = lngLat || {};
  // 字符串坐标解析
  if (typeof _lngLat === 'string') {
    _lngLat = _lngLat.split(',');
    _lngLat.reverse();
  }
  // 数组坐标值校验
  if (Array.isArray(_lngLat)) {
    if (_lngLat.length === 2 && !isNaN(parseFloat(_lngLat[0])) && !isNaN(parseFloat(_lngLat[1]))) {
      _lngLat = _lngLat.slice(0, 2);
    } else {
      _lngLat = null;
    }
  }
  // 坐标对象如果经纬度没有值，则置空而不是转为[0,0]
  if (_lngLat && Object.prototype.toString.call(_lngLat) === '[object Object]') {
    if(isNaN(parseFloat(_lngLat.lat)) || isNaN(parseFloat(_lngLat.lng))){
      _lngLat = null;
    }
  }
  return L.latLng(_lngLat);
}
