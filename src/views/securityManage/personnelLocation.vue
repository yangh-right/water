<!--
 * @Author: wangyr
 * @Date: 2023-03-17 08:50:37
 * @LastEditors: wangyr
 * @LastEditTime: 2024-12-10 16:56:29
 * @Description:
-->
<template>
  <div class="mapCmp">
    <div class="mapCmp-main">
      <!-- 返回 -->
      <div class="back-btn">
        <w-button @click="toPredict()" type="primary" ghost>视频监控</w-button>
        <return-control class="supply-ml-3" :keep="true" :is-drill-down="true"></return-control>
      </div>
      <!-- 全屏地图 -->
      <personnelTrack
        :stationData="stationData"
        :personLine="personLine"
        @viewTracks="viewTracks"
        ref="boxMap"
      ></personnelTrack>
    </div>
    <div class="top-selsect" v-if="checkDate">
      <div>
        <span>搜索{{ entityName }}行为轨迹：</span>
        <w-range-picker
          dropdownClassName="date__select"
          :allowClear="false"
          class="date-pick"
          v-model="rangeTime"
          :show-time="{ format: 'HH:mm' }"
          format="YYYY-MM-DD HH:mm:ss"
          style="width: 400px; height: 40px"
          :placeholder="['开始时间', '结束时间']"
          @ok="handleLocationHistory"
        >
        </w-range-picker>
      </div>
      <w-icon
        type="close"
        style="color: var(--supply-rgb-color-primary-DEFAULT); font-size: 36px"
        @click="removeTracks"
      />
    </div>
    <div class="left-panel">
      <safe-manage
        :tokenLogin="tokenLogin"
        :stationData="stationData"
        @viewTrajectory="viewTrajectory"
      ></safe-manage>
    </div>
  </div>
</template>

<script>
import { locationData, historyData } from './modules/mock.js';
import {
  personLocationLogin,
  personLocationHistory,
  personLocationSnapshot
} from '@/api/realTimePositioning';
import safeManage from './components/safeManage';
import personnelTrack from './modules/personnelTrack.vue';
export default {
  name: 'realTimePositioning',
  components: { personnelTrack, safeManage },
  data() {
    return {
      tokenLogin: '', //对接登录token
      markerLayer: [], // 标注
      stationData: [],
      rangeTime: null,
      checkDate: false, //是否显示时间选择器
      entityIds: '', //查询运动轨迹得人员id
      entityName: '', //查询人员的名字
      viewList: [],
      personLine: []
    };
  },
  created() {
    this.getStation();
  },
  methods: {
    async getStation() {
      let params = {
        username: 'root',
        code: '$2a$10$bfoevE.vdhiDroQvBz3UXekkv.r/zTTmraW4xtXcSLTbvW1JvaVqS'
      };
      // 获取站点信息
      const { success, resultData } = await personLocationLogin(params);
      if (success) {
        this.tokenLogin = resultData;
        this.getLocationSnapshot();
      }
    },
    //获取定位人员信息
    async getLocationSnapshot() {
      let token = this.tokenLogin;
      const { success, resultData } = await personLocationSnapshot(token);
      if (success) {
        this.stationData = resultData.data;
      }
    },
    //查看轨迹
    viewTrajectory(data) {
      this.checkDate = true;
      this.rangeTime = null;
      this.entityIds = data.entityId;
      this.entityName = data.entityName;
    },
    //获取人员轨迹
    async handleLocationHistory() {
      let params = {
        token: this.tokenLogin,
        startTime: this.rangeTime[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: this.rangeTime[1].format('YYYY-MM-DD HH:mm:ss'),
        entityIds: this.entityIds
      };
      const { success, resultData } = await personLocationHistory(params);
      if (success) {
        let result = [];
        let data = resultData.data;
        for (let key in data) {
          data[key].forEach(item => {
            if (item.x != 0 && item.y != 0) {
              result.push({ x: item.x, y: item.y });
            }
          });
        }
        this.personLine = result;
      }
    },
    viewTracks(data) {
      this.checkDate = true;
      this.rangeTime = null;
      this.entityIds = data.entityId;
      this.entityName = data.entityName;
    },
    removeTracks() {
      this.checkDate = false;
      this.rangeTime = null;
      this.entityIds = '';
      this.entityName = '';
      this.personLine = [];
    },
    toPredict() {
      this.drillDown({
        path: '/factoryMonitoring'
      });
    }
  },
  beforeDestroy() {
    this.newMap.removeEventListener('tilesloaded');
    this.newMap.destroy();
  }
};
</script>
<style lang="less" scoped>
/deep/.mapboxgl-popup-content {
  background: none !important;
}
.mapCmp {
  width: 100%;
  height: 100%;
  position: relative;

  &-main {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;

    .spinStyle {
      width: 100%;
      height: 100%;
      background-color: #02263e !important;
      z-index: 7;
      position: absolute;
      left: 0px;
      top: 0px;

      /deep/.ant-spin-container {
        width: 100%;
        height: 100%;
      }
      /deep/.ant-spin {
        top: 30%;
      }
      /deep/.ant-spin-dot {
        font-size: 40px;
        margin-top: 30%;
      }
    }

    .map-container {
      background-image: none !important;
    }
  }
  .back-btn {
    display: flex;
    align-items: center;
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 12;
  }
  .left-panel {
    width: 320px;
    height: calc(100% - 24px);
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 12;
    background: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
  }
  .top-selsect {
    z-index: 999;
    position: absolute;
    width: 41%;
    height: 48px;
    padding: 0 12px;
    top: 12px;
    left: 346px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--supply-color-bg-DEFAULT);
    border-radius: 4px;
    span {
      font-weight: 500;
      font-family: JiangChengXieHei, sans-serif;
      font-size: 14px;
      text-indent: 12px;
      color: var(---supply-color-third);
    }
  }
}
</style>
