/* eslint-disable no-var */
/**
 * @fileoverview 百度地图的轨迹跟随类，对外开放。
 * 用户可以在地图上自定义轨迹运动
 * 可以自定义路过某个点的图片，文字介绍等。
 * 主入口类是<a href="symbols/BMapLib.LuShu.html">LuShu</a>，
 * 基于Baidu Map API 1.2。.
 *
 * @author Baidu Map Api Group
 * @version 1.2
 */

/**
 * @namespace BMap的所有library类均放在BMapLib命名空间下
 */
var BMapLib = (window.BMapLib = BMapLib || {});

(function() {
  // 声明baidu包
  var T;
  var baidu = (T = baidu || { version: '1.5.0' });
  baidu.guid = '$BAIDU$';
  // 以下方法为百度Tangram框架中的方法，请到http://tangram.baidu.com 查看文档
  (function() {
    window[baidu.guid] = window[baidu.guid] || {};
    baidu.dom = baidu.dom || {};
    baidu.dom.g = function(id) {
      if (typeof id === 'string' || id instanceof String) {
        return document.getElementById(id);
      } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
        return id;
      }
      return null;
    };
    baidu.g = baidu.G = baidu.dom.g;
    baidu.lang = baidu.lang || {};
    baidu.lang.isString = function(source) {
      return Object.prototype.toString.call(source) == '[object String]';
    };
    baidu.isString = baidu.lang.isString;
    baidu.dom._g = function(id) {
      if (baidu.lang.isString(id)) {
        return document.getElementById(id);
      }
      return id;
    };
    baidu._g = baidu.dom._g;
    baidu.dom.getDocument = function(element) {
      element = baidu.dom.g(element);
      return element.nodeType == 9 ? element : element.ownerDocument || element.document;
    };
    baidu.browser = baidu.browser || {};
    baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent)
      ? document.documentMode || Number(RegExp['\x241'])
      : undefined;
    baidu.dom.getComputedStyle = function(element, key) {
      element = baidu.dom._g(element);
      var doc = baidu.dom.getDocument(element);
      var styles;
      if (doc.defaultView && doc.defaultView.getComputedStyle) {
        styles = doc.defaultView.getComputedStyle(element, null);
        if (styles) {
          return styles[key] || styles.getPropertyValue(key);
        }
      }
      return '';
    };
    baidu.dom._styleFixer = baidu.dom._styleFixer || {};
    baidu.dom._styleFilter = baidu.dom._styleFilter || [];
    baidu.dom._styleFilter.filter = function(key, value, method) {
      for (var i = 0, filters = baidu.dom._styleFilter, filter; (filter = filters[i]); i++) {
        if ((filter = filter[method])) {
          value = filter(key, value);
        }
      }
      return value;
    };
    baidu.string = baidu.string || {};

    baidu.string.toCamelCase = function(source) {
      if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
        return source;
      }
      return source.replace(/[-_][^-_]/g, function(match) {
        return match.charAt(1).toUpperCase();
      });
    };
    baidu.dom.getStyle = function(element, key) {
      var dom = baidu.dom;
      element = dom.g(element);
      key = baidu.string.toCamelCase(key);

      var value =
        element.style[key] ||
        (element.currentStyle ? element.currentStyle[key] : '') ||
        dom.getComputedStyle(element, key);

      if (!value) {
        var fixer = dom._styleFixer[key];
        if (fixer) {
          value = fixer.get ? fixer.get(element) : baidu.dom.getStyle(element, fixer);
        }
      }

      if ((fixer = dom._styleFilter)) {
        value = fixer.filter(key, value, 'get');
      }
      return value;
    };
    baidu.getStyle = baidu.dom.getStyle;
    baidu.dom._NAME_ATTRS = (function() {
      var result = {
        cellpadding: 'cellPadding',
        cellspacing: 'cellSpacing',
        colspan: 'colSpan',
        rowspan: 'rowSpan',
        valign: 'vAlign',
        usemap: 'useMap',
        frameborder: 'frameBorder'
      };

      if (baidu.browser.ie < 8) {
        result['for'] = 'htmlFor';
        result['class'] = 'className';
      } else {
        result['htmlFor'] = 'for';
        result['className'] = 'class';
      }

      return result;
    })();
    baidu.dom.setAttr = function(element, key, value) {
      element = baidu.dom.g(element);
      if (key == 'style') {
        element.style.cssText = value;
      } else {
        key = baidu.dom._NAME_ATTRS[key] || key;
        element.setAttribute(key, value);
      }
      return element;
    };
    baidu.setAttr = baidu.dom.setAttr;
    baidu.dom.setAttrs = function(element, attributes) {
      element = baidu.dom.g(element);
      for (var key in attributes) {
        baidu.dom.setAttr(element, key, attributes[key]);
      }
      return element;
    };
    baidu.setAttrs = baidu.dom.setAttrs;
    baidu.dom.create = function(tagName, opt_attributes) {
      var el = document.createElement(tagName);
      var attributes = opt_attributes || {};
      return baidu.dom.setAttrs(el, attributes);
    };
    baidu.object = baidu.object || {};
    baidu.extend = baidu.object.extend = function(target, source) {
      for (var p in source) {
        if (source.hasOwnProperty(p)) {
          target[p] = source[p];
        }
      }
      return target;
    };
  })();

  /**
   * @exports LuShu as BMapLib.LuShu
   */
  var LuShu =
    /**
     * LuShu类的构造函数
     * @class LuShu <b>入口</b>。
     * 实例化该类后，可调用,start,end,pause等方法控制覆盖物的运动。

     * @constructor
     * @param {Map} map Baidu map的实例对象.
     * @param {Array} path 构成路线的point的数组.
     * @param {Json Object} opts 可选的输入参数，非必填项。可输入选项包括：<br />
     * {<br />"<b>landmarkPois</b>" : {Array} 要在覆盖物移动过程中，显示的特殊点。格式如下:landmarkPois:[<br />
     *      {lng:116.314782,lat:39.913508,html:'加油站',pauseTime:2},<br />
     *      {lng:116.315391,lat:39.964429,html:'高速公路收费站,pauseTime:3}]<br />
     * <br />"<b>icon</b>" : {Icon} 覆盖物的icon,
     * <br />"<b>speed</b>" : {Number} 覆盖物移动速度，单位米/秒    <br />
     * <br />"<b>defaultContent</b>" : {String} 覆盖物中的内容    <br />
     * }<br />.
     * @example <b>参考示例：</b><br />
     * var lushu = new BMapLib.LuShu(map,arrPois,{defaultContent:"从北京到天津",landmarkPois:[]});
     */
    (BMapLib.LuShu = function(map, path, opts) {
      if (!path || path.length < 1) {
        return;
      }
      this._map = map;
      // 存储一条路线
      this._path = path;
      // 移动到当前点的索引
      this.i = 0;
      // 控制暂停后开始移动的队列的数组
      this._setTimeoutQuene = [];
      // 进行坐标转换的类
      this._projection = this._map.getMapType().getProjection();
      this._opts = {
        icon: null,
        // 默认速度 米/秒
        speed: 4000,
        defaultContent: ''
      };
      this._setOptions(opts);
      this._rotation = 0; // 小车转动的角度

      // 如果不是默认实例，则使用默认的icon
      if (!this._opts.icon instanceof BMap.Icon) {
        this._opts.icon = defaultIcon;
      }
    });
  /**
   * 根据用户输入的opts，修改默认参数_opts
   * @param {Json Object} opts 用户输入的修改参数.
   * @return 无返回值.
   */
  LuShu.prototype._setOptions = function(opts) {
    if (!opts) {
      return;
    }
    for (var p in opts) {
      if (opts.hasOwnProperty(p)) {
        this._opts[p] = opts[p];
      }
    }
  };

  /**
   * @description 开始运动
   * @param none
   * @return 无返回值.
   *
   * @example <b>参考示例：</b><br />
   * lushu.start();
   */
  (LuShu.prototype.start = function() {
    var me = this;
    var len = me._path.length;
    // 不是第一次点击开始,并且小车还没到达终点
    if (me.i && me.i < len - 1) {
      // 没按pause再按start不做处理
      if (!me._fromPause) {
        return;
      } else if (!me._fromStop) {
        // 按了pause按钮,并且再按start，直接移动到下一点
        // 并且此过程中，没有按stop按钮
        // 防止先stop，再pause，然后连续不停的start的异常
        me._moveNext(++me.i);
      }
    } else {
      // 第一次点击开始，或者点了stop之后点开始
      me._addMarker();
      // 等待marker动画完毕再加载infowindow
      me._timeoutFlag = setTimeout(function() {
        me._addInfoWin();
        if (me._opts.defaultContent == '') {
          me.hideInfoWindow();
        }
        me._moveNext(me.i);
      }, 400);
    }
    // 重置状态
    this._fromPause = false;
    this._fromStop = false;
  }),
    /**
     * 结束运动
     * @return 无返回值.
     *
     * @example <b>参考示例：</b><br />
     * lushu.stop();
     */
    (LuShu.prototype.stop = function() {
      this.i = 0;
      this._fromStop = true;
      clearInterval(this._intervalFlag);
      this._clearTimeout();
      // 重置landmark里边的poi为未显示状态
      for (var i = 0, t = this._opts.landmarkPois, len = t.length; i < len; i++) {
        t[i].bShow = false;
      }
    });
  /**
   * 暂停运动
   * @return 无返回值.
   */
  LuShu.prototype.pause = function() {
    clearInterval(this._intervalFlag);

    // 标识是否是按过pause按钮
    this._fromPause = true;
    this._clearTimeout();
  };
  // 清除
  LuShu.prototype.clear = function() {
    this._clearMark();
  };
  /**
   * 隐藏上方overlay
   * @return 无返回值.
   *
   * @example <b>参考示例：</b><br />
   * lushu.hideInfoWindow();
   */
  LuShu.prototype.hideInfoWindow = function() {
    this._overlay._div.style.visibility = 'hidden';
  };
  /**
   * 显示上方overlay
   * @return 无返回值.
   *
   * @example <b>参考示例：</b><br />
   * lushu.showInfoWindow();
   */
  LuShu.prototype.showInfoWindow = function() {
    this._overlay._div.style.visibility = 'visible';
  };
  // Lushu私有方法
  baidu.object.extend(LuShu.prototype, {
    /**
     * 添加marker到地图上
     * @param {Function} 回调函数.
     * @return 无返回值.
     */
    _addMarker: function(callback) {
      if (this._marker) {
        this.stop();
        this._map.removeOverlay(this._marker);
        clearTimeout(this._timeoutFlag);
      }
      // 移除之前的overlay
      this._overlay && this._map.removeOverlay(this._overlay);
      var marker = new BMap.Marker(this._path[0]);
      this._opts.icon && marker.setIcon(this._opts.icon);
      marker.setZIndex(3); // 设置层级
      this._map.addOverlay(marker);
      marker.setAnimation(BMAP_ANIMATION_DROP);
      this._marker = marker;
      this._opts.label &&
        this._setMarkerLabel(this._opts.label, this._opts.labelOption, this._opts.labelStyle);
    },
    _setMarkerLabel: function(content, opts, style) {
      if (this._marker) {
        var label = new BMap.Label(content, opts);

        style && label.setStyle(style);

        this._marker.setLabel(label);
      }
    },
    /**
     * 添加上方overlay
     * @return 无返回值.
     */
    _addInfoWin: function() {
      var me = this;
      // if(me._opts.defaultContent!== ""){
      var overlay = new CustomOverlay(me._marker.getPosition(), me._opts.defaultContent);

      // 将当前类的引用传给overlay。
      overlay.setRelatedClass(this);
      this._overlay = overlay;
      this._map.addOverlay(overlay);

      // }
    },
    /**
     * 获取墨卡托坐标
     * @param {Point} poi 经纬度坐标.
     * @return 无返回值.
     */
    _getMercator: function(poi) {
      return this._map
        .getMapType()
        .getProjection()
        .lngLatToPoint(poi);
    },
    /**
     * 计算两点间的距离
     * @param {Point} poi 经纬度坐标A点.
     * @param {Point} poi 经纬度坐标B点.
     * @return 无返回值.
     */
    _getDistance: function(pxA, pxB) {
      return Math.sqrt(Math.pow(pxA.x - pxB.x, 2) + Math.pow(pxA.y - pxB.y, 2));
    },
    // 目标点的  当前的步长,position,总的步长,动画效果,回调
    /**
     * 移动小车
     * @param {Number} poi 当前的步长.
     * @param {Point} initPos 经纬度坐标初始点.
     * @param {Point} targetPos 经纬度坐标目标点.
     * @param {Function} effect 缓动效果.
     * @return 无返回值.
     */
    _move: function(initPos, targetPos, effect) {
      var me = this;
      // 当前的帧数
      var currentCount = 0;
      // 步长，米/秒
      var timer = 10;
      var step = this._opts.speed / (1000 / timer);
      // 初始坐标
      var init_pos = this._projection.lngLatToPoint(initPos);
      // 获取结束点的(x,y)坐标
      var target_pos = this._projection.lngLatToPoint(targetPos);
      // 总的步长
      var count = Math.round(me._getDistance(init_pos, target_pos) / step);

      // 如果小于1直接移动到下一点
      if (count < 1) {
        me._moveNext(++me.i);
        return;
      }
      // 两点之间匀速移动
      me._intervalFlag = setInterval(function() {
        // 两点之间当前帧数大于总帧数的时候，则说明已经完成移动
        if (currentCount >= count) {
          clearInterval(me._intervalFlag);
          // 移动的点已经超过总的长度
          if (me.i > me._path.length) {
            return;
          }
          // 运行下一个点
          me._moveNext(++me.i);
        } else {
          currentCount++;
          var x = effect(init_pos.x, target_pos.x, currentCount, count);
          var y = effect(init_pos.y, target_pos.y, currentCount, count);
          var pos = me._projection.pointToLngLat(new BMap.Pixel(x, y));
          // 设置marker
          if (currentCount == 1) {
            var proPos = null;
            if (me.i - 1 >= 0) {
              proPos = me._path[me.i - 1];
            }
            if (me._opts.enableRotation == true) {
              me.setRotation(proPos, initPos, targetPos);
            }
            if (me._opts.autoView) {
              if (!me._map.getBounds().containsPoint(pos)) {
                me._map.setCenter(pos);
              }
            }
          }
          // 正在移动

          me._marker.setPosition(pos);
          // 设置自定义overlay的位置
          me._setInfoWin(pos);
        }
      }, timer);
    },
    /**
     *在每个点的真实步骤中设置小车转动的角度
     */
    setRotation: function(prePos, curPos, targetPos) {
      var me = this;
      var deg = 0;
      // start!
      curPos = me._map.pointToPixel(curPos);
      targetPos = me._map.pointToPixel(targetPos);

      if (targetPos.x != curPos.x) {
        var tan = (targetPos.y - curPos.y) / (targetPos.x - curPos.x);
        var atan = Math.atan(tan);
        deg = (atan * 360) / (2 * Math.PI);
        // degree  correction;
        if (targetPos.x < curPos.x) {
          deg = -deg + 90 + 90;
        } else {
          deg = -deg;
        }

        me._marker.setRotation(-deg);
      } else {
        var disy = targetPos.y - curPos.y;
        var bias = 0;
        if (disy > 0) bias = -1;
        else bias = 1;
        me._marker.setRotation(-bias * 90);
      }
      return;
    },

    linePixellength: function(from, to) {
      return Math.sqrt(
        Math.abs(from.x - to.x) * Math.abs(from.x - to.x) +
          Math.abs(from.y - to.y) * Math.abs(from.y - to.y)
      );
    },
    pointToPoint: function(from, to) {
      return (
        Math.abs(from.x - to.x) * Math.abs(from.x - to.x) +
        Math.abs(from.y - to.y) * Math.abs(from.y - to.y)
      );
    },
    /**
     * 移动到下一个点
     * @param {Number} index 当前点的索引.
     * @return 无返回值.
     */
    _moveNext: function(index) {
      var me = this;
      if (index < this._path.length - 1) {
        me._move(me._path[index], me._path[index + 1], me._tween.linear);
      } else {
        me._opts.end && me._opts.end();
      }
    },
    /**
     * 设置小车上方infowindow的内容，位置等
     * @param {Point} pos 经纬度坐标点.
     * @return 无返回值.
     */
    _setInfoWin: function(pos) {
      // 设置上方overlay的position
      var me = this;
      if (!me._overlay) {
        return;
      }
      me._overlay.setPosition(pos, me._marker.getIcon().size);
      var index = me._troughPointIndex(pos);
      if (index != -1) {
        clearInterval(me._intervalFlag);
        me._overlay.setHtml(me._opts.landmarkPois[index].html);
        me._overlay.setPosition(pos, me._marker.getIcon().size);
        me._pauseForView(index);
      } else {
        me._overlay.setHtml(me._opts.defaultContent);
      }
    },
    /**
     * 在某个点暂停的时间
     * @param {Number} index 点的索引.
     * @return 无返回值.
     */
    _pauseForView: function(index) {
      var me = this;
      var t = setTimeout(function() {
        // 运行下一个点
        me._moveNext(++me.i);
      }, me._opts.landmarkPois[index].pauseTime * 1000);
      me._setTimeoutQuene.push(t);
    },
    // 清除暂停后再开始运行的timeout
    _clearTimeout: function() {
      for (var i in this._setTimeoutQuene) {
        clearTimeout(this._setTimeoutQuene[i]);
      }
      this._setTimeoutQuene.length = 0;
    },
    // 缓动效果
    _tween: {
      // 初始坐标，目标坐标，当前的步长，总的步长
      linear: function(initPos, targetPos, currentCount, count) {
        var b = initPos;
        var c = targetPos - initPos;
        var t = currentCount;
        var d = count;
        return (c * t) / d + b;
      }
    },

    /**
     * 否经过某个点的index
     * @param {Point} markerPoi 当前小车的坐标点.
     * @return 无返回值.
     */
    _troughPointIndex: function(markerPoi) {
      var t = this._opts.landmarkPois;
      var distance;
      for (var i = 0, len = t.length; i < len; i++) {
        // landmarkPois中的点没有出现过的话
        if (!t[i].bShow) {
          distance = this._map.getDistance(new BMap.Point(t[i].lng, t[i].lat), markerPoi);
          // 两点距离小于10米，认为是同一个点
          if (distance < 10) {
            t[i].bShow = true;
            return i;
          }
        }
      }
      return -1;
    },

    // 清除浮层
    _clearMark: function(f) {
      this.stop();
      this._map.removeOverlay(this._marker);
      clearTimeout(this._timeoutFlag);
      this._overlay && this._map.removeOverlay(this._overlay);
    }
  });

  /**
   * 自定义的overlay，显示在小车的上方
   * @param {Point} Point 要定位的点.
   * @param {String} html overlay中要显示的东西.
   * @return 无返回值.
   */
  function CustomOverlay(point, html) {
    this._point = point;
    this._html = html;
  }

  CustomOverlay.prototype = new BMap.Overlay();
  CustomOverlay.prototype.initialize = function(map) {
    var div = (this._div = baidu.dom.create('div', {
      style:
        'border:solid 1px #ccc;width:auto;min-width:50px;text-align:center;position:absolute;background:#fff;color:#000;font-size:12px;border-radius: 10px;padding:5px;white-space: nowrap;'
    }));
    div.innerHTML = this._html;
    map.getPanes().floatPane.appendChild(div);
    this._map = map;
    return div;
  };
  CustomOverlay.prototype.draw = function() {
    this.setPosition(this.lushuMain._marker.getPosition(), this.lushuMain._marker.getIcon().size);
  };
  baidu.object.extend(CustomOverlay.prototype, {
    // 设置overlay的position
    setPosition: function(poi, markerSize) {
      // 此处的bug已修复，感谢 苗冬(diligentcat@gmail.com) 的细心查看和认真指出
      var px = this._map.pointToOverlayPixel(poi);
      var styleW = baidu.dom.getStyle(this._div, 'width');
      var styleH = baidu.dom.getStyle(this._div, 'height');
      (overlayW = parseInt(this._div.clientWidth || styleW, 10)),
        (overlayH = parseInt(this._div.clientHeight || styleH, 10));
      this._div.style.left = px.x - overlayW / 2 + 'px';
      this._div.style.bottom = -(px.y - markerSize.height) + 'px';
    },
    // 设置overlay的内容
    setHtml: function(html) {
      this._div.innerHTML = html;
    },
    // 跟customoverlay相关的实例的引用
    setRelatedClass: function(lushuMain) {
      this.lushuMain = lushuMain;
    }
  });
})();

