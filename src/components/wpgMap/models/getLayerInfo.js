import Url from 'url-parse';
import querystring from 'querystring';
import axios from 'axios';

/**
 * 版本号比较
 * @param ver1
 * @param ver2
 * @returns {number}  1->大，-1->小，0->等
 */
function versionCompare(ver1, ver2) {
  const ver1Arr = ver1.split('.'),
    ver2Arr = ver2.split('.'),
    len = Math.max(ver1Arr.length, ver2Arr.length);

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(ver1Arr[i]), num2 = parseInt(ver2Arr[i]);
    if (num1 > num2 || (num1 > 0 && isNaN(num2))) {
      return 1;
    } else if (num1 < num2 || (isNaN(num1) && num2 > 0)) {
      return -1;
    }
  }
  return 0;
}

/**
 * 获取WFS信息
 * @param url
 * @param originType
 * @returns {Promise<{crs: string, origin: any, bounds: any} | null>}
 */
async function getWFSInfo(url, originType) {
  try {
    const {data} = await axios.get(url);
    if (data && typeof data === 'object') {
      let _crs = data.crs?.properties?.name ?? '';
      _crs = _crs.replace(/^.*EPSG::/, '');
      if (_crs) {
        return {
          category: 'geoserver',
          type: originType,
          crs: _crs,
          origin: data
        }
      }
    }
  } catch (err) {
  }
  return null;
}

/**
 * 获取arcgis信息
 * @param url
 * @param isDynamic
 * @returns {Promise<{crs: number, origin: any, category: string, type: string}|null>}
 */
async function getArcgisInfo(url, isDynamic) {
  try {
    const {data} = await axios.get(url);
    if (data && typeof data === 'object') {
      if (isDynamic) {
        const _crs = (data.extent?.spatialReference?.wkid ?? '') + '';
        if (_crs) {
          return {
            category: 'arcgis',
            type: 'dynamicFeature',
            crs: _crs,
            origin: data
          }
        }
      } else {
        const _crs = (data.spatialReference?.wkid ?? '') + '';
        if (_crs) {
          return {
            category: 'arcgis',
            type: 'feature',
            crs: _crs,
            origin: data
          }
        }
      }
    }
  } catch (err) {
  }
  return null;
}

/**
 * 根据图层链接获取图层信息，现支持geoserver的WMS和WFS以及arcgis的瓦片图和动态图
 * @param type  图层类型，0->geoserver，1->arcgis
 * @param url   图层链接
 * @return {Promise<{crs: number, origin: any, category: string, type: string} | null> | null | Promise<{crs: string, origin: any, bounds: any} | null>}
 */
export default function (type, url) {
  if (type === 0) {
    // geoserver
    const _url = new Url(url);
    const _query = querystring.parse(_url.query.substr(1));
    if (_query.service === 'WMS') {
      let _crs = versionCompare(_query.version, '1.3.0') >= 0 ? _query.crs : _query.srs,  // 1.3.0版本坐标系字段区别
        _bbox = _query.bbox;
      _crs = Array.isArray(_crs) ? _crs[0] : _crs;
      _bbox = Array.isArray(_bbox) ? _bbox[0] : _bbox;
      _crs = _crs?.replace('EPSG:', '') ?? '';
      _bbox = _bbox?.split(',').map(v => +v) ?? [];
      // 做简单校验
      if (!_crs || !_bbox.length) {
        return null;
      }
      return {
        category: 'geoserver',
        type: 'WMS',
        crs: _crs,
        origin: {
          bbox: _bbox
        }
      };
      // let opts = {
      //   service: 'WFS',
      //   version: _query.version,
      //   request: 'getFeature',
      //   outputFormat: 'application/json',
      // };
      // // 1.1.0之后版本字段名区别
      // opts[versionCompare(_query.version, '1.1.0') === 1 ? 'typeNames' : 'typeName'] = _query.layers;
      // // 2.0.0之后版本字段区别
      // opts[versionCompare(_query.version, '2.0.0') >= 0 ? 'count' : 'maxFeatures'] = 1;
      // // 拼接WFS链接
      // const wfsUrl = _url.origin + _url.pathname.replace('wms', 'wfs') + '?' + querystring.stringify(opts);
      // return getWFSInfo(wfsUrl, 'WMS');
    } else if (_query.service === 'WFS') {
      return getWFSInfo(url, 'WFS');
    } else {
      console.warn(`不支持的geoserver图层类型：${_query.service}`);
    }
  } else if (type === 1) {
    // arcgis
    const _url = new Url(url);
    let _query = querystring.parse(_url.query.substr(1));
    // 瓦片图，如 http://10.10.15.167:6080/arcgis/rest/services/PD_SWAT/Swat_Pipeline/MapServer
    // 动态图层，如 http://10.10.15.167:6080/arcgis/rest/services/PD_SWAT/Swat_Pipeline/MapServer/1
    const isDynamic = /\/\d+$/.test(_url.pathname);

    _query.f = 'json';
    const arcgisUrl = _url.origin + _url.pathname + '?' + querystring.stringify(_query);
    return getArcgisInfo(arcgisUrl, isDynamic);
  } else {
    console.warn(`不支持的图层类型：${type}`);
  }
  return null;
}


