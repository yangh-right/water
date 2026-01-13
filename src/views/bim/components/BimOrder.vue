<template>
  <div class="bim-order">
    <div class="card-title">
      <div class="card-radio">
        <div class="select-icon" @click="toggleTagShow()">
          显示标签<span :class="{ on: showTag }"></span>
        </div>
      </div>
    </div>
    <div class="card-bg">
      <w-radio-group v-model="activeKey" @change="onChange">
        <w-radio-button value="my"></w-radio-button>
        <w-radio-button value="xy"></w-radio-button>
        <w-radio-button value="ty"></w-radio-button>
      </w-radio-group>
      <div v-show="activeKey == 'my'" class="select-light"></div>
      <div class="card-main">
        <div key="my" class="btnArea" v-show="activeKey == 'my'">
          <div class="card-action">
            <div class="card-item elements-hidden" @click="hideElements"></div>
            <div class="card-item elements-isolate" @click="isolateElements"></div>
            <div class="card-item show-all" @click="allDisplay"></div>
            <div class="card-item main-reset" @click="resetPosition"></div>
          </div>
          <div class="view-item">
            <div class="item-title">
              <img src="@/assets/images/default/bim/ic_d.png" alt="" />
              <span>拆解等级</span>
            </div>
            <div class="slider-box">
              <w-slider
                v-model="splitLevel"
                class="level-slider"
                :min="0"
                :max="10"
                :step="1"
                :marks="marks"
                @change="handleChangeLevel"
              />
            </div>
          </div>
          <div
            v-for="mode in modes"
            :key="mode.name"
            @click="onChangeMode(mode.modeId)"
            class="my-btn-item"
            :style="{
              backgroundImage: 'url(' + mode.image + ')',
              opacity: nowModeId === mode.modeId ? '1' : '0.7'
            }"
          ></div>
        </div>
        <div key="xy" class="btnArea" v-show="activeKey == 'xy'">
          <div
            v-for="view in views"
            :key="view.id"
            @click="onChangeRoute(view.id, view.time)"
            class="xy-btn-item"
            :style="{ backgroundImage: 'url(' + view.image + ')' }"
          >
            <p :title="view.name">{{ view.name }}</p>
          </div>
        </div>
        <div key="ty" class="btnArea" v-show="activeKey == 'ty'">
          <div
            v-for="shot in shots"
            :key="shot.id"
            @click="onChangeKey(shot.id)"
            class="ty-btn-item"
            :style="{ backgroundImage: 'url(' + shot.image + ')' }"
          >
            <p :title="shot.name">{{ shot.name }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="weather-bg">
      <div class="view-item">
        <w-radio class="view-radio" :value="weatherMode" :checked="weatherMode === '1'"
          >环境模版</w-radio
        >
        <w-select
          v-model="weatherId"
          class="weather-template-select"
          :get-popup-container="triggerNode => triggerNode.parentNode"
          :options="weatherTemplates"
          @change="updateWeather"
        />
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash.debounce';
import { mapGetters } from 'vuex';
import {
  getViewAnimListApi,
  selectCamerashotAllApi,
  switchViewModeApi,
  getViewAnimPreviewApi,
  playOperationApi,
  controlTagShowApi,
  doActionApi,
  resetModelApi,
  hideElementsApi,
  allShowApi,
  isolateElementsApi,
  modelSplitApi,
  getWeatherListApi,
  getWeatherIdApi,
  updateWeatherApi
} from '@/api/bim.js';
export default {
  name: 'BimOrder',
  components: {},
  props: {
    taskId: {
      type: String,
      default: ''
    },
    appid: {
      type: String,
      default: ''
    }
  },
  data() {
    this.handleChangeLevel = debounce(this.changeLevel, 500);
    return {
      activeKey: 'my',
      activeTitle: '',
      warmOn: false,
      cameras: [],
      views: [],
      nowViewId: -1,
      shots: [],
      showTag: true,
      viewStrating: false,
      nowModeId: 'third',
      splitLevel: 0,
      marks: {
        0: '0',
        10: '10'
      },
      modes: [
        {
          name: '第三人称巡游',
          modeId: 'third',
          image: require(`@/assets/images/default/bim/but_a_1.png`)
        },
        {
          name: '第一人称巡游',
          modeId: 'first',
          image: require(`@/assets/images/default/bim/but_a_2.png`)
        }
      ],
      weatherMode: '1',
      weatherTemplates: [],
      weatherId: ''
    };
  },
  watch: {
    taskId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getProjectId();
        }
      }
    }
  },
  computed: {
    ...mapGetters('user', {
      userInfo: 'info'
    })
  },
  beforeDestroy() {
    // 重置模型分解
    this.splitLevel = 0;
    this.changeLevel();
  },
  methods: {
    async getProjectId() {
      this.getViewAnimList();
      this.getCamerashotList();
      this.getWeatherList();
      this.getWeatherId();
    },
    // 获取巡检漫游
    async getViewAnimList() {
      this.views = [];
      try {
        let res = await getViewAnimListApi(this.taskId, this.appid);
        res?.resultData.map(item => {
          this.views.push({
            name: item.name,
            id: item.viewId,
            time: item.time,
            image: require(`@/assets/images/default/bim/but_b_ty.png`)
          });
        });
      } catch (e) {
        console.log(e);
      }
    },
    // 获取跳跃式迅游
    async getCamerashotList(obj) {
      this.shots = [];
      try {
        const formData = new FormData();
        formData.append('taskid', this.taskId);
        let res = await selectCamerashotAllApi(formData);
        res?.resultData.map(item => {
          this.shots.push({
            name: item.name,
            id: item.tid,
            image: require(`@/assets/images/default/bim/but_c_ty.png`)
          });
        });
      } catch (e) {
        console.log(e);
      }
    },
    // 获取天气环境列表
    async getWeatherList() {
      try {
        const res = await getWeatherListApi(this.appid);
        if (res && res.resultData) {
          // 过滤掉id为23和24. id为23是参数化天气, 24是可变背景色
          const filterIds = ['23', '24'];
          this.weatherTemplates = (res.resultData || [])
            .filter(item => !filterIds.includes(item.id))
            .map(item => {
              return {
                value: item.id,
                label: item.weatherName,
                title: item.weatherName
              };
            });
        }
      } catch (error) {
        console.log('getWeatherList ~ error:', error);
      }
    },
    // 根据BIM模型编号和taskId获取当前天气ID
    async getWeatherId() {
      try {
        const res = await getWeatherIdApi(this.taskId, this.appid);
        if (res && res.resultData) {
          this.weatherId = res.resultData || '';
        }
      } catch (error) {
        console.log('getWeatherId ~ error:', error);
      }
    },
    // 根据taskId, 变更天气
    async updateWeather() {
      try {
        const res = await updateWeatherApi(this.taskId, this.weatherId);
        if (res && res.resultData) {
          console.log('updateWeather ~ res:', res);
          this.$message.success('设置成功');
        }
      } catch (error) {
        console.log('updateWeather ~ error:', error);
      }
    },
    // handleChangeLevel: debounce(function() {
    //   console.log('分级等级:', this.splitLevel);
    //   this.changeLevel();
    // }, 500),

    async changeLevel() {
      try {
        const res = await modelSplitApi(this.taskId, this.splitLevel);
        console.log('模型分解', res);
      } catch (error) {
        console.log(error);
      }
    },
    async toggleTagShow() {
      let params = { taskId: this.taskId, lableVisibility: !this.showTag };
      await controlTagShowApi(params);
      this.showTag = !this.showTag;
    },
    async onChange() {
      await this.animateAction('stop');
      await switchViewModeApi(this.taskId);
      this.nowModeId = 'third';
    },
    //点击巡检点跳转
    async onChangeKey(point) {
      await this.animateAction('stop');
      await doActionApi(this.taskId, point);
    },
    async onChangeRoute(viewId, time) {
      try {
        const { errorMessage } = await getViewAnimPreviewApi(this.taskId, viewId);
        if (errorMessage) {
          this.$message.error('播放失败');
          return;
        }
        this.nowViewId = viewId;
        this.$emit('viewStrating', true, time);
      } catch (e) {
        console.log(e);
      }
    },
    async onChangeMode(modeId) {
      let enableGravity = true;
      let enableAllCollision = false; // 关闭碰撞
      let speedLevel = 1;
      let characterHeight = 200;
      if (modeId == 'first') {
        await switchViewModeApi(
          this.taskId,
          1,
          1,
          enableGravity,
          enableAllCollision,
          speedLevel,
          characterHeight
        );
      } else {
        enableGravity = false;
        enableAllCollision = false;
        await switchViewModeApi(
          this.taskId,
          2,
          1,
          enableGravity,
          enableAllCollision,
          speedLevel,
          characterHeight
        );
      }
      this.nowModeId = modeId;
    },
    async replayorPause(playing) {
      if (this.nowViewId > 0) {
        await this.animateAction(playing ? 'pause' : 'replay');
      }
    },
    async animateAction(mode) {
      if (this.nowViewId > 0) {
        await playOperationApi(this.taskId, this.nowViewId, mode);
        if (mode === 'stop') {
          this.$emit('viewStrating', false);
          this.nowViewId = -1;
        }
      }
    },
    // 主视角定位
    async resetPosition() {
      await resetModelApi(this.taskId);
    },
    // 隐藏图元
    async hideElements() {
      await hideElementsApi(this.taskId);
    },
    // 显示图元
    async allDisplay() {
      await allShowApi(this.taskId);
    },
    // 隔离图元
    async isolateElements() {
      await isolateElementsApi(this.taskId);
    }
  }
};
</script>
<style lang="less" scoped>
.bim-order {
  padding: 20px 0 10px;
  background: transparent;
  .component-fade-enter-active,
  .component-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .component-fade-enter, .component-fade-leave-to                                                                                                                                                                                                                                                /* .component-fade-leave-active for below version 2.1.8 */ {
    opacity: 0;
  }
  .card-title {
    width: 292px;
    height: 27px;
    background-image: url('~@/assets/images/default/bim/tit_1.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    text-align: right;
  }
  .card-bg {
    background: rgba(8, 48, 62, 0.4);
    padding: 0px 8px 10px 8px;
  }
  .card-action {
    display: flex;
    justify-content: space-around;
    .card-item {
      width: 62px;
      height: 24px;
      margin: 0 3px;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      &:hover {
        cursor: pointer;
      }
    }
    .elements-hidden {
      background-image: url('~@/assets/images/default/bim/elements_hidden.png');
    }
    .elements-isolate {
      background-image: url('~@/assets/images/default/bim/elements_isolate.png');
    }
    .show-all {
      background-image: url('~@/assets/images/default/bim/show_all.png');
    }
    .main-reset {
      width: 80px;
      background-image: url('~@/assets/images/default/bim/main_reset.png');
    }
  }
  .select-light {
    position: absolute;
    top: 52px;
    width: 96px;
    height: 26.3px;
    // width: 115px;
    // height: 31.5px;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-image: url('~@/assets/images/default/bim/light.png');
  }

  .view-item {
    width: 100%;
    margin-top: 4px;
    padding: 10px;
    color: #a9daff;
    background: rgba(25, 33, 47, 0.26);
    border-radius: 4px;
    .weather-template-select {
      width: 170px;
    }

    .item-title {
      display: flex;

      img {
        width: 20px;
      }

      span {
        margin-left: 6px;
      }
    }

    .level-slider {
      margin-top: 10px;

      ::v-deep .wpg-slider-rail {
        background: rgba(30, 42, 60, 0.5);
        border-radius: 3px;
      }

      ::v-deep .wpg-slider-track {
        background-image: linear-gradient(270deg, #77aeda 0%, #245c86 100%);
        border-radius: 3px;
      }

      ::v-deep .wpg-slider-handle {
        top: 7px;
        width: 8px;
        height: 8px;
        background: #8ed7ff;
        border: 3px solid rgba(101, 209, 255, 0.34);
      }

      ::v-deep .wpg-slider-mark {
        .wpg-slider-mark-text {
          color: #a9daff;
        }
      }
    }

    .primitive-manage {
      margin-top: 10px;

      ::v-deep .wpg-row {
        .wpg-col {
          .wpg-btn {
            color: #a9daff;
            background: #242d44;
            border-color: #484848;
          }

          .wpg-btn:hover,
          .wpg-btn:focus {
            border-color: #a9daff;
          }
        }
      }
    }
  }

  /deep/.wpg-radio-group {
    padding: 10px 2px;
    height: 33px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .wpg-radio-button-wrapper {
      width: 96px;
      height: 26.3px;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      border: none;
      box-shadow: none;
      background-color: transparent !important;
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 13px;
      color: transparent;
      &:hover {
        cursor: pointer;
        opacity: 0.7;
      }
      span {
        opacity: 0.7;
      }
      &::before {
        background-color: transparent !important;
      }

      &:first-child {
        background-image: url('~@/assets/images/default/bim/tabNormal_1.png');
      }
      &:first-child.wpg-radio-button-wrapper-checked {
        background-image: url('~@/assets/images/default/bim/tabSelect_1.png');
        &::before {
          width: 96px;
          height: 26.3px;
          background-repeat: no-repeat;
          background-size: 100% 100%;
          background-image: url('~@/assets/images/default/bim/light.png');
          background-color: transparent !important;
        }
      }

      &:nth-child(2) {
        background-image: url('~@/assets/images/default/bim/tabNormal_2.png');
      }
      &:nth-child(2).wpg-radio-button-wrapper-checked {
        background-image: url('~@/assets/images/default/bim/tabSelect_2.png');
        &::before {
          width: 96px;
          height: 26.3px;
          background-repeat: no-repeat;
          background-size: 100% 100%;
          background-image: url('~@/assets/images/default/bim/light.png');
          background-color: transparent !important;
        }
      }

      &:last-child {
        background-image: url('~@/assets/images/default/bim/tabNormal_3.png');
      }
      &:last-child.wpg-radio-button-wrapper-checked {
        background-image: url('~@/assets/images/default/bim/tabSelect_3.png');
        &::before {
          width: 96px;
          height: 26.3px;
          background-repeat: no-repeat;
          background-size: 100% 100%;
          background-image: url('~@/assets/images/default/bim/light.png');
          background-color: transparent !important;
        }
      }
    }
    .wpg-radio-button-wrapper-checked {
      font-family: PingFangSC-Semibold, sans-serif;
      font-weight: 600;
      font-size: 13px;
      color: #ffffff;
      line-height: 31px;
      span {
        opacity: 1;
      }
    }
  }

  .card-radio {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .select-icon {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #ffffff;
      margin-right: 2px;
      span {
        display: inline-block;
        width: 42px;
        height: 20px;
        background-image: url('~@/assets/images/default/bim/ic_off.png');
        background-repeat: no-repeat;
        background-size: 100% 100%;
        &:hover {
          cursor: pointer;
          opacity: 0.7;
        }
        &.on {
          background-image: url('~@/assets/images/default/bim/ic_on.png');
        }
      }
    }
  }

  .card-main {
    padding: 10px 0 0 0;
    opacity: 0.8;
    .btnArea {
      padding: 12px, 18px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-around;
      .xy-btn-item,
      .my-btn-item {
        width: 210px;
        height: 36px;
        margin: 12px;
        opacity: 0.7;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        &:hover {
          cursor: pointer;
          opacity: 1;
        }
      }
      .xy-btn-item {
        overflow: hidden;
        padding-left: 40px;
        padding-right: 10px;

        p {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-family: PangMenZhengDao, sans-serif;
          font-size: 14px;
          color: #ffffff;
          letter-spacing: 2.1px;
          text-align: center;
          text-shadow: 0 2px 4px rgb(0 0 0 / 50%);
          line-height: 36px;
        }
      }
      .ty-btn-item {
        width: 130px;
        height: 36px;
        margin-bottom: 12px;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        overflow: hidden;
        padding-left: 38px;
        &:hover {
          cursor: pointer;
          opacity: 0.7;
        }

        p {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-family: PangMenZhengDao, sans-serif;
          font-size: 14px;
          color: #ffffff;
          letter-spacing: 2.1px;
          text-align: center;
          text-shadow: 0 2px 4px rgb(0 0 0 / 50%);
          line-height: 36px;
        }
      }
    }
  }

  .view-radio {
    color: #a9daff !important;
  }
  /deep/ .wpg-select {
    .wpg-select-selection {
      background: #2c456d;
      border: none;
      border-radius: 4px;

      .wpg-select-selection__placeholder {
        color: #5e7598 !important;
      }
    }

    &.wpg-select-focused {
      .wpg-select-selection {
        border: 1px solid #8ab1ff;
      }
    }

    .wpg-select-selection-selected-value {
      color: #a9daff;
    }

    .wpg-select-search__field {
      color: #a9daff;
    }
  }

  /deep/ .wpg-select-dropdown-menu-item-selected {
    color: #fff;
    background: #3c4a68;
  }

  /deep/ .wpg-select-dropdown-menu-item-active:not(.wpg-select-dropdown-menu-item-disabled) {
    color: #fff;
    background: #3c4a68;
  }

  /deep/ .wpg-select-dropdown {
    color: #a9daff;
    background: #242d44;
  }

  /deep/ .wpg-select-dropdown-menu-item:hover:not(.wpg-select-dropdown-menu-item-disabled) {
    color: #fff;
    background: #3c4a68;
  }

  /deep/ .wpg-select-dropdown-menu-item {
    color: #a9daff;
  }

  *::-webkit-scrollbar-thumb {
    background-color: #334a71;
  }

  *::-webkit-scrollbar-track {
    background-color: #121c2b;
  }

  /deep/ .wpg-select-dropdown-menu::-webkit-scrollbar-thumb {
    background-color: #334a71;
  }

  /deep/ .wpg-select-dropdown-menu::-webkit-scrollbar-track {
    background-color: #121c2b;
  }

  /deep/ .wpg-select-selection__clear {
    color: #5e7598;
    background: #2c456d;
  }
}
</style>
