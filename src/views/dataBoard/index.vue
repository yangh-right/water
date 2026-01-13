<template>
  <div class="dataBoard">
    <div class="dataBoard-header">
      <w-tabs v-model="tabsValue">
        <w-tab-pane key="all" tab="全部"> </w-tab-pane>
        <w-tab-pane key="realTime" tab="实时"> </w-tab-pane>
        <w-tab-pane key="predicted" tab="预测"> </w-tab-pane>
      </w-tabs>
      <div style="display: flex; align-items: center">
        <!-- <w-button @click="getDataBoardData">获取</w-button> -->
        <w-button v-if="!draggable && tabsValue === 'all'" size="small" @click="modifyLayout">
          修改布局
        </w-button>
        <w-button v-if="draggable && tabsValue === 'all'" size="small" @click="cancelEdit">
          取消
        </w-button>
        <w-button
          style="margin-left: 10px"
          v-if="draggable && tabsValue === 'all'"
          size="small"
          @click="saveEdit"
        >
          保存
        </w-button>
      </div>
    </div>
    <div class="dataBoard-content">
      <grid-layout
        v-if="dataBoardData.length"
        :layout.sync="dataBoardData"
        :col-num="32"
        :row-height="12"
        :margin="[3, 4]"
        :autoSize="true"
        :is-draggable="draggable"
        :is-resizable="resizable"
        :vertical-compact="true"
        :use-css-transforms="true"
      >
        <grid-item
          v-for="item in dataBoardData"
          :key="item.i"
          :static="item.static"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
        >
          <div class="title-box" v-if="item.configName || item.topSummaryDataList.length">
            <span class="title"> {{ item.configName }}</span>
            <div class="title-l" v-if="item.topSummaryDataList && item.topSummaryDataList.length">
              <span class="name"> {{ item.topSummaryDataList[0].pointMemo }}:</span>
              <span class="value">{{ item.topSummaryDataList[0].pv }}</span
              >{{ item.topSummaryDataList[0].pointUnit }}
              <span class="value">{{ item.topSummaryDataList[0].simulatePv }}</span
              >{{ item.topSummaryDataList[0].pointUnit }}
            </div>
          </div>
          <div class="content">
            <div class="content-multiple" v-if="item.summaryDataList.length === 2">
              <div class="multiple-l">
                <span class="content-title"
                  ><span class="icon"></span> {{ item.summaryDataList[0].lineName }}</span
                >
                <div
                  class="dataItem"
                  v-for="(it, i) of item.summaryDataList[0].lineSummaryDataList"
                  :key="it.placeId + i"
                >
                  <span class="name"> {{ it.pointMemo }}:</span>
                  <div class="valueBox" v-if="tabsValue !== 'predicted'">
                    <span class="value">{{ it.pv }}</span
                    >{{ it.pointUnit }}
                  </div>
                  <div class="valueBox" v-if="tabsValue !== 'realTime'">
                    <span class="value">{{ it.simulatePv }}</span
                    >{{ it.pointUnit }}
                  </div>
                </div>
              </div>
              <w-divider dashed type="vertical" />
              <div class="multiple-r">
                <span class="content-title"
                  ><span class="icon"></span> {{ item.summaryDataList[1].lineName }}</span
                >
                <div
                  class="dataItem"
                  v-for="(it, i) of item.summaryDataList[1].lineSummaryDataList"
                  :key="it.placeId + i"
                >
                  <span class="name"> {{ it.pointMemo }}:</span>
                  <div class="valueBox" v-if="tabsValue !== 'predicted'">
                    <span class="value">{{ it.pv }}</span
                    >{{ it.pointUnit }}
                  </div>
                  <div class="valueBox" v-if="tabsValue !== 'realTime'">
                    <span class="value">{{ it.simulatePv }}</span
                    >{{ it.pointUnit }}
                  </div>
                </div>
              </div>
            </div>
            <div class="content-one" v-if="item.summaryDataList.length === 1">
              <span class="content-title"
                ><span class="icon"></span> {{ item.summaryDataList[0].lineName }}</span
              >
              <div class="dataItemBox">
                <div
                  class="dataItem"
                  v-for="(it, i) of item.summaryDataList[0].lineSummaryDataList"
                  :key="it.placeId + i"
                >
                  <span class="name" :class="it.pointMemo === '瞬时总水量' ? 'bigName' : ''">
                    {{ it.pointMemo }}:</span
                  >
                  <div class="valueBox" v-if="tabsValue !== 'predicted'">
                    <span class="value" :class="it.pointMemo === '瞬时总水量' ? 'bigValue' : ''">{{
                      it.pv
                    }}</span
                    >{{ it.pointUnit }}
                  </div>
                  <div class="valueBox" v-if="tabsValue !== 'realTime'">
                    <span class="value" :class="it.pointMemo === '瞬时总水量' ? 'bigValue' : ''">{{
                      it.simulatePv
                    }}</span
                    >{{ it.pointUnit }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<script>
import { getData, updateLocation } from '@/api/dataBoard';
import VueGridLayout from 'vue-grid-layout';
export default {
  name: 'Index',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  data() {
    return {
      tabs: ['全部', '实时', '预测'],
      tabsValue: 'all',
      draggable: false,
      resizable: false,
      index: 0,
      dataBoardData: [],
      dataBoardDataCopy: [],
      timer: null
    };
  },
  computed: {},
  activated() {
    this.getData();
    this.timer = setInterval(() => {
      this.getData();
    }, 1000 * 30);
  },
  deactivated() {
    clearInterval(this.timer);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    async getData() {
      let res = await getData();
      if (res.length) {
        this.dataBoardData = res.map(obj => ({ ...obj, ...JSON.parse(obj.pcLocation) }));
        this.dataBoardDataCopy = res.map(obj => ({ ...obj, ...JSON.parse(obj.pcLocation) }));
      }
    },
    modifyLayout() {
      this.draggable = true;
      this.resizable = true;
      if (this.timer) clearInterval(this.timer);
    },
    cancelEdit() {
      this.draggable = false;
      this.resizable = false;
      this.dataBoardData = this.dataBoardDataCopy;
      this.timer = setInterval(() => {
        this.getData();
      }, 1000 * 30);
    },
    async saveEdit() {
      let params = this.dataBoardData.map(item => {
        let location = {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          i: item.i,
          static: item.static
        };
        return {
          configCode: item.configCode,
          pcLocation: JSON.stringify(location)
        };
      });
      let { status } = await updateLocation(params);
      if (status === 'complete') {
        this.draggable = false;
        this.resizable = false;
        this.$message.success('修改成功！');
        this.timer = setInterval(() => {
          this.getData();
        }, 1000 * 30);
      }
    },
    getDataBoardData() {
      console.log('getDataBoardData', this.dataBoardData);
    }
  }
};
</script>
<style lang="less" scoped>
.dataBoard {
  width: 100%;
  height: 100%;
  &-header {
    z-index: 14;
    flex: none;
    width: 100%;
    height: 54px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    border-radius: 4px;
    align-items: center;
    background-color: var(--supply-color-bg-select-DEFAULT);
    /deep/ .tab-wrap {
      height: 100%;
      .wpg-tabs-nav {
        height: 50px;
      }
      .wpg-tabs-nav-wrap {
        background: var(--supply-color-bg-card-DEFAULT);
        height: 50px;
        border-radius: 4px;
      }
      .wpg-tabs-bar {
        margin: 0;
      }
    }
    /deep/.wpg-tabs {
      height: 40px;
      overflow: hidden;
    }
  }
  &-content {
    width: 100%;
    height: calc(100% - 36px);
    overflow-y: auto;
    overflow-x: hidden;
  }
}
.vue-grid-layout {
  // background: #eee;
}

.vue-grid-item:not(.vue-grid-placeholder) {
  // border: 1px solid black;
  background-color: var(--supply-color-bg-select-DEFAULT);
  padding: 4px 2px;
}

.vue-grid-item .resizing {
  opacity: 0.9;
}

.vue-grid-item .static {
  // background: #cce;
}

.vue-grid-item .text {
  font-size: 24px;
  text-align: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  height: 100%;
  width: 100%;
}

.vue-grid-item .no-drag {
  height: 100%;
  width: 100%;
}

.vue-grid-item .minMax {
  font-size: 12px;
}

.vue-grid-item .add {
  cursor: pointer;
}

.vue-draggable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 0;
  left: 0;
  background-position: bottom right;
  padding: 0 8px 8px 0;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  cursor: pointer;
}
.title-box {
  touch-action: none;
  display: flex;
  .title {
    font-weight: 700;
    font-size: 14px;
    color: var(--supply-color-primary-DEFAULT);
  }
  .title-l {
    letter-spacing: 0;
    margin-left: 12px;
    display: flex;
    font-weight: 400;
    font-size: 14px;
  }
}
.content {
  touch-action: none;
  padding-top: 5px;
  width: 100%;
  .dataItemBox {
    display: flex;
    flex-wrap: wrap;
  }
  .dataItem {
    letter-spacing: 0;
    display: flex;
    font-weight: 400;
    font-size: 12px;
    margin-bottom: 2px;
    align-items: center;
  }
  .content-multiple {
    width: 100%;
    display: flex;
    .content-title {
      font-family: AlibabaPuHuiTi_2_85_Bold, sans-serif;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0;
      .icon {
        width: 3px;
        height: 10px;
        background: var(--supply-color-auxiliary);
        display: inline-block;
        margin-right: 3px;
      }
    }
    .multiple-l {
      width: 48%;
      margin-top: -10px;
    }
    .multiple-r {
      margin-top: -10px;
      width: 48%;
    }
  }
  .content-one {
    width: 100%;
    .dataItem {
      min-width: 352px;
    }
    .name {
      min-width: 100px;
      text-align: right;
    }
  }
}
.name {
  min-width: 80px;
  text-align: right;
}
.bigName {
  min-width: 60px !important;
}
.valueBox {
  min-width: 104px;
  display: flex;
  align-items: center;
}
.value {
  min-width: 68px;
  height: 22px;
  background: var(--supply-color-bg-card-faint);
  font-weight: 500;
  font-size: 14px;
  color: var(--supply-color-primary-DEFAULT);
  letter-spacing: 0;
  text-align: right;
  margin-left: 4px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.bigValue {
  width: 118px !important;
  height: 32px !important;
  font-weight: 500;
  font-size: 22px;
}
/deep/.wpg-divider-dashed {
  height: auto;
}
</style>
