<!-- 地图组件 -->
<template>
  <div class="container">
    <!-- 标题区域 -->
    <div :class="[themeColor ? 'default-title' : 'dark-title', 'pump-title']">
      <w-dropdown placement="bottomLeft" :trigger="['hover']">
        <div class="drop-name">{{ factoryName }}</div>
        <w-menu slot="overlay" :selectedKeys="[factoryId]" @click="changeSort">
          <w-menu-item v-for="item in factoryList" :key="item.id">{{ item.stationName }}</w-menu-item>
        </w-menu>
      </w-dropdown>
    </div>
    <!-- 3D配置图区域 -->
    <div class="configuration">
      <Configuration3D v-if="url3D" :graphIndex="url3D"></Configuration3D>
      <div v-else class="no-config">
        <img class="no-img" src="@/assets/images/default/icon_nothing.png" />
      </div>
    </div>
    <!-- 底部图表区域 -->
    <div class="footer">
      <div class="tool-box">
        <div class="title">过程分析</div>
        <div class="tool-icons">
          <div class="type">
            <w-radio-group v-model="line" size="small" button-style="solid">
              <w-radio-button v-for="item in lineList" :key="item.dictCode" :value="item.dictValue">
                {{ item.dictName }}
              </w-radio-button>
            </w-radio-group>
          </div>
        </div>
      </div>
      <div class="chart-body" :style="{ height: 'calc(100% - 28px)' }">
        <!-- 折线图展示 -->
        <div v-show="currentType === 'line'" class="chart-box">
          <div class="tabs">
            <div
              v-for="item in pointsArr"
              :key="item.pointName"
              :class="currentPoint === item.pointName ? 'tab active' : 'tab'"
              @click="handleChange(item)"
            >
              {{ item.pointMemo }}
            </div>
          </div>
          <div class="chart-wrapper">
            <line-chart
              v-if="chartShow"
              :darkTheme="'light'"
              powerType="powerSupply"
              :option="barOption"
              ref="inChart"
            ></line-chart>
            <div v-else class="tips">
              <w-empty id="ssmal" style="margin:auto" size="small"></w-empty>
            </div>
          </div>
        </div>
        <!-- 表格展示 -->
        <w-config-provider v-show="currentType === 'table'">
          <w-table
            rowKey="id"
            :columns="columns"
            :data-source="data"
            :scroll="scroll"
            :pagination="false"
          >
          </w-table>
          <template #renderEmpty>
            <w-empty id="ssmal" style="margin:auto;margin-top:29px;" size="small"></w-empty>
          </template>
        </w-config-provider>
      </div>
      <w-spin :spinning="loading" class="chart-spin"></w-spin>
    </div>
  </div>
</template>

<script>
// 导入相关依赖
import uuid from '@/utils/uuid';
import purificationLineMixin from '@/utils/mixins/purificationLineMixin.js';
import { toolIcon, processOption } from '../components/data.js';
import { processAnalysis } from '@/api/cockpit.js';
import { getPointCodeByPumpHouseId } from '@/api/optimization';
import Configuration3D from '@/views/runMonitor/components/configuration3D.vue';

