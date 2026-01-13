/*
 * L.MarkerDivideGroup extends L.FeatureGroup by clustering the markers contained within
 */

export var MarkerDivideGroup = (L.MarkerDivideGroup = L.FeatureGroup.extend({
  options: {
    iconCreateFunction: null,
    clusterPane: L.Marker.prototype.options.pane,

    spiderfyOnEveryZoom: false,
    spiderfyOnMaxZoom: true,
    spiderfyZoom: 12,
    zoomToBoundsOnClick: true,

    // Setting this to false prevents the removal of any clusters outside of the viewpoint, which
    // is the default behaviour for performance reasons.
    removeOutsideVisibleBounds: true,

    // Set to false to disable all animations (zoom and spiderfy).
    // If false, option animateAddingMarkers below has no effect.
    // If L.DomUtil.TRANSITION is falsy, this option has no effect.
    animate: true,

    // Make it possible to provide custom function to calculate spiderfy shape positions
    spiderfyShapePositions: null,

    //Increase to increase the distance away that spiderfied markers appear from the center
    spiderfyDistanceMultiplier: 1,

    // Make it possible to specify a polyline options on a spider leg
    spiderLegPolylineOptions: { weight: 1.5, color: '#222', opacity: 0.5 },

    // When bulk adding layers, adds markers in chunks. Means addLayers may not add all the layers in the call, others will be loaded during setTimeouts
    chunkedLoading: false,
    chunkInterval: 200, // process markers for a maximum of ~ n milliseconds (then trigger the chunkProgress callback)
    chunkDelay: 50, // at the end of each interval, give n milliseconds back to system/browser
    chunkProgress: null, // progress callback: function(processed, total, elapsed) (e.g. for a progress indicator)

    //Options to pass to the L.Polygon constructor
    polygonOptions: {}
  },

  initialize: function(options) {
    L.Util.setOptions(this, options);
    if (!this.options.iconCreateFunction) {
      this.options.iconCreateFunction = this._defaultIconCreateFunction;
    }

    this._featureGroup = L.featureGroup();
    this._featureGroup.addEventParent(this);

    this._inZoomAnimation = 0;
    this._needsClustering = [];
    this._needsRemoving = []; //Markers removed while we aren't on the map need to be kept track of

    this._queue = [];

    // Hook the appropriate animation methods.
    var animate = L.DomUtil.TRANSITION && this.options.animate;
    // Remember which MarkerDivide class to instantiate (animated or not).
    this._markerCluster = animate ? L.MarkerDivide : L.MarkerClusterNonAnimated;
  },

  addLayer: function(layer) {
    if (layer instanceof L.LayerGroup) {
      return this.addLayers([layer]);
    }

    if (!this._map) {
      this._needsClustering.push(layer);
      this.fire('layeradd', { layer: layer });
      return this;
    }

    if (this.hasLayer(layer)) {
      return this;
    }
    //If we have already clustered we'll need to add this one to a cluster

    if (this._unspiderfy) {
      this._unspiderfy();
    }

    this._addLayer(layer);
    this.fire('layeradd', { layer: layer });
    this._refreshClustersIcons();
    return this;
  },

  removeLayer: function(layer) {
    if (layer instanceof L.LayerGroup) {
      return this.removeLayers([layer]);
    }

    if (!this._map) {
      if (!this._arraySplice(this._needsClustering, layer) && this.hasLayer(layer)) {
        this._needsRemoving.push({ layer: layer, latlng: layer._latlng });
      }
      this.fire('layerremove', { layer: layer });
      return this;
    }

    if (!layer.__parent) {
      return this;
    }

    if (this._unspiderfy) {
      this._unspiderfy();
      this._unspiderfyLayer(layer);
    }

    //Remove the marker from clusters
    this._removeLayer(layer);
    this.fire('layerremove', { layer: layer });

    this._refreshClustersIcons();

    if (this._featureGroup.hasLayer(layer)) {
      this._featureGroup.removeLayer(layer);
      if (layer.clusterShow) {
        layer.clusterShow();
      }
    }

    return this;
  },

  //Takes an array of markers and adds them in bulk
  addLayers: function(layersArray, skipLayerAddEvent) {
    if (!L.Util.isArray(layersArray)) {
      return this.addLayer(layersArray);
    }

    var fg = this._featureGroup,
      chunked = this.options.chunkedLoading,
      chunkInterval = this.options.chunkInterval,
      chunkProgress = this.options.chunkProgress,
      l = layersArray.length,
      offset = 0,
      originalArray = true,
      m;
    if (this._map) {
      var started = new Date().getTime();
      var process = L.bind(function() {
        var start = new Date().getTime();

        for (; offset < l; offset++) {
          if (chunked && offset % 200 === 0) {
            // every couple hundred markers, instrument the time elapsed since processing started:
            var elapsed = new Date().getTime() - start;
            if (elapsed > chunkInterval) {
              break; // been working too hard, time to take a break :-)
            }
          }

          m = layersArray[offset];

          // Group of layers, append children to layersArray and skip.
          // Side effects:
          // - Total increases, so chunkProgress ratio jumps backward.
          // - Groups are not included in this group, only their non-group child layers (hasLayer).
          // Changing array length while looping does not affect performance in current browsers:
          // http://jsperf.com/for-loop-changing-length/6
          if (m instanceof L.LayerGroup) {
            if (originalArray) {
              layersArray = layersArray.slice();
              originalArray = false;
            }
            this._extractNonGroupLayers(m, layersArray);
            l = layersArray.length;
            continue;
          }
          if (this.hasLayer(m)) {
            continue;
          }
          this._addLayer(m);
          if (!skipLayerAddEvent) {
            this.fire('layeradd', { layer: m });
          }

          //If we just made a cluster of size 2 then we need to remove the other marker from the map (if it is) or we never will
          if (m.__parent) {
            if (m.__parent.getChildCount() === 2) {
              var markers = m.__parent.getAllChildMarkers(),
                otherMarker = markers[0] === m ? markers[1] : markers[0];
              fg.removeLayer(otherMarker);
            }
          }
        }

        if (chunkProgress) {
          // report progress and time elapsed:
          chunkProgress(offset, l, new Date().getTime() - started);
        }

        // Completed processing all markers.
        if (offset === l) {
          this._refreshClustersIcons();
        } else {
          setTimeout(process, this.options.chunkDelay);
        }
      }, this);

      process();
    } else {
      var needsClustering = this._needsClustering;

      for (; offset < l; offset++) {
        m = layersArray[offset];

        // Group of layers, append children to layersArray and skip.
        if (m instanceof L.LayerGroup) {
          if (originalArray) {
            layersArray = layersArray.slice();
            originalArray = false;
          }
          this._extractNonGroupLayers(m, layersArray);
          l = layersArray.length;
          continue;
        }

        if (this.hasLayer(m)) {
          continue;
        }

        needsClustering.push(m);
      }
    }
    this._zoomEnd();
    return this;
  },

  //Takes an array of markers and removes them in bulk
  removeLayers: function(layersArray) {
    var i,
      m,
      l = layersArray.length,
      fg = this._featureGroup,
      originalArray = true;

    if (!this._map) {
      for (i = 0; i < l; i++) {
        m = layersArray[i];

        // Group of layers, append children to layersArray and skip.
        if (m instanceof L.LayerGroup) {
          if (originalArray) {
            layersArray = layersArray.slice();
            originalArray = false;
          }
          this._extractNonGroupLayers(m, layersArray);
          l = layersArray.length;
          continue;
        }

        this._arraySplice(this._needsClustering, m);
        if (this.hasLayer(m)) {
          this._needsRemoving.push({ layer: m, latlng: m._latlng });
        }
        this.fire('layerremove', { layer: m });
      }
      return this;
    }

    if (this._unspiderfy) {
      this._unspiderfy();

      // Work on a copy of the array, so that next loop is not affected.
      var layersArray2 = layersArray.slice(),
        l2 = l;
      for (i = 0; i < l2; i++) {
        m = layersArray2[i];

        // Group of layers, append children to layersArray and skip.
        if (m instanceof L.LayerGroup) {
          this._extractNonGroupLayers(m, layersArray2);
          l2 = layersArray2.length;
          continue;
        }

        this._unspiderfyLayer(m);
      }
    }

    for (i = 0; i < l; i++) {
      m = layersArray[i];

      // Group of layers, append children to layersArray and skip.
      if (m instanceof L.LayerGroup) {
        if (originalArray) {
          layersArray = layersArray.slice();
          originalArray = false;
        }
        this._extractNonGroupLayers(m, layersArray);
        l = layersArray.length;
        continue;
      }

      if (!m.__parent) {
        this.fire('layerremove', { layer: m });
        continue;
      }

      this._removeLayer(m);
      this.fire('layerremove', { layer: m });

      if (fg.hasLayer(m)) {
        fg.removeLayer(m);
        if (m.clusterShow) {
          m.clusterShow();
        }
      }
    }

    this._refreshClustersIcons();
    return this;
  },

  //Removes all layers from the MarkerDivideGroup
  clearLayers: function() {
    //Need our own special implementation as the LayerGroup one doesn't work for us

    //If we aren't on the map (yet), blow away the markers we know of
    if (!this._map) {
      this._needsClustering = [];
      this._needsRemoving = [];
      delete this._gridClusters;
    }

    if (this._noanimationUnspiderfy) {
      this._noanimationUnspiderfy();
    }

    //Remove all the visible layers
    this._featureGroup.clearLayers();

    this.eachLayer(function(marker) {
      delete marker.__parent;
    }, this);

    if (this._map) {
      this._generateInitialClusters();
    }

    return this;
  },

  //Overrides LayerGroup.eachLayer
  eachLayer: function(method, context) {
    var markers = this._needsClustering.slice(),
      needsRemoving = this._needsRemoving,
      thisNeedsRemoving,
      i,
      j;
    for (i = markers.length - 1; i >= 0; i--) {
      thisNeedsRemoving = true;

      for (j = needsRemoving.length - 1; j >= 0; j--) {
        if (needsRemoving[j].layer === markers[i]) {
          thisNeedsRemoving = false;
          break;
        }
      }

      if (thisNeedsRemoving) {
        method.call(context, markers[i]);
      }
    }
  },

  //Overrides LayerGroup.getLayers
  getLayers: function() {
    var layers = [];
    this.eachLayer(function(l) {
      layers.push(l);
    });
    return layers;
  },

  //Overrides LayerGroup.getLayer, WARNING: Really bad performance
  getLayer: function(id) {
    var result = null;

    id = parseInt(id, 10);

    this.eachLayer(function(l) {
      if (L.stamp(l) === id) {
        result = l;
      }
    });

    return result;
  },

  //Returns true if the given layer is in this MarkerDivideGroup
  hasLayer: function(layer) {
    if (!layer) {
      return false;
    }

    var i,
      anArray = this._needsClustering;

    for (i = anArray.length - 1; i >= 0; i--) {
      if (anArray[i] === layer) {
        return true;
      }
    }

    anArray = this._needsRemoving;
    for (i = anArray.length - 1; i >= 0; i--) {
      if (anArray[i].layer === layer) {
        return false;
      }
    }

    return !!(layer.__parent && layer.__parent._group === this);
  },

  //Overrides FeatureGroup.onAdd
  onAdd: function(map) {
    this._map = map;
    var i, l, layer;

    if (!isFinite(this._map.getMaxZoom())) {
      throw 'Map has no maxZoom specified';
    }

    this._featureGroup.addTo(map);

    if (!this._gridClusters) {
      this._generateInitialClusters();
    }

    this._maxLat = map.options.crs.projection.MAX_LATITUDE;

    //Restore all the positions as they are in the MCG before removing them
    for (i = 0, l = this._needsRemoving.length; i < l; i++) {
      layer = this._needsRemoving[i];
      layer.newlatlng = layer.layer._latlng;
      layer.layer._latlng = layer.latlng;
    }
    //Remove them, then restore their new positions
    for (i = 0, l = this._needsRemoving.length; i < l; i++) {
      layer = this._needsRemoving[i];
      this._removeLayer(layer.layer);
      layer.layer._latlng = layer.newlatlng;
    }
    this._needsRemoving = [];

    //Remember the current zoom level and bounds
    this._zoom = Math.round(this._map._zoom);

    this._map.on('zoomend', this._zoomEnd, this);

    this._bindEvents();

    //Actually add our markers to the map:
    l = this._needsClustering;
    this._needsClustering = [];
    this.addLayers(l, true);
  },

  //Overrides FeatureGroup.onRemove
  onRemove: function(map) {
    map.off('zoomend', this._zoomEnd, this);

    this._unbindEvents();

    //In case we are in a cluster animation
    this._map._mapPane.className = this._map._mapPane.className.replace(
      ' leaflet-cluster-anim',
      ''
    );

    delete this._maxLat;

    this._featureGroup.remove();

    this._featureGroup.clearLayers();

    this._map = null;
  },

  //Remove the given object from the given array
  _arraySplice: function(anArray, obj) {
    for (var i = anArray.length - 1; i >= 0; i--) {
      if (anArray[i] === obj) {
        anArray.splice(i, 1);
        return true;
      }
    }
  },

  //Internal function for removing a marker from everything.
  //dontUpdateMap: set to true if you will handle updating the map manually (for bulk functions)
  _removeLayer: function(marker) {
    var gridClusters = this._gridClusters,
      fg = this._featureGroup,
      map = this._map,
      minZoom = Math.floor(this._map.getMinZoom());

    //Work our way up the clusters removing them as we go if required
    var cluster = marker.__parent,
      markers = cluster._markers,
      otherMarker;

    //Remove the marker from the immediate parents marker list
    this._arraySplice(markers, marker);

    while (cluster) {
      cluster._childCount--;
      cluster._boundsNeedUpdate = true;

      if (cluster._zoom < minZoom) {
        //Top level, do nothing
        break;
      } else {
        cluster._iconNeedsUpdate = true;
      }

      cluster = cluster.__parent;
    }

    delete marker.__parent;
  },

  _isOrIsParent: function(el, oel) {
    while (oel) {
      if (el === oel) {
        return true;
      }
      oel = oel.parentNode;
    }
    return false;
  },

  //Override L.Evented.fire
  fire: function(type, data, propagate) {
    if (data && data.layer instanceof L.MarkerDivide) {
      //Prevent multiple clustermouseover/off events if the icon is made up of stacked divs (Doesn't work in ie <= 8, no relatedTarget)
      if (
        data.originalEvent &&
        this._isOrIsParent(data.layer._icon, data.originalEvent.relatedTarget)
      ) {
        return;
      }
      type = 'cluster' + type;
    }

    L.FeatureGroup.prototype.fire.call(this, type, data, propagate);
  },

  //Override L.Evented.listens
  listens: function(type, propagate) {
    return (
      L.FeatureGroup.prototype.listens.call(this, type, propagate) ||
      L.FeatureGroup.prototype.listens.call(this, 'cluster' + type, propagate)
    );
  },

  //Default functionality
  _defaultIconCreateFunction: function(cluster) {
    var childCount = cluster.getChildCount();

    var c = ' marker-cluster-';
    if (childCount < 10) {
      c += 'small';
    } else if (childCount < 100) {
      c += 'medium';
    } else {
      c += 'large';
    }

    return new L.DivIcon({
      html: '<div><span>' + childCount + '</span></div>',
      className: 'marker-cluster' + c,
      iconSize: new L.Point(40, 40)
    });
  },

  _bindEvents: function() {
    var spiderfyOnMaxZoom = this.options.spiderfyOnMaxZoom,
      zoomToBoundsOnClick = this.options.zoomToBoundsOnClick,
      spiderfyOnEveryZoom = this.options.spiderfyOnEveryZoom;

    //Zoom on cluster click or spiderfy if we are at the lowest level
    if (spiderfyOnMaxZoom || zoomToBoundsOnClick || spiderfyOnEveryZoom) {
      this.on('clusterclick clusterkeypress', this._zoomOrSpiderfy, this);
    }
  },

  _zoomOrSpiderfy: function(e) {
    let cluster = e.layer;
    if (e.type === 'clusterkeypress' && e.originalEvent && e.originalEvent.keyCode !== 13) {
      return;
    }
    this._map.fire('spiderfy', { cluster });
    cluster.spiderfy();
    // Focus the map again for keyboard users.
    if (e.originalEvent && e.originalEvent.keyCode === 13) {
      this._map._container.focus();
    }
  },

  _unbindEvents: function() {
    var spiderfyOnMaxZoom = this.options.spiderfyOnMaxZoom,
      zoomToBoundsOnClick = this.options.zoomToBoundsOnClick,
      spiderfyOnEveryZoom = this.options.spiderfyOnEveryZoom;

    if (spiderfyOnMaxZoom || zoomToBoundsOnClick || spiderfyOnEveryZoom) {
      this.off('clusterclick clusterkeypress', this._zoomOrSpiderfy, this);
    }
  },

  _zoomEnd: function() {
    let mapZoom = this._map.getZoom();
    let spiderfyZoom = this.options.spiderfyZoom;
    for (let zoneId in this._gridClusters) {
      let zoneLayer = this._gridClusters[zoneId];

      for (let layer of zoneLayer._markers) {
        if (mapZoom < spiderfyZoom) {
          this._featureGroup.addLayer(zoneLayer);
          this._featureGroup.removeLayer(layer);
        } else {
          this._featureGroup.removeLayer(zoneLayer);
          this._featureGroup.addLayer(layer);
        }
      }
    }
    this.fire('animationend', { spiderfy: mapZoom >= spiderfyZoom });
  },
  _generateInitialClusters: function() {
    this._gridClusters = {};
  },

  //Zoom: Zoom to start adding at (Pass this._maxZoom to start at the bottom)
  _addLayer: function(layer) {
    let {
      vm: {
        site: { zoneId, zoneLatLng }
      }
    } = layer;
    if (zoneId == undefined) {
      return;
    }
    this._featureGroup.addLayer(layer);
    if (!this._gridClusters[zoneId]) {
      this._gridClusters[zoneId] = new this._markerCluster(this, zoneId, zoneLatLng);
    }
    this._gridClusters[zoneId]._addChild(layer);
  },

  /**
   * Refreshes the icon of all "dirty" visible clusters.
   * Non-visible "dirty" clusters will be updated when they are added to the map.
   * @private
   */
  _refreshClustersIcons: function() {
    this._featureGroup.eachLayer(function(c) {
      if (c instanceof L.MarkerDivide && c._iconNeedsUpdate) {
        c._updateIcon();
      }
    });
  },

  /**
   * Extracts individual (i.e. non-group) layers from a Layer Group.
   * @param group to extract layers from.
   * @param output {Array} in which to store the extracted layers.
   * @returns {*|Array}
   * @private
   */
  _extractNonGroupLayers: function(group, output) {
    var layers = group.getLayers(),
      i = 0,
      layer;

    output = output || [];

    for (; i < layers.length; i++) {
      layer = layers[i];

      if (layer instanceof L.LayerGroup) {
        this._extractNonGroupLayers(layer, output);
        continue;
      }

      output.push(layer);
    }

    return output;
  }
}));
