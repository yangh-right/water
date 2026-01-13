<template>
  <div class="container">
    <!-- <div :class="[themeColor ? 'default-title' : '', 'pump-title']">
      <w-dropdown placement="bottomLeft" :trigger="['hover']">
        <div class="drop-name">{{ factoryName }}</div>
        <w-menu slot="overlay" :selectedKeys="[factoryId]" @click="changeSort">
          <w-menu-item v-for="item in factoryList" :key="item.id">{{
            item.stationName
          }}</w-menu-item>
        </w-menu>
      </w-dropdown>
    </div> -->
    <div class="configuration">
      <Configuration3D v-if="url3D" :graphIndex="url3D"></Configuration3D>
      <div v-else class="no-config">
        <img class="no-img" src="@/assets/images/default/icon_nothing.png" />
      </div>
    </div>
    <div v-if="false" class="footer">
      <div class="tool-box">
        <div class="title">过程分析</div>
        <div class="tool-icons">
          <w-icon
            v-for="item in toolIcon"
            :key="item.icon"
            :title="item.title"
            :type="item.icon"
            :class="`tool-icon ${item.type === currentType ? 'active' : ''}`"
            @click="handlerType(item.type)"
          ></w-icon>
        </div>
      </div>
      <div class="chart-body" :style="{ height: 'calc(100% - 28px)' }">
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
        <w-config-provider v-show="currentType === 'table'">
          <w-table :columns="columns" :data-source="data" :scroll="scroll" :pagination="false">
          </w-table>
          <template #renderEmpty>
            <w-empty id="ssmal" style="margin:auto;margin-top:29px;" size="small"></w-empty
          ></template>
        </w-config-provider>
      </div>
      <w-spin :spinning="loading" class="chart-spin"></w-spin>
    </div>
  </div>
</template>

<script>
import uuid from '@/utils/uuid';
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
      currentType: 'line',
      toolIcon,
      pointsArr: [],
      currentPoint: '1',
      barOption: processOption,
      factoryList: [],
      svgList: [],
      factoryId: '',
      factoryName: '',
      url3D: '',
      svgId: '',
      columns: [],
      baseTableData: [],
      data: [],
      loading: false,
      scroll: {
        x: 0,
        y: 0
      }
    };
  },
  inject: ['state'],
  computed: {
    chartShow() {
      return !!this.baseTableData[this.currentPoint];
    }
  },
  watch: {},
  methods: {
    async getFactoryList() {
      // 设备列表
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
    async get3DUrl() {
      // 组态图列表
      let res = await this.$http.post(`/svg/manager/getSvgListByCondition`, {
        stationIds: [this.factoryId],
        type: 'complete_flow'
      });
      // 选择第一项
      let { status, resultData } = res;
      if (status === 'complete' && resultData?.length > 0) {
        let i = resultData[0]?.previewUrl.indexOf('/wpgEditor');
        this.url3D = resultData[0]?.previewUrl.slice(i);
      } else {
        this.url3D = '';
      }
    },
    async getPointList() {
      this.pointsArr = [];
      let params = {
        pumpHouseId: this.factoryId, //传水厂id
        groupType: 'complete_flow' //进水
      };
      let { resultData, status } = await getPointCodeByPumpHouseId(params);
      if (status === 'complete' && Object.keys(resultData).length > 0) {
        let pointsArr = [];
        Object.keys(resultData).forEach(key => {
          let obj = {};
          obj['pointName'] = resultData[key];
          obj['pointMemo'] = key;
          pointsArr.push(obj);
        });
        this.pointsArr = pointsArr.reverse();
        this.currentPoint = this.pointsArr[0].pointName;
        this.getTableData();
      }
    },
    // changeSort(e) {
    //   this.factoryList.forEach((item, index) => {
    //     if (item.id === e.key) {
    //       this.factoryId = item.id;
    //       this.factoryName = item.stationName;
    //     }
    //   });
    //   this.get3DUrl();
    //   this.getPointList();
    //   this.$emit('handleChange', e.key);
    // },
    async getTableData() {
      this.loading = true;
      let pointsArr = this.pointsArr.map(item => item.pointName);
      let params = {
        pointCode: pointsArr,
        waterPlantId: this.factoryId
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
    handleChart() {
      if (!this.baseTableData[this.currentPoint]) return false;
      let { xList = [], yList = [] } = this.baseTableData[this.currentPoint];
      this.barOption.xAxis[0].data = xList;
      this.barOption.series[0].data = yList;
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
    handleChange(item) {
      this.currentPoint = item.pointName;
      this.handleChart();
    },
    dealData() {
      let tableData = JSON.parse(JSON.stringify(this.baseTableData));
      let keys = Object.keys(this.baseTableData);
      if (keys.length === 0) return;
      this._dealTableData(tableData);
    },
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
                let _text = text || '--';
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
      this.data = arr;
      this.useEffect();
    },
    handlerType(type) {
      this.currentType = type;
    },
    useEffect() {
      this.$nextTick(() => {
        if (document.querySelector('.chart-body')) {
          const boxHeight = document.querySelector('.chart-body').clientHeight;
          const headerHeight = document.querySelector('.wpg-table-thead')?.offsetHeight || 0;
          this.scroll = {
            x: 545,
            y: boxHeight - headerHeight
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

  .configuration {
    height: 100%;

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
          background: #f4f6f8;
          color: #666666;
          border-radius: 12px;
          font-size: 14px;
        }
        .active {
          color: #5b8ff9;
          background: #5b8ff91a;
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
  }
}
</style>