export default {
  name: 'MapCmp',
  components: {
    Configuration3D,
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      line: '0', // 当前选中的线
      currentType: 'line', // 当前展示类型
      toolIcon, // 工具图标
      pointsArr: [], // 点位数组
      currentPoint: '1', // 当前选中的点位
      barOption: processOption, // 图表配置
      factoryList: [], // 工厂列表
      svgList: [], // SVG列表
      factoryId: '', // 当前选中的工厂ID
      factoryName: '', // 当前选中的工厂名称
      url3D: '', // 3D图URL
      svgId: '', // SVG ID
      columns: [], // 表格列配置
      baseTableData: [], // 基础表格数据
      data: [], // 表格数据
      loading: false, // 加载状态
      scroll: {
        x: 0,
        y: 0
      }
    };
  },
  mixins: [purificationLineMixin],
  inject: ['state'],
  computed: {
    // 主题颜色
    themeColor() {
      if (this.state.theme !== 'dark') {
        return true;
      } else {
        return false;
      }
    },
    // 图表是否显示
    chartShow() {
      return !!this.baseTableData[this.currentPoint];
    }
  },
  watch: {
    // 监听线变化
    line: {
      handler(val) {
        this.getTableData();
      },
      deep: true
    }
  },
  methods: {
    // 获取工厂列表
    async getFactoryList() {
      const { resultData, status } = await this.$http.post('waterPlantClient/getWaterPlants');
      if (status === 'complete' && resultData?.length > 0) {
        this.factoryList = resultData;
        this.factoryId = this.factoryList[0].id;
        this.factoryName = this.factoryList[0].stationName;
        this.get3DUrl();
        this.getPointList();
        this.$emit('handleChange', this.factoryId);
      }
    },
    // 获取3D图URL
    async get3DUrl() {
      let res = await this.$http.post(`/svg/manager/getSvgListByCondition`, {
        stationIds: [this.factoryId],
        type: 'complete_flow'
      });
      let { status, resultData } = res;
      if (status === 'complete' && resultData?.length > 0) {
        let i = resultData[0]?.previewUrl.indexOf('/wpgEditor');
        this.url3D = resultData[0]?.previewUrl.slice(i);
      } else {
        this.url3D = '';
      }
    },
    // 获取点位列表
    async getPointList() {
      this.pointsArr = [];
      let params = {
        pumpHouseId: this.factoryId,
        groupType: 'complete_flow'
      };
      let { resultData, status } = await getPointCodeByPumpHouseId(params);
      if (status === 'complete') {
        this.pointsArr =
          resultData?.map(item => {
            return {
              pointName: item,
              pointMemo: item
            };
          }) || [];
        this.currentPoint = this.pointsArr[0].pointName;
        this.getTableData();
      }
    },
    // 切换工厂
    changeSort(e) {
      this.factoryList.forEach((item, index) => {
        if (item.id === e.key) {
          this.factoryId = item.id;
          this.factoryName = item.stationName;
        }
      });
      this.get3DUrl();
      this.getPointList();
      this.$emit('handleChange', e.key);
    },
    // 获取表格数据
    async getTableData() {
      this.loading = true;
      let pointsArr = this.pointsArr.map(item => item.pointName);
      let params = {
        pointCode: pointsArr,
        waterPlantId: this.factoryId,
        line: this.line
      };
      let { status, resultData } = await processAnalysis(params);
      this.loading = false;
      if (status === 'complete' && Object.keys(resultData).length > 0) {
        this.baseTableData = resultData;
        this.handleChart();
        this.dealData();
      } else {
        this.barOption.xAxis[0].data = [];
        this.barOption.series[0].data = [];
        this.columns = [];
        this.data = [];
      }
    },
    // 处理图表数据
    handleChart() {
      if (!this.baseTableData[this.currentPoint]) return false;
      let { xList = [], yList = [] } = this.baseTableData[this.currentPoint];
      this.barOption.xAxis[0].data = xList;
      this.barOption.series[0].data = yList.map(v => (!!v ? v : null));
      this.barOption.series[0].areaStyle = {
        color: {
          type: 'linear',
          x: 0,
          y: 1,
          x2: 1,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(46,221,249,0.5)'
            },
            {
              offset: 1,
              color: 'rgba(53,130,255,0.5)'
            }
          ]
        }
      };
    },
    // 切换点位
    handleChange(item) {
      this.currentPoint = item.pointName;
      this.handleChart();
    },
    // 处理数据
    dealData() {
      let tableData = JSON.parse(JSON.stringify(this.baseTableData));
      let keys = Object.keys(this.baseTableData);
      if (keys.length === 0) return;
      this._dealTableData(tableData);
    },
    // 处理表格数据
    _dealTableData(data) {
      let arr = [];
      let baseColumns = [
        {
          title: '',
          align: 'center',
          width: 100,
          dataIndex: 'pointMemo'
        }
      ];

      Object.keys(data).forEach((key, i) => {
        let record = {};
        let point = this.pointsArr.filter(item => item.pointName === key);
        record['id'] = uuid();
        record['pointMemo'] = point.length > 0 ? point[0]['pointMemo'] : '--';
        let { xList = [], yList = [] } = data[key];
        // 处理表头数据
        if (i === 0) {
          xList.forEach(item => {
            baseColumns.push({
              title: `${item}`,
              align: 'center',
              ellipsis: true,
              width: 120,
              dataIndex: `${item}`,
              customRender: (text, row, index) => {
                let _text = text || text == '0' ? text : '--';
                return _text;
              }
            });
          });
        }
        //处理数据
        for (let k = 0; k < yList.length; k++) {
          record[xList[k]] = yList[k];
        }
        arr.push(record);
      });
      this.columns = baseColumns;
      this.data = arr.map(item => {
        return {
          ...item,
          pointMemo: item.pointMemo == 'NH3N' ? 'NH₃-N' : item.pointMemo
        };
      });
      this.useEffect();
    },
    // 切换类型
    handlerType(type) {
      this.currentType = type;
    },
    // 调整表格高度
    useEffect() {
      this.$nextTick(() => {
        if (document.querySelector('.chart-body')) {
          const boxHeight = document.querySelector('.chart-body').clientHeight;
          const headerHeight = document.querySelector('.wpg-table-thead')?.offsetHeight || 0;
          this.scroll = {
            x: 545,
            y: boxHeight - headerHeight - 40
          };
        }
      });
    }
  },
  created() {
    this.getFactoryList();
  },
  mounted() {
    window.onresize = () => {
      this.useEffect();
    };
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.container {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  .factory-box {
    width: 234px;
    height: 300px;
    background: red;
  }

  .pump-title {
    width: 100%;
    line-height: 44px;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    font-size: 20px;
    letter-spacing: 0;
    text-align: center;
    flex: 0 0 44px;
  }
  .default-title {
    color: #728dac;
    background: url('~@/assets/images/default/station_nam.png') no-repeat center center;
    background-size: 100% 100%;
    background-color: var(--bgc4);
  }
  .dark-title {
    color: #ffffff;
    background: url('~@/assets/images/dark/station_nam.png') no-repeat center center;
    background-size: 100% 100%;
    background-color: var(--bgc4);
  }
  .drop-name {
    width: 234px;
    margin: 0 auto;
    cursor: pointer;
  }
  .configuration {
    height: calc(100% - 288px);
    background: var(--bgc4);
    flex: 0 1 calc(100% - 288px);

    .no-config {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      height: 100%;
      .no-img {
        height: 60%;
      }
    }
  }
  .footer {
    height: 232px;
    padding: 12px;
    box-sizing: border-box;
    margin-top: 12px;
    background: var(--bgc4);
    border-radius: 4px;
    position: relative;
    .chart-spin {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 10;
      transform: translate(-50%, -50%);
    }

    .tool-box {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;
      }
      .type {
        display: inline-block;
        position: relative;
        right: 12px;
      }
      .tool-icon {
        cursor: pointer;
        margin-right: 8px;

        &.active {
          color: var(--supply-color-primary-DEFAULT);
        }
      }
      .wpg-btn {
        border-color: var(--supply-color-bg-card-DEFAULT) !important;
        box-shadow: none;
      }
    }
    .chart-box {
      height: 178px;
      position: relative;

      .tabs {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-top: 8px;
        cursor: pointer;
        .tab {
          height: 24px;
          line-height: 24px;
          margin-right: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 15px;
          background: var(--supply-rgb-color-bg-DEFAULT);
          border: 1px solid var(--supply-rgb-color-bg-DEFAULT);
          color: var(--supply-color-secondary);
          border-radius: 12px;
          font-size: 14px;
        }
        .active {
          color: var(--supply-color-online);
        }
      }
      .chart-wrapper {
        width: 100%;
        height: calc(100% - 36px);
        position: relative;

        .tips {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
      }
      .chart-spin {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 10;
        transform: translate(-50%, -50%);
      }
    }

    .form-unit {
      color: var(--supply-color-third);
    }
    /deep/.wpg-table-body {
      max-height: 138px !important;
    }
  }
}
</style>
