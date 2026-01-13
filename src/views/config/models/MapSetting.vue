<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-11-02 08:43:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-09 15:23:20
 * @Description:
-->
<template>
  <div class="map-setting" v-if="!addressLoading">
    <div class="form-header">{{ currentName }}</div>
    <div class="map">
      <location-mark
        ref="mapSetting"
        open-search
        :location="location"
        :zoom="Number(mapLevel)"
        @change="handleLocationChange"
        @changeZoom="changeZoom"
      ></location-mark>
    </div>
    <div class="set-info">
      <p class="wfc2 wfs12">
        <span>经度：{{ location.point.lng }}</span> <span>纬度：{{ location.point.lat }}</span>
        <span
          >缩放等级：{{ mapLevel }}
          <!-- <w-select
            v-model="mapLevel"
            placeholder="请选择"
            class="lev-select"
            :getPopupContainer="triggerNode => triggerNode.parentNode"
            :options="zoneLevel"
          /> -->
        </span>
      </p>
      <p class="wfc2 wfs12">地址：{{ location.address }}</p>
      <p class="wfc3 wfs12 supply-text-third">选择地图经纬度，保存设置为地图导航默认位置</p>
    </div>
    <div class="footer">
      <a-button type="primary" @click="handleSubmit">确认</a-button>
    </div>
  </div>
</template>

<script>
import LocationMark from '@/components/location/mark';
import { saveUserSetting, getUserSetting } from '@/api/manage';
import { getDictList2 as apiGetDictList2 } from '@/api';
import { dictListToOptions } from '@/utils/util';
export default {
  name: 'MapSetting',
  components: { LocationMark },
  props: {
    currentName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      id: '',
      onlyViewPumpZoneId: '',
      onlyViewPumpZone: false, //是否显示全部分区
      addressLoading: true, // 地址loading
      mapKey: Date.now(),
      location: {
        point: {
          lng: '',
          lat: ''
        },
        address: ''
      },
      mapLevel: 12,
      zoneLevel: []
    };
  },
  mounted() {
    this.mapKey = Date.now();
    this.init();
  },
  methods: {
    init() {
      // this.getZoneLevel();
      this.getMapCentInfo();
      this.getOnlyViewPumpZone();
    },
    getMapCentInfo() {
      getUserSetting('mapCenter')
        .then(res => {
          let { status, resultData } = res;
          if (status === 'complete' && resultData) {
            this.id = resultData.id;
            this.location = JSON.parse(resultData.value);
            this.mapLevel = this.location?.mapLevel || 12;
          }
        })
        .finally(() => {
          this.addressLoading = false;
        });
    },
    // 获取地图缩放等级
    async getZoneLevel() {
      const dictList = await apiGetDictList2('map_zoom_level_pump');
      this.zoneLevel = dictListToOptions(dictList);
    },
    getOnlyViewPumpZone() {
      getUserSetting('onlyViewPumpZone').then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          if (resultData) {
            this.onlyViewPumpZoneId = resultData.id;
            this.onlyViewPumpZone = resultData.value === '1' ? false : true;
          } else {
            this.onlyViewPumpZone = false;
          }
        }
      });
    },
    handleLocationChange(latLngType, location, address) {
      this.location.address = address;
      this.location.point = location;
    },
    handleSubmit() {
      let strObj = Object.assign({}, this.location, { mapLevel: Number(this.mapLevel) });
      let param = {
        code: 'mapCenter',
        id: this.id,
        name: '地图中心点设置',
        value: JSON.stringify(strObj)
      };
      saveUserSetting(param).then(res => {
        let { status } = res;
        if (status === 'complete') {
          this.$message.success('修改成功');
        }
      });
    },
    checkChange() {
      let param = {
        code: 'onlyViewPumpZone',
        id: this.onlyViewPumpZoneId,
        name: '只看管辖泵房的分区',
        value: this.onlyViewPumpZone ? '0' : '1'
      };
      saveUserSetting(param).then(res => {
        let { status } = res;
        if (status === 'complete') {
          this.$message.success('设置成功');
        }
      });
    },
    changeZoom(zoom) {
      this.mapLevel = zoom;
    }
  }
};
</script>

<style scoped lang="less">
@import '@/styles/switch.less';
.map-setting {
  position: relative;

  .form-header {
    color: var(--supply-color-main);
    font-size: 16px;
    line-height: 14px;
    margin: 12px 0 22px;
    &::before {
      display: inline-block;
      width: 4px;
      height: 14px;
      margin-right: 8px;
      vertical-align: top;
      background-color: var(--supply-color-primary-DEFAULT);
      content: '';
    }
  }
  .check-onlyview {
    display: flex;
    align-items: center;
    position: absolute;
    top: -39px;
    left: 250px;
  }
  .lev-select {
    width: 120px;
  }
  .map {
    height: 454px;
    position: relative;
  }
  .set-info {
    p {
      margin-top: 18px;
      span {
        margin-right: 30px;
      }
    }
  }
  .footer {
    height: 72px;
    line-height: 72px;
    text-align: right;
  }
}
</style>
