/**
 * leaflet control扩展
 */

/**
 * 回到中心点
 */
L.Control.Center = L.Control.extend({
  options: {
    position: 'topleft',
    centerText: '',
    centerTitle: 'Go center',
  },
  onAdd(map) {
    var centerName = 'leaflet-control-center',
      container = L.DomUtil.create('div', centerName + ' leaflet-bar'),
      options = this.options;

    this._centerButton = this._createButton(options.centerText, options.centerTitle, 'icon-ic_gps_fixed', container, this._center);
    return container;
  },
  _createButton: function (html, title, className, container, fn) {
    var link = L.DomUtil.create('a', className, container);
    link.innerHTML = html;
    link.href = '#';
    link.title = title;
    link.style.fontSize = "20px";

    link.setAttribute('role', 'button');
    link.setAttribute('aria-label', title);

    L.DomEvent.disableClickPropagation(link);
    L.DomEvent.on(link, 'click', L.DomEvent.stop);
    L.DomEvent.on(link, 'click', fn, this);
    L.DomEvent.on(link, 'click', this._refocusOnMap, this);

    return link;
  },
  _center: function (e) {
    if (this._map) {
      this._map.fire('goCenter');
    }
  },
});
L.control.center = function (opts) {
  return new L.Control.Center(opts);
}
