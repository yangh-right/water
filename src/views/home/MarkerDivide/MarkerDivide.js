export var MarkerDivide = (L.MarkerDivide = L.Marker.extend({
  options: L.Icon.prototype.options,

  initialize: function(group, zoneId, a = new L.LatLng(0, 0)) {
    L.Marker.prototype.initialize.call(this, a, {
      icon: this,
      pane: group.options.clusterPane
    });

    this._group = group;
    this._zoneId = zoneId;

    this._markers = [];
    this._childClusters = [];
    this._childCount = 0;
    this._iconNeedsUpdate = true;
    this._latlng = a;
  },

  //Recursively retrieve all child markers of this cluster
  getAllChildMarkers: function(storageArray, ignoreDraggedMarker) {
    storageArray = storageArray || [];

    for (var i = this._childClusters.length - 1; i >= 0; i--) {
      this._childClusters[i].getAllChildMarkers(storageArray, ignoreDraggedMarker);
    }

    for (var j = this._markers.length - 1; j >= 0; j--) {
      if (ignoreDraggedMarker && this._markers[j].__dragStart) {
        continue;
      }
      storageArray.push(this._markers[j]);
    }

    return storageArray;
  },

  //Returns the count of how many child markers we have
  getChildCount: function() {
    return this._childCount;
  },

  _updateIcon: function() {
    this._iconNeedsUpdate = true;
    if (this._icon) {
      this.setIcon(this);
    }
  },

  //Cludge for Icon, we pretend to be an icon for performance
  createIcon: function() {
    if (this._iconNeedsUpdate) {
      this._iconObj = this._group.options.iconCreateFunction(this);
      this._iconNeedsUpdate = false;
    }
    return this._iconObj.createIcon();
  },
  createShadow: function() {
    return this._iconObj.createShadow();
  },
  spiderfy: function() {
    let spiderfyZoom = this._group.options.spiderfyZoom;
    let map = this._group._map;
    let mapZoom = map.getZoom();
    if (spiderfyZoom <= mapZoom) {
      return;
    }
    map.setView(this._latlng, spiderfyZoom);
    let childMarkers = this.getAllChildMarkers(null, true);
    this._group._featureGroup.removeLayer(this);
    for (let i = childMarkers.length - 1; i >= 0; i--) {
      let m = childMarkers[i];

      if (m.clusterShow) {
        m.clusterShow();
      }
    }
  },
  _addChild: function(new1, isNotificationFromChild) {
    this._iconNeedsUpdate = true;

    this._boundsNeedUpdate = true;
    this._setClusterCenter(new1);

    if (new1 instanceof L.MarkerDivide) {
      if (!isNotificationFromChild) {
        this._childClusters.push(new1);
        new1.__parent = this;
      }
      this._childCount += new1._childCount;
    } else {
      if (!isNotificationFromChild) {
        this._markers.push(new1);
      }
      this._childCount++;
    }

    if (this.__parent) {
      this.__parent._addChild(new1, true);
    }
  },
  /**
   * Makes sure the cluster center is set. If not, uses the child center if it is a cluster, or the marker position.
   * @param child L.MarkerCluster|L.Marker that will be used as cluster center if not defined yet.
   * @private
   */
  _setClusterCenter: function(child) {
    if (!this._cLatLng) {
      // when clustering, take position of the first point as the cluster center
      this._cLatLng = child._cLatLng || child._latlng;
    }
  },
  //Returns true if we are the parent of only one cluster and that cluster is the same as us
  _isSingleParent: function() {
    //Don't need to check this._markers as the rest won't work if there are any
    return (
      this._childClusters.length > 0 && this._childClusters[0]._childCount === this._childCount
    );
  }
}));