/**
 * @fileoverview 百度地图的自定义信息窗口，对外开放。
 * 用户自定义信息窗口的各种样式。例如：border，margin，padding，color，background等
 * 主入口类是<a href="symbols/BMapLib.InfoBox.html">InfoBox</a>，
 * 基于Baidu Map API 1.2。
 *
 * @author Baidu Map Api Group
 * @version 1.2
 */
/**
 * @namespace BMap的所有library类均放在BMapLib命名空间下
 */
var BMapLib = (window.BMapLib = BMapLib || {});
// 常量，infoBox可以出现的位置，此版本只可实现上下两个方向。
var INFOBOX_AT_TOP = 1;
var INFOBOX_AT_RIGHT = 2;
var INFOBOX_AT_BOTTOM = 3;
var INFOBOX_AT_LEFT = 4;
(function() {
  // 声明baidu包
  var T;
  var baidu = (T = baidu || { version: '1.5.0' });
  baidu.guid = '$BAIDU$';
  // 以下方法为百度Tangram框架中的方法，请到http://tangram.baidu.com 查看文档
  (function() {
    window[baidu.guid] = window[baidu.guid] || {};

    baidu.lang = baidu.lang || {};
    baidu.lang.isString = function(source) {
      return Object.prototype.toString.call(source) == '[object String]';
    };
    baidu.lang.isFunction = function(source) {
      return Object.prototype.toString.call(source) == '[object Function]';
    };
    baidu.lang.Event = function(type, target) {
      this.type = type;
      this.returnValue = true;
      this.target = target || null;
      this.currentTarget = null;
    };

    baidu.object = baidu.object || {};
    baidu.extend = baidu.object.extend = function(target, source) {
      for (var p in source) {
        if (source.hasOwnProperty(p)) {
          target[p] = source[p];
        }
      }

      return target;
    };
    baidu.event = baidu.event || {};
    baidu.event._listeners = baidu.event._listeners || [];
    baidu.dom = baidu.dom || {};

    baidu.dom._g = function(id) {
      if (baidu.lang.isString(id)) {
        return document.getElementById(id);
      }
      return id;
    };
    baidu._g = baidu.dom._g;
    baidu.event.on = function(element, type, listener) {
      type = type.replace(/^on/i, '');
      element = baidu.dom._g(element);
      var realListener = function(ev) {
        // 1. 这里不支持EventArgument,  原因是跨frame的事件挂载
        // 2. element是为了修正this
        listener.call(element, ev);
      };
      var lis = baidu.event._listeners;
      var filter = baidu.event._eventFilter;
      var afterFilter;
      var realType = type;
      type = type.toLowerCase();
      // filter过滤
      if (filter && filter[type]) {
        afterFilter = filter[type](element, type, realListener);
        realType = afterFilter.type;
        realListener = afterFilter.listener;
      }

      // 事件监听器挂载
      if (element.addEventListener) {
        element.addEventListener(realType, realListener, false);
      } else if (element.attachEvent) {
        element.attachEvent('on' + realType, realListener);
      }
      // 将监听器存储到数组中
      lis[lis.length] = [element, type, listener, realListener, realType];
      return element;
    };

    baidu.on = baidu.event.on;
    baidu.event.un = function(element, type, listener) {
      element = baidu.dom._g(element);
      type = type.replace(/^on/i, '').toLowerCase();

      var lis = baidu.event._listeners;
      var len = lis.length;
      var isRemoveAll = !listener;
      var item;
      var realType;
      var realListener;
      while (len--) {
        item = lis[len];

        if (item[1] === type && item[0] === element && (isRemoveAll || item[2] === listener)) {
          realType = item[4];
          realListener = item[3];
          if (element.removeEventListener) {
            element.removeEventListener(realType, realListener, false);
          } else if (element.detachEvent) {
            element.detachEvent('on' + realType, realListener);
          }
          lis.splice(len, 1);
        }
      }

      return element;
    };
    baidu.un = baidu.event.un;
    baidu.dom.g = function(id) {
      if (typeof id === 'string' || id instanceof String) {
        return document.getElementById(id);
      } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
        return id;
      }
      return null;
    };
    baidu.g = baidu.G = baidu.dom.g;
    baidu.dom._styleFixer = baidu.dom._styleFixer || {};
    baidu.dom._styleFilter = baidu.dom._styleFilter || [];
    baidu.dom._styleFilter.filter = function(key, value, method) {
      for (var i = 0, filters = baidu.dom._styleFilter, filter; (filter = filters[i]); i++) {
        if ((filter = filter[method])) {
          value = filter(key, value);
        }
      }
      return value;
    };
    baidu.string = baidu.string || {};

    baidu.string.toCamelCase = function(source) {
      // 提前判断，提高getStyle等的效率 thanks xianwei
      if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
        return source;
      }
      return source.replace(/[-_][^-_]/g, function(match) {
        return match.charAt(1).toUpperCase();
      });
    };

    baidu.dom.setStyle = function(element, key, value) {
      var dom = baidu.dom;
      var fixer;

      // 放弃了对firefox 0.9的opacity的支持
      element = dom.g(element);
      key = baidu.string.toCamelCase(key);

      if ((fixer = dom._styleFilter)) {
        value = fixer.filter(key, value, 'set');
      }

      fixer = dom._styleFixer[key];
      fixer && fixer.set ? fixer.set(element, value) : (element.style[fixer || key] = value);

      return element;
    };

    baidu.setStyle = baidu.dom.setStyle;

    baidu.dom.setStyles = function(element, styles) {
      element = baidu.dom.g(element);
      for (var key in styles) {
        baidu.dom.setStyle(element, key, styles[key]);
      }
      return element;
    };
    baidu.setStyles = baidu.dom.setStyles;
    baidu.browser = baidu.browser || {};
    baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent)
      ? document.documentMode || Number(RegExp['\x241'])
      : undefined;
    baidu.dom._NAME_ATTRS = (function() {
      var result = {
        cellpadding: 'cellPadding',
        cellspacing: 'cellSpacing',
        colspan: 'colSpan',
        rowspan: 'rowSpan',
        valign: 'vAlign',
        usemap: 'useMap',
        frameborder: 'frameBorder'
      };

      if (baidu.browser.ie < 8) {
        result['for'] = 'htmlFor';
        result['class'] = 'className';
      } else {
        result['htmlFor'] = 'for';
        result['className'] = 'class';
      }

      return result;
    })();
    baidu.dom.setAttr = function(element, key, value) {
      element = baidu.dom.g(element);
      if (key == 'style') {
        element.style.cssText = value;
      } else {
        key = baidu.dom._NAME_ATTRS[key] || key;
        element.setAttribute(key, value);
      }
      return element;
    };
    baidu.setAttr = baidu.dom.setAttr;
    baidu.dom.setAttrs = function(element, attributes) {
      element = baidu.dom.g(element);
      for (var key in attributes) {
        baidu.dom.setAttr(element, key, attributes[key]);
      }
      return element;
    };
    baidu.setAttrs = baidu.dom.setAttrs;
    baidu.dom.create = function(tagName, opt_attributes) {
      var el = document.createElement(tagName);
      var attributes = opt_attributes || {};
      return baidu.dom.setAttrs(el, attributes);
    };
    T.undope = true;
  })();

  /**
   * @exports InfoBox as BMapLib.InfoBox
   */

  var InfoBox =
    /**
     * InfoBox类的构造函数
     * @class InfoBox <b>入口</b>。
     * 可以自定义border,margin,padding,关闭按钮等等。
     * @constructor
         * @param {Map} map Baidu map的实例对象.
         * @param {String} content infoBox中的内容.
         * @param {Json Object} opts 可选的输入参数，非必填项。可输入选项包括：<br />
         * {<br />"<b>offset</b>" : {Size} infoBox的偏移量
         * <br />"<b>boxClass</b>" : {String} 定义infoBox的class,
         * <br />"<b>boxStyle</b>" : {Json} 定义infoBox的style,此项会覆盖boxClass<br />
         * <br />"<b>closeIconMargin</b>" : {String} 关闭按钮的margin    <br />
         * <br />"<b>closeIconUrl</b>" : {String} 关闭按钮的url地址    <br />
         * <br />"<b>enableAutoPan</b>" : {Boolean} 是否启动自动平移功能    <br />
         * <br />"<b>align</b>" : {Number} 基于哪个位置进行定位，取值为[INFOBOX_AT_TOP,INFOBOX_AT_BOTTOM]<br />
         * }<br />.
         * @example <b>参考示例：</b><br />
         * var infoBox = new BMapLib.InfoBox(map,"百度地图api",{boxStyle:{background:"url('tipbox.gif') no-repeat
          center top",width: "200px"},closeIconMargin: "10px 2px 0 0",enableAutoPan: true
          ,alignBottom: false});
     */
    (BMapLib.InfoBox = function(map, content, opts) {
      this._content = content || '';
      this._isOpen = false;
      this._map = map;

      this._opts = opts = opts || {};
      this._opts.offset = opts.offset || new BMap.Size(0, 0);
      this._opts.boxClass = opts.boxClass || 'infoBox';
      this._opts.boxStyle = opts.boxStyle || {};
      this._opts.closeIconMargin = opts.closeIconMargin || '2px';
      this._opts.closeIconUrl = opts.closeIconUrl || 'close.png';
      this._opts.enableAutoPan = opts.enableAutoPan ? true : false;
      this._opts.align = opts.align || INFOBOX_AT_TOP;
    });
  InfoBox.prototype = new BMap.Overlay();
  InfoBox.prototype.initialize = function(map) {
    var me = this;
    var div = (this._div = baidu.dom.create('div', { class: this._opts.boxClass }));
    baidu.dom.setStyles(div, this._opts.boxStyle);
    // 设置position为absolute，用于定位
    div.style.position = 'absolute';
    this._setContent(this._content);

    var floatPane = map.getPanes().floatPane;
    floatPane.style.width = 'auto';
    floatPane.appendChild(div);
    // 设置完内容后，获取div的宽度,高度
    this._getInfoBoxSize();
    // this._boxWidth = parseInt(this._div.offsetWidth,10);
    // this._boxHeight = parseInt(this._div.offsetHeight,10);
    // 阻止各种冒泡事件
    baidu.event.on(div, 'onmousedown', function(e) {
      me._stopBubble(e);
    });
    baidu.event.on(div, 'onmouseover', function(e) {
      me._stopBubble(e);
    });
    baidu.event.on(div, 'click', function(e) {
      me._stopBubble(e);
    });
    baidu.event.on(div, 'dblclick', function(e) {
      me._stopBubble(e);
    });
    return div;
  };
  InfoBox.prototype.draw = function() {
    this._isOpen && this._adjustPosition(this._point);
  };
  /**
   * 打开infoBox
   * @param {Marker|Point} anchor 要在哪个marker或者point上打开infobox
   * @return none
   *
   * @example <b>参考示例：</b><br />
   * infoBox.open();
   */
  InfoBox.prototype.open = function(anchor) {
    var me = this;
    var poi;
    if (!this._isOpen) {
      this._map.addOverlay(this);
      this._isOpen = true;
      // 延迟10ms派发open事件，使后绑定的事件可以触发。
      setTimeout(function() {
        me._dispatchEvent(me, 'open', { point: me._point });
      }, 10);
    }
    if (anchor instanceof BMap.Point) {
      poi = anchor;
      // 清除之前存在的marker事件绑定，如果存在的话
      this._removeMarkerEvt();
    } else if (anchor instanceof BMap.Marker) {
      // 如果当前marker不为空，说明是第二个marker，或者第二次点open按钮,先移除掉之前绑定的事件
      if (this._marker) {
        this._removeMarkerEvt();
      }
      poi = anchor.getPosition();
      this._marker = anchor;
      !this._markerDragend &&
        this._marker.addEventListener(
          'dragend',
          (this._markerDragend = function(e) {
            me._point = e.point;
            me._adjustPosition(me._point);
            me._panBox();
            me.show();
          })
        );
      // 给marker绑定dragging事件，拖动marker的时候，infoBox也跟随移动
      !this._markerDragging &&
        this._marker.addEventListener(
          'dragging',
          (this._markerDragging = function() {
            me.hide();
            me._point = me._marker.getPosition();
            me._adjustPosition(me._point);
          })
        );
    }
    // 打开的时候，将infowindow显示
    this.show();
    this._point = poi;
    this._panBox();
    this._adjustPosition(this._point);
  };
  /**
   * 关闭infoBox
   * @return none
   *
   * @example <b>参考示例：</b><br />
   * infoBox.close();
   */
  InfoBox.prototype.close = function() {
    if (this._isOpen) {
      this._map.removeOverlay(this);
      this._remove();
      this._isOpen = false;
      this._dispatchEvent(this, 'close', { point: this._point });
    }
  };

  /**
   * 打开infoBox时，派发事件的接口
   * @name InfoBox#Open
   * @event
   * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
   * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
   * <br />"<b>type</b>：{String} 事件类型,
   * <br />"<b>point</b>：{Point} infoBox的打开位置}
   *
   * @example <b>参考示例：</b>
   * infoBox.addEventListener("open", function(e) {
   *     alert(e.type);
   * });
   */
  /**
   * 关闭infoBox时，派发事件的接口
   * @name InfoBox#Close
   * @event
   * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
   * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
   * <br />"<b>type</b>：{String} 事件类型,
   * <br />"<b>point</b>：{Point} infoBox的关闭位置}
   *
   * @example <b>参考示例：</b>
   * infoBox.addEventListener("close", function(e) {
   *     alert(e.type);
   * });
   */
  /**
   * 启用自动平移
   * @return none
   *
   * @example <b>参考示例：</b><br />
   * infoBox.enableAutoPan();
   */
  InfoBox.prototype.enableAutoPan = function() {
    this._opts.enableAutoPan = true;
  };
  /**
   * 禁用自动平移
   * @return none
   *
   * @example <b>参考示例：</b><br />
   * infoBox.disableAutoPan();
   */
  InfoBox.prototype.disableAutoPan = function() {
    this._opts.enableAutoPan = false;
  };
  /**
   * 设置infoBox的内容
   * @param {String|HTMLElement} content 弹出气泡中的内容
   * @return none
   *
   * @example <b>参考示例：</b><br />
   * infoBox.setContent("百度地图API");
   */
  InfoBox.prototype.setContent = function(content) {
    this._setContent(content);
    this._getInfoBoxSize();
    this._adjustPosition(this._point);
  };
  /**
   * 设置信息窗的地理位置
   * @param {Point} point 设置position
   * @return none
   *
   * @example <b>参考示例：</b><br />
   * infoBox.setPosition(new BMap.Point(116.35,39.911));
   */
  InfoBox.prototype.setPosition = function(poi) {
    this._point = poi;
    this._adjustPosition(poi);
    this._removeMarkerEvt();
  };
  /**
   * 获得信息窗的地理位置
   * @param none
   * @return {Point} 信息窗的地理坐标
   *
   * @example <b>参考示例：</b><br />
   * infoBox.getPosition();
   */
  InfoBox.prototype.getPosition = function() {
    return this._point;
  };
  /**
   * 返回信息窗口的箭头距离信息窗口在地图
   * 上所锚定的地理坐标点的像素偏移量。
   * @return {Size} Size
   *
   * @example <b>参考示例：</b><br />
   * infoBox.getOffset();
   */
  (InfoBox.prototype.getOffset = function() {
    return this._opts.offset;
  }),
    /**
     *@ignore
     * 删除overlay，调用Map.removeOverlay时将调用此方法，
     * 将移除覆盖物的容器元素
     */
    (InfoBox.prototype._remove = function() {
      var me = this;
      if (this.domElement && this.domElement.parentNode) {
        // 防止内存泄露
        baidu.event.un(this._div.firstChild, 'click', me._closeHandler());
        this.domElement.parentNode.removeChild(this.domElement);
      }
      this.domElement = null;
      this._isOpen = false;
      this.dispatchEvent('onremove');
    }),
    baidu.object.extend(InfoBox.prototype, {
      /**
       * 获取关闭按钮的html
       * @return IMG 关闭按钮的HTML代码
       */
      _getCloseIcon: function() {
        return '<i class="icon-ic_clear"></i>';
        // var img =
        //   "<img src='" +
        //   this._opts.closeIconUrl +
        //   "' align='right' style='position:absolute;right:0px;cursor:pointer;margin:" +
        //   this._opts.closeIconMargin +
        //   "'/>";
        // return img;
      },
      /**
       * 设置infoBox的内容
       * @param {String|HTMLElement} content 弹出气泡中的内容
       * @return none
       *
       * @example <b>参考示例：</b><br />
       * infoBox.setContent("百度地图API");
       */
      _setContent: function(content) {
        if (!this._div) {
          return;
        }
        var closeHtml = this._getCloseIcon();
        // string类型的content
        if (typeof content.nodeType === 'undefined') {
          this._div.innerHTML = closeHtml + content;
        } else {
          this._div.innerHTML = closeHtml;
          this._div.appendChild(content);
        }
        this._content = content;
        // 添加click关闭infobox事件
        this._addEventToClose();
      },
      /**
       * 调整infobox的position
       * @return none
       */
      _adjustPosition: function(poi) {
        var pixel = this._getPointPosition(poi);
        var icon = this._marker && this._marker.getIcon();
        switch (this._opts.align) {
          case INFOBOX_AT_TOP:
            if (this._marker) {
              this._div.style.bottom =
                -(
                  pixel.y -
                  this._opts.offset.height -
                  icon.anchor.height +
                  icon.infoWindowAnchor.height
                ) -
                this._marker.getOffset().height +
                2 +
                'px';
            } else {
              this._div.style.bottom = -(pixel.y - this._opts.offset.height) + 'px';
            }
            break;
          case INFOBOX_AT_BOTTOM:
            if (this._marker) {
              this._div.style.top =
                pixel.y +
                this._opts.offset.height -
                icon.anchor.height +
                icon.infoWindowAnchor.height +
                this._marker.getOffset().height +
                'px';
            } else {
              this._div.style.top = pixel.y + this._opts.offset.height + 'px';
            }
            break;
        }

        if (this._marker) {
          this._div.style.left =
            pixel.x -
            icon.anchor.width +
            this._marker.getOffset().width +
            icon.infoWindowAnchor.width -
            this._boxWidth / 2 +
            'px';
        } else {
          this._div.style.left = pixel.x - this._boxWidth / 2 + 'px';
        }
      },
      /**
       * 得到infobox的position
       * @return Point  infobox当前的position
       */
      _getPointPosition: function(poi) {
        this._pointPosition = this._map.pointToOverlayPixel(poi);
        return this._pointPosition;
      },
      /**
       * 得到infobox的高度跟宽度
       * @return none
       */
      _getInfoBoxSize: function() {
        this._boxWidth = parseInt(this._div.offsetWidth, 10);
        this._boxHeight = parseInt(this._div.offsetHeight, 10);
      },
      /**
       * 添加关闭事件
       * @return none
       */
      _addEventToClose: function() {
        var me = this;
        baidu.event.on(this._div.firstChild, 'click', me._closeHandler());
        this._hasBindEventClose = true;
      },
      /**
       * 处理关闭事件
       * @return none
       */
      _closeHandler: function() {
        var me = this;
        return function(e) {
          me.close();
        };
      },
      /**
       * 阻止事件冒泡
       * @return none
       */
      _stopBubble: function(e) {
        if (e && e.stopPropagation) {
          e.stopPropagation();
        } else {
          window.event.cancelBubble = true;
        }
      },
      /**
       * 自动平移infobox，使其在视野中全部显示
       * @return none
       */
      _panBox: function() {
        if (!this._opts.enableAutoPan) {
          return;
        }
        var mapH = parseInt(this._map.getContainer().offsetHeight, 10);
        var mapW = parseInt(this._map.getContainer().offsetWidth, 10);
        var boxH = this._boxHeight;
        var boxW = this._boxWidth;
        // infobox窗口本身的宽度或者高度超过map container
        if (boxH >= mapH || boxW >= mapW) {
          return;
        }
        // 如果point不在可视区域内
        if (!this._map.getBounds().containsPoint(this._point)) {
          this._map.setCenter(this._point);
        }
        var anchorPos = this._map.pointToPixel(this._point);
        var panTop;
        var panBottom;
        var panY;
        // 左侧超出
        var panLeft = boxW / 2 - anchorPos.x;
        // 右侧超出
        var panRight = boxW / 2 + anchorPos.x - mapW;
        if (this._marker) {
          var icon = this._marker.getIcon();
        }
        // 基于bottom定位，也就是infoBox在上方的情况
        switch (this._opts.align) {
          case INFOBOX_AT_TOP:
            // 上侧超出
            var h = this._marker
              ? icon.anchor.height + this._marker.getOffset().height - icon.infoWindowAnchor.height
              : 0;
            panTop = boxH - anchorPos.y + this._opts.offset.height + h + 2;
            break;
          case INFOBOX_AT_BOTTOM:
            // 下侧超出
            var h = this._marker
              ? -icon.anchor.height +
                icon.infoWindowAnchor.height +
                this._marker.getOffset().height +
                this._opts.offset.height
              : 0;
            panBottom = boxH + anchorPos.y - mapH + h + 4;
            break;
        }

        panX = panLeft > 0 ? panLeft : panRight > 0 ? -panRight : 0;
        panY = panTop > 0 ? panTop : panBottom > 0 ? -panBottom : 0;
        this._map.panBy(panX, panY);
      },
      _removeMarkerEvt: function() {
        this._markerDragend && this._marker.removeEventListener('dragend', this._markerDragend);
        this._markerDragging && this._marker.removeEventListener('dragging', this._markerDragging);
        this._markerDragend = this._markerDragging = null;
      },
      /**
       * 集中派发事件函数
       *
       * @private
       * @param {Object} instance 派发事件的实例
       * @param {String} type 派发的事件名
       * @param {Json} opts 派发事件里添加的参数，可选
       */
      _dispatchEvent: function(instance, type, opts) {
        type.indexOf('on') != 0 && (type = 'on' + type);
        var event = new baidu.lang.Event(type);
        if (opts) {
          for (var p in opts) {
            event[p] = opts[p];
          }
        }
        instance.dispatchEvent(event);
      }
    });
})();
