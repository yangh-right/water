<template>
  <div class="aeration" id="aeration">
    <div class="aeration-head">
      <w-form-model class="supply-bg-bg-card-DEFAULT" layout="inline" ref="form">
        <w-form-model-item label="选择污水厂" prop="waterPlantId">
          <FactorySelect
            style="width: 220px"
            autoSelect
            v-model.trim="waterPlantId"
          ></FactorySelect>
        </w-form-model-item>
      </w-form-model>
    </div>
    <div class="aeration-analysis">
      <!-- 左侧状态面板 -->
      <div class="status-panel">
        <div :class="[themeColor ? 'default-panel' : 'dark-panel']" class="mcp-panel">
          <div class="system-title">VACOMASS智能曝气控制系统</div>

          <!-- 溶解氧状态组 -->
          <div class="status-group">
            <div class="device-panel"><span>北池</span></div>
            <div v-for="(n, i) in controlNPointsData" :key="`north-${i}`" class="points-panel">
              <div class="group-title">
                <span class="title-text">溶解氧</span>
                <img
                  v-if="doStateNPointsData.JQBQ_I_0 == '1'"
                  src="@/assets/images/default/aeration/automatically_calculate.png"
                  class="tag"
                  alt="自动状态"
                />
                <img
                  v-else
                  src="@/assets/images/default/aeration/manual_calc.png"
                  class="tag"
                  alt="手动状态"
                />
              </div>
              <div class="status-item">
                <span>运行状态</span>
                <img
                  v-if="doStateNPointsData.JQBQ_I_0 == '1'"
                  src="@/assets/images/default/aeration/stop.png"
                  class="status-dot"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/images/default/aeration/run.png"
                  class="status-dot"
                  alt=""
                />
              </div>
              <div class="status-item">
                <span>氨氮</span>
                <span>{{ n.NH4_act }}</span>
              </div>
              <div class="status-item">
                <span>硝氮</span>
                <span>{{ n.NO3_act }}</span>
              </div>
            </div>
          </div>

          <!-- 南池状态组 -->
          <div class="status-group">
            <div class="device-panel"><span>南池</span></div>
            <div v-for="(s, i) in controlSPointsData" :key="`south-${i}`" class="points-panel">
              <div class="group-title">
                <span class="title-text">溶解氧</span>
                <img
                  v-if="doStateSPointsData.JQBQ_I_2 == '1'"
                  src="@/assets/images/default/aeration/automatically_calculate.png"
                  class="tag"
                  alt="自动状态"
                />
                <img
                  v-else
                  src="@/assets/images/default/aeration/manual_calc.png"
                  class="tag"
                  alt="手动状态"
                />
              </div>
              <div class="status-item">
                <span>运行状态</span>
                <img
                  v-if="doStateSPointsData.JQBQ_I_2 == '1'"
                  src="@/assets/images/default/aeration/stop.png"
                  class="status-dot"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/images/default/aeration/run.png"
                  class="status-dot"
                  alt=""
                />
              </div>
              <div class="status-item">
                <span>氨氮</span>
                <span>{{ s.NH4_act }}</span>
              </div>
              <div class="status-item">
                <span>硝氮</span>
                <span>{{ s.NO3_act }}</span>
              </div>
            </div>
          </div>

          <!-- 鼓风机组状态 -->
          <div class="status-group">
            <div v-for="(p, i) in pressurePointsData" :key="`pressure-${i}`" class="points-panel">
              <div class="status-item">
                <div class="pressure-panel">
                  <span class="device-text">鼓风机组</span
                  ><img
                    v-if="gfjStatePointsData.JQBQ_I_12 == '1'"
                    src="@/assets/images/default/aeration/automatically_calculate.png"
                    class="tag"
                    alt="自动状态"
                  />
                  <img
                    v-else
                    src="@/assets/images/default/aeration/manual_calc.png"
                    class="tag"
                    alt="手动状态"
                  />
                </div>
                <img
                  v-if="gfjStatePointsData.JQBQ_I_12 == '1'"
                  src="@/assets/images/default/aeration/stop.png"
                  class="status-dot"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/images/default/aeration/run.png"
                  class="status-dot"
                  alt=""
                />
              </div>
              <div class="status-item">
                <span>总管压力实测值</span>
                <span>{{ p.pressure_act }}</span>
                <span>mbar</span>
              </div>
              <div class="status-item">
                <span>总管压力计算值</span>
                <span>{{ p.manual_set }}</span>
                <span>mbar</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 鼓风机组主控制 MCP -->
        <div :class="[themeColor ? 'default-panel' : 'dark-panel']" class="mcp-panel">
          <div class="system-title">鼓风机组主控制 MCP</div>
          <div class="status-group">
            <div v-for="(m, i) in mcpPointsData" :key="`mcp-${i}`" class="points-panel">
              <div class="status-item">
                <span>1#鼓风机</span>
                <span>{{ m.Blower_current_1 }}</span>
                <img
                  v-if="runStatePointsData.JQBQ_I_8 == '1'"
                  src="@/assets/images/default/aeration/stop.png"
                  class="status-dot"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/images/default/aeration/run.png"
                  class="status-dot"
                  alt=""
                />
              </div>
              <div class="status-item">
                <span>2#鼓风机</span>
                <span>{{ m.Blower_current_2 }}</span>
                <img
                  v-if="runStatePointsData.JQBQ_I_9 == '1'"
                  src="@/assets/images/default/aeration/stop.png"
                  class="status-dot"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/images/default/aeration/run.png"
                  class="status-dot"
                  alt=""
                />
              </div>
              <div class="status-item">
                <span>3#鼓风机</span>
                <span>{{ m.Blower_current_3 }}</span>
                <img
                  v-if="runStatePointsData.JQBQ_I_10 == '1'"
                  src="@/assets/images/default/aeration/stop.png"
                  class="status-dot"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/images/default/aeration/run.png"
                  class="status-dot"
                  alt=""
                />
              </div>
              <div class="status-item">
                <span>4#鼓风机</span>
                <span>{{ m.Blower_current_4 }}</span>
                <img
                  v-if="runStatePointsData.JQBQ_I_11 == '1'"
                  src="@/assets/images/default/aeration/stop.png"
                  class="status-dot"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/images/default/aeration/run.png"
                  class="status-dot"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div class="status-group">
            <div class="points-panel">
              <div class="points-panel">
                <div class="status-item">
                  <span>系统接近最小风量提示</span>
                  <img
                    src="@/assets/images/default/aeration/run.png"
                    class="status-dot"
                    alt="运行"
                  />
                </div>
                <div class="status-item">
                  <span>系统接近最大风量提示</span>
                  <img
                    src="@/assets/images/default/aeration/run.png"
                    class="status-dot"
                    alt="运行"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧系统图 -->
      <div class="system-diagram">
        <!-- 北池系统图 -->
        <div class="pool-section">
          <div
            :class="[themeColor ? 'default-section-title' : 'dark-section-title']"
            class="section-title"
          >
            北池
          </div>
          <div class="section-img"></div>
          <div class="devices-container">
            <div v-for="(n, i) in northPointsData" :key="`north-${i}`" class="device-box">
              <div class="device-info">
                <div
                  :class="[themeColor ? 'default-device-title' : 'dark-device-title']"
                  class="device-title"
                >
                  <span>{{ 4 - i }}#溶解氧</span>
                  <span>{{ n.DO_act }}</span>
                </div>
                <div
                  :class="[themeColor ? 'default-device-data' : 'dark-device-data']"
                  class="device-data"
                >
                  <div class="data-title">
                    <span class="control-code"
                      >曝气手动控制 <i>{{ 4 - i }}#DO</i></span
                    >
                    <span>{{ n.code }}</span>
                  </div>
                  <div class="data-row">
                    <span>曝气流量</span>
                    <span>{{ n.Air_Flow }}</span>
                  </div>
                  <div class="data-row">
                    <span>阀门开度</span>
                    <span>{{ n.Stroke_Act }}</span>
                  </div>
                  <div class="data-row">
                    <span>溶解氧设定值</span>
                    <span>{{ n.DO_set }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 南池系统图 -->
        <div class="pool-section">
          <div
            :class="[themeColor ? 'default-section-title' : 'dark-section-title']"
            class="section-title"
          >
            南池
          </div>
          <div class="section-img"></div>
          <div class="devices-container">
            <div v-for="(n, i) in southPointsData" :key="`south-${i}`" class="device-box">
              <div class="device-info">
                <div
                  :class="[themeColor ? 'default-device-title' : 'dark-device-title']"
                  class="device-title"
                >
                  <span>{{ 4 - i }}#溶解氧</span>
                  <span>{{ n.DO_act }}</span>
                </div>
                <div
                  :class="[themeColor ? 'default-device-data' : 'dark-device-data']"
                  class="device-data"
                >
                  <div class="data-title">
                    <span class="control-code"
                      >曝气手动控制 <i>{{ 4 - i }}#DO</i></span
                    >
                    <span>{{ n.code }}</span>
                  </div>
                  <div class="data-row">
                    <span>曝气流量</span>
                    <span>{{ n.Air_Flow }}</span>
                  </div>
                  <div class="data-row">
                    <span>阀门开度</span>
                    <span>{{ n.Stroke_Act }}</span>
                  </div>
                  <div class="data-row">
                    <span>溶解氧设定值</span>
                    <span>{{ n.DO_set }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { infoData } from './data';
import uuid from '@/utils/uuid';
import { getRealDataByPointConfigCode } from '@/api/optimization';
import FactorySelect from '@/components/factory-select/index.vue';
import { POINTS_CONFIG, POINTS_LIST } from './constants';
import {
  processPointsData,
  processPressureData,
  processControlData,
  processMcpData,
  processRunStateData,
  processGfjStateData,
  processDoStateData,
  processDoStateSData
} from './utils';

export default {
  name: 'AerationAnalysis',
  components: {
    FactorySelect
  },
  inject: ['state'],
  data() {
    return {
      waterPlantId: '',
      pointsList: POINTS_LIST,
      pointsData: [],
      loading: false,
      timer: null,
      loadingInit: true,
      REFRESH_INTERVAL: 20000,
      southPointsData: [],
      northPointsData: [],
      mcpPointsData: [],
      controlNPointsData: [],
      controlSPointsData: [],
      pressurePointsData: [],
      runStatePointsData: {},
      gfjStatePointsData: {},
      doStateNPointsData: {},
      doStateSPointsData: {}
    };
  },
  computed: {
    themeColor() {
      return this.state.theme !== 'dark';
    }
  },
  methods: {
    async batchApiCall(items, apiCallFn) {
      if (this.loading) return [];
      try {
        if (this.loadingInit) {
          this.globalLoading.show({ domId: 'aeration' });
        }
        this.loading = true;
        const promises = items.map(async item => {
          try {
            return await apiCallFn(item);
          } catch (error) {
            console.error(`处理 ${item.name} 失败:`, error);
            return {
              group: item.group,
              error: true,
              code: uuid()
            };
          }
        });

        return await Promise.all(promises);
      } finally {
        if (this.loadingInit) {
          this.globalLoading.hide({ domId: 'aeration' });
        }
        this.loading = false;
      }
    },
    async fetchData() {
      if (!this.waterPlantId) return;
      try {
        const results = await this.batchApiCall(this.pointsList, async item => {
          let params = {
            configCode: item.code,
            pumpHouseId: this.waterPlantId
          };
          const res = await getRealDataByPointConfigCode(params);
          return {
            error: false,
            group: item.group,
            ...res,
            ...params
          };
        });

        this.pointsData = results.filter(item => !item.error);
        // this.pointsData = infoData;
        this.handlePointsData();
      } catch (error) {
        this.$message.error('数据加载失败');
        console.error('数据获取失败:', error);
      }
    },
    getPointsByGroup(group) {
      return this.pointsData.filter(item => item?.group === group) || [];
    },
    handlePointsData() {
      // 处理南北池数据
      this.southPointsData = processPointsData(this.getPointsByGroup(POINTS_CONFIG.SOUTH));
      this.northPointsData = processPointsData(this.getPointsByGroup(POINTS_CONFIG.NORTH));

      // 处理MCP和控制数据
      this.mcpPointsData = processMcpData(this.getPointsByGroup(POINTS_CONFIG.MCP));
      this.controlNPointsData = processControlData(this.getPointsByGroup(POINTS_CONFIG.CONTROL_N));
      this.controlSPointsData = processControlData(this.getPointsByGroup(POINTS_CONFIG.CONTROL_S));

      // 处理压力数据
      this.pressurePointsData = processPressureData(this.getPointsByGroup(POINTS_CONFIG.PRESSURE));

      // 处理各种状态数据
      this.runStatePointsData =
        processRunStateData(this.getPointsByGroup(POINTS_CONFIG.RUN_STATE))[0] || {};

      this.gfjStatePointsData =
        processGfjStateData(this.getPointsByGroup(POINTS_CONFIG.GFJ_STATE))[0] || {};

      this.doStateNPointsData =
        processDoStateData(this.getPointsByGroup(POINTS_CONFIG.DO_STATE_N))[0] || {};

      this.doStateSPointsData =
        processDoStateSData(this.getPointsByGroup(POINTS_CONFIG.DP_STATE_S))[0] || {};
    },

    startPolling() {
      this.stopPolling();
      this.fetchData();
      this.timer = setInterval(() => {
        this.loadingInit = false;
        this.fetchData();
      }, this.REFRESH_INTERVAL);
    },
    stopPolling() {
      if (this.timer) {
        this.loadingInit = true;
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.startPolling();
        } else {
          this.stopPolling();
        }
      }
    }
  },
  activated() {
    if (this.waterPlantId) {
      this.startPolling();
    }
  },
  deactivated() {
    this.stopPolling();
  },
  beforeDestroy() {
    this.stopPolling();
  }
};
</script>

<style lang="less" scoped>
.aeration {
  width: 100%;
  height: 100%;
  position: relative;
  &-head {
    height: 0px;
    width: 0px;
    border-radius: 4px;
    background: var(--supply-color-bg-card-DEFAULT);
    display: flex;
    align-items: center;
    padding: 0 12px;
    overflow: hidden;
  }
}
.aeration-analysis {
  display: flex;
  padding: 10px 14px;
  background: var(--supply-color-bg-card-DEFAULT);
  height: 100%;
  border-radius: 4px;

  .status-panel {
    width: 268px;
    margin-right: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .mcp-panel {
      border-radius: 4px;
      padding: 12px 15px;
    }
    .default-panel {
      background: url('~@/assets/images/default/aeration/aeration_control_system.png') no-repeat
        left top;
    }
    .dark-panel {
      background: url('~@/assets/images/dark/aeration/aeration_control_system.png') no-repeat left
        top;
    }
    .mcp-panel:first-child.default-panel {
      background-size: 100% 100%;
    }
    .mcp-panel:first-child.dark-panel {
      background-size: 100% 100%;
    }
    .mcp-panel:last-child.default-panel {
      background-size: cover;
    }
    .mcp-panel:last-child.dark-panel {
      background-size: cover;
    }

    .system-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 10px;
      text-align: center;
      color: var(--supply-color-main);
    }

    .status-group {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      padding: 10px 10px 6px 10px;
      border-radius: 4px;
      border-bottom: 1px solid var(--supply-color-invalid);
      &:last-child {
        border-bottom: none;
      }
    }
    .device-panel {
      flex-basis: 26%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 10px;
      color: var(--supply-color-main);
    }

    .points-panel {
      flex: 1 0 70%;
      display: flex;
      flex-direction: column;
      // gap: 2px;
    }

    .group-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .title-text {
        color: var(--supply-color-main);
        font-weight: 500;
        padding-left: 8px;
        border-left: 3px solid #1db151;
      }

      .tag {
        height: 20px;
        vertical-align: middle;
      }
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
  }
  .pressure-panel {
    display: flex;
    // justify-content: space-between;
    align-items: center;
    .device-text {
      color: var(--supply-color-main);
      margin-right: 10px;
    }
  }

  .status-dot {
    width: 24px;
    height: 24px;
  }

  .system-diagram {
    flex: 1;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .pool-section {
      border: 1px dashed #4285f470;
      height: 387px;
      border-radius: 4px;
      padding: 10px 0 10px 16px;
      position: relative;
      box-sizing: border-box;

      &:first-child {
        .default-device-data {
          background: url('~@/assets/images/default/aeration/manual_control.png') no-repeat;
          background-size: 100% 100%;
        }
        .dark-device-data {
          background: url('~@/assets/images/dark/aeration/manual_control.png') no-repeat;
          background-size: 100% 100%;
        }
      }

      &:last-child {
        .default-device-data {
          background: url('~@/assets/images/default/aeration/automatic_control.png') no-repeat;
          background-size: 100% 100%;
        }
        .dark-device-data {
          background: url('~@/assets/images/dark/aeration/automatic_control.png') no-repeat;
          background-size: 100% 100%;
        }
      }

      .section-title {
        width: 110px;
        height: 36px;
        font-size: 16px;
        font-weight: 500;
        color: var(--supply-rgb-color-primary-DEFAULT);
        position: absolute;
        top: 14px;
        left: 20px;
        line-height: 34px;
        text-align: center;
      }
      .default-section-title {
        background: url('~@/assets/images/default/aeration/north_pool_label.png') no-repeat left
          center;
      }
      .dark-section-title {
        background: url('~@/assets/images/dark/aeration/north_pool_label.png') no-repeat left center;
      }

      .section-img {
        width: 100%;
        height: 187px;
        background: url('~@/assets/images/default/aeration/north_pond.png') no-repeat center;
        background-size: contain;
      }

      .devices-container {
        // display: flex;
        // justify-content: space-between;
        // flex-wrap: wrap;
        margin-top: 4px;
        clear: both;

        .device-box {
          width: 19.6%;
          float: left;
          margin-right: 4.3%;
          margin-top: 8px;

          &:first-child {
            margin-left: 8px;
          }

          .device-info {
            .device-title {
              font-weight: 500;
              height: 28px;
              line-height: 28px;
              padding: 0 14px 0 20px;
              margin-bottom: 4px;
              color: var(--supply-color-main);

              display: flex;
              justify-content: space-between;
            }

            .default-device-title {
              background: url('~@/assets/images/default/aeration/dissolved_oxygen.png') no-repeat;
              background-size: 100% 100%;
            }
            .dark-device-title {
              background: url('~@/assets/images/dark/aeration/dissolved_oxygen.png') no-repeat;
              background-size: 100% 100%;
            }

            .device-data {
              height: 130px;
              padding: 10px 14px;
              .data-title {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                font-size: 14px;
                color: var(--supply-color-secondary);
                .control-code {
                  font-family: PingFangSC-Medium, sans-serif;
                  font-weight: 500;
                  color: var(--supply-color-main);
                  letter-spacing: 0;

                  i {
                    font-style: normal;
                    font-family: PingFangSC-Regular, sans-serif;
                    font-weight: 400;
                    letter-spacing: 0;
                    margin-right: 6px;
                    color: var(--supply-color-secondary);
                  }
                }
              }
              .data-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 14px;
                color: var(--supply-color-secondary);
              }
            }
          }
        }
      }
    }
  }
}
</style>
