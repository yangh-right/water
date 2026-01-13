<!--
 * @Author: chenzh
 * @Date: 2021-01-28 13:54:42
 * @LastEditTime: 2021-11-12 14:09:46
 * @LastEditors: yangliao
 * @Description:
 * @FilePath: /wisdomwaterv4.0/src/components/InputAddress/MapDialog.vue
-->
<template>
  <w-modal
    class="map-dialog secondary-modal"
    :visible="visible"
    :width="800"
    :title="title"
    okText="确认"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template slot="footer">
      <w-button v-if="interactive" @click="handleCancel">
        取消
      </w-button>
      <w-button type="primary" @click="handleOk">
        确定
      </w-button>
    </template>
    <baidu-map
      class="map"
      :center="center_map"
      :zoom="zoom"
      :dragging="true"
      :double-click-zoom="interactive"
      :scroll-wheel-zoom="true"
      @click="getLocation"
      @ready="onReady"
    >
      <bm-marker
        v-if="markerPoint"
        :position="markerPoint"
        :icon="{ url: IcLocationOn, size: { width: 50, height: 50 } }"
      >
        <bm-label
          :content="selectAddress"
          :labelStyle="{
            color: '#333',
            fontSize: '14px',
            border: '0',
            padding: '6px 10px',
            borderRadius: '4px',
            transform: 'translateX(-50%)'
          }"
          :offset="{ width: 25, height: -30 }"
        />
      </bm-marker>
      <bm-control
        v-if="interactive"
        v-show="isMapReady"
        :offset="{ width: '10px', height: '10px' }"
      >
        <bm-auto-complete
          ref="ac"
          v-model="keyword"
          :sugStyle="{ zIndex: 1001 }"
          sugClass="map-dialog-suggestion"
          @confirm="handleConfirm"
        >
          <div class="map-search">
            <w-input
              ref="suggest"
              v-model="keyword"
              class="supply-text-main"
              placeholder="搜索地点"
              @keydown.enter="handleSearch"
            />
            <w-button type="primary" @click="handleSearch"><w-icon type="ic_search" /></w-button>
          </div>
        </bm-auto-complete>
      </bm-control>
    </baidu-map>
  </w-modal>
</template>

<script>
import IcLocationOn from '@/assets/images/default/map/ic_location_on.png';
import { mapState } from 'vuex'

function checkPointValue(point) {
  if (Array.isArray(point)) {
    return point[0] && point[1];
  }

  return point.lng && point.lat;
}

export default {
  name: 'MapDialog',

  props: {
    address: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '查看位置'
    },
    point: {
      type: [Array, Object],
      default: () => []
    },
    interactive: {
      type: Boolean,
      default: false
    }
  },

  data() {
    // let center = {
    //   lng: 114.0614887,
    //   lat: 22.5285005
    // };
    return {
      IcLocationOn,
      localPoint: this.point,
      isMapReady: false,
      visible: false,
      // center: center,
      keyword: '',
      selectAddress: '',
      markerPoint: null,
      zoom: 17
    };
  },

  computed: {
    ...mapState('map', ['center']),
    center_map() {
      let center = {lng: null, lat: null }
      center.lng = this.center[1]
      center.lat = this.center[0]
      return center
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.initLocation();
      }
    },
    address() {
      this.initLocation();
    },
    point() {
      this.initLocation();
    }
  },

  methods: {
    onReady(e) {
      this.map = e.map;
      this.BMap = e.BMap;

      this.isMapReady = true;

      this.initLocation();
      // this.setMapStyle();
    },

    onSearchAddress(value) {
      if (this.BMap) {
        let geo = new BMap.Geocoder();
        geo.getPoint(value, point => {
          if (point) {
            this.zoom = 17;
            this.markerPoint = point;
            this.selectAddress = value;
            let center = new BMap.Point(point.lng, point.lat);
            this.map.centerAndZoom(center, this.zoom);
          }
        });
      }
    },

    // 设置地图样式
    setMapStyle() {
        this.map.setMapStyleV2({
            styleId: '204feadb68dde39c92ebbed5dfdb78b5'
        });
    },

    initLocation() {
      if (this.map) {
        if (this.point && checkPointValue(this.point)) {
          this.initPoint();
        } else if (this.address) {
          this.onSearchAddress(this.address);
        }
      }
    },

    initPoint(value) {
      let point = value || this.point;
      if (Array.isArray(point)) {
        point = {
          lng: this.point[0],
          lat: this.point[1]
        };
      }

      if (point) {
        this.zoom = 17;
        this.markerPoint = point;
        let center = new BMap.Point(point.lng, point.lat);
        this.map.centerAndZoom(center, this.zoom);

        let geoc = new BMap.Geocoder();
        geoc.getLocation(center, rs => {
          let address = rs.address;

          this.selectAddress = address;
        });
      }
    },

    getLocation(e) {
      if (!this.interactive) return;

      const { BMap } = this;
      let point = new BMap.Point(e.point.lng, e.point.lat);
      let geoc = new BMap.Geocoder();

      geoc.getLocation(point, rs => {
        let address = rs.address;

        this.selectAddress = address;
        this.markerPoint = {
          lat: point.lat,
          lng: point.lng
        };
      });
    },

    handleConfirm() {
      if (!this.keyword) {
        return this.$message.warn('请输入需要搜索的地点');
      }

      const local = new BMap.LocalSearch(this.map, {
        onSearchComplete: () => {
          if (!local.getResults().getPoi(0)) {
            this.$message.warn('未找到相关地点信息');
          } else {
            const point = local.getResults().getPoi(0).point; // 获取第一个智能搜索的结果

            this.initPoint({
              lat: point.lat,
              lng: point.lng
            });
          }
        }
      });
      local.search(this.keyword);
    },

    handleSearch() {
      let ac = this.$ref.ac.originInstance;
      if (ac) {
        const keyword = this.$refs.suggest.$el.value;
        ac.search(keyword);
      }
    },

    handleOk() {
      if (this.interactive) {
        this.$emit('update', {
          address: this.selectAddress,
          point: this.markerPoint
        });
      }
      this.visible = false;
    },

    handleCancel() {
      this.visible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.map-dialog {
  /deep/ .wpg-modal-body {
    padding: 20px 40px;
  }

  /deep/ .wpg-modal-footer {
    padding: 10px 40px 36px;
  }
}

.map {
  width: 100%;
  height: 350px;
  margin-top: 10px;
}

.map-search {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 9;
  display: flex;
  width: 300px;
  height: 28px;
  box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.12);

  /deep/ .wpg-input {
    height: 100%;
    padding: 0 8px;
    font-size: 12px;
    border: 1px solid transparent;
    border-radius: 4px 0 0 4px;

    &:focus {
      border-color: #4285f4;
      box-shadow: none;
    }
  }

  /deep/ .wpg-btn {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 100%;
    font-size: 18px;
    border-radius: 0 4px 4px 0;
  }
}
</style>

<style lang="less">
.map-dialog-suggestion {
  .tangram-suggestion-grey {
    display: none;
  }
}
</style>
