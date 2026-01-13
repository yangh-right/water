<template>
  <div class="data-con supply-flex supply-flex-col">
    <search
      ref="timeInterval"
      class="right-header supply-bg-bg-card-DEFAULT"
      @search="onSearch"
    ></search>
    <div class="data-body supply-flex-1 supply-overflow-hidden">
      <div class="data-right">
        <chart-table
          :type="chartTable"
          :search-line-info="searchLineInfo"
          :search-run-info="searchRunInfo"
          :disPlayType="disPlay"
          :tips="tips"
          :itemConfig="itemConfig"
          :pointGroupCategory="pointGroupCategory"
        ></chart-table>
      </div>
    </div>
  </div>
</template>

<script>
import { getPointNameByPageOrType } from '@/api/runMonitor';
import chartTable from './chartTable.vue';
import search from './search.vue';
export default {
  name: 'dataCom',
  components: { chartTable, search },
  props: {
    // 导出泵房名称
    exportPumpName: {
      type: String,
      default: ''
    },
    // 组态点击导出监测量名称
    exportPointName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      curTab: '',
      itemConfig: {
        /* 是否显示导出按钮 */
        showExportButton: true,
        exportPumpName: this.exportPumpName || undefined,
        exportPointName: this.exportPointName || undefined
      },
      pointGroupCategory: {
        pointGroupCode: this.currentBut,
        pointGroupName: ''
      },
      updateTime: '',
      searchLineInfo: null,
      searchRunInfo: null,
      tips: '请选择设备或者监测量！',
      titleSearch: {
        dates: [
          {
            startTime: this.$moment()
              .subtract(1, 'hours')
              .format('YYYY-MM-DD HH:mm:ss'),
            endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
          }
        ],
        period: '1',
        timeEnum: 'MINUTES'
      },
      chartTable: '',
      deviceIds: [],
      pointIds: [],
      currentBut: 0,
      list: [],
      disPlay: null
    };
  },
  computed: {
    historyAnalysisBtn() {
      return this.$store.getters['setting/menuList'].find(v => v.buttonCode === 'historyAnalyse');
    }
  },
  mounted() {
    this.deviceIds = this.$attrs.detailData.deviceIds || [];
    this.pointIds = this.$attrs.detailData.pointIds || [];
    this.chartTable = this.$attrs.detailData.type;
    this.disPlay = {};
    this.getPointNameByPageOrType();
    this.changeSearch();
  },
  methods: {
    onSearch(val) {
      this.titleSearch = val;
      this.changeSearch();
    },
    changeSearch() {
      if (this.deviceIds.length > 0 && this.pointIds.length > 0) {
        const devicePoints = [];
        if (this.dataType === '0') {
          this.pointIds.forEach(p => {
            const point = p.split('-')[0];
            const deviceId = p.split('-')[1];
            const devicePoint = devicePoints.find(v => v.deviceId === deviceId);
            if (!devicePoint) {
              devicePoints.push({
                deviceId: deviceId,
                points: [point]
              });
            } else {
              if (!devicePoint.points.includes(point)) {
                devicePoint.points.push(point);
              }
            }
          });
        } else {
          if (this.deviceIds.length > 1) {
            this.deviceIds.forEach(dev => {
              devicePoints.push({
                deviceId: dev,
                points: this.pointIds
              });
            });
          } else {
            devicePoints.push({
              deviceId: this.deviceIds[0],
              points: this.pointIds
            });
          }
        }
        const params = {
          devicePoints,
          deviceType: 'INDUSTRY_DEVICE', // 设备类型
          displayType: [], // 监测量类型
          productCode: 'water_purification',
          ...this.titleSearch
        };
        this.searchLineInfo = params;
        this.tips = '';
      } else {
        this.tips = '请选择设备或者监测量！';
      }
    },

    /* 获取当前选中的监测量组 */
    getCurrentPointGroup(key) {
      this.pointGroupCategory.pointGroupCode = key;
      if (null !== this.list && this.list.length > 0) {
        let pointGroup = this.list.filter(item => item.pointGroupCode === key);
        if (
          pointGroup &&
          undefined !== pointGroup &&
          null !== pointGroup &&
          pointGroup.length > 0
        ) {
          this.pointGroupCategory.pointGroupName = pointGroup[0].pointGroupName;
        }
      }
    },
    getPointNameByPageOrType() {
      const params = {
        pumpId: this.$attrs.pumpId,
        platform: '1',
        pageCode: 'pump_detail'
      };
      getPointNameByPageOrType(params).then(res => {
        const { resultData } = res;
        const index = resultData?.length > 1 ? 1 : 0;
        this.currentBut = resultData[index]?.pointGroupCode || '';
        if (this.currentBut) {
          this.$refs.realData.changeData(this.currentBut);
        }
        this.curTab = resultData[index]?.pointGroupCode;
        this.list = resultData;
        this.getCurrentPointGroup(this.currentBut);
      });
    }
  }
};
</script>

<style lang="less" scoped>
.data-con {
  width: 100%;
  height: 100%;
  position: relative;
  .title-but {
    width: 86px;
    height: 28px;
    line-height: 26px;
    text-align: center;
    margin: 0 8px 8px 0;
    color: #646666;
    display: inline-block;
    cursor: pointer;
    border: 1px solid #dce0df;
    &.active {
      border: 1px solid #008184;
      color: #008184;
    }
  }
  /deep/.wpg-tabs-bar {
    margin: 0 0 2px 0;
  }
  /deep/.wpg-tabs-nav-wrap .wpg-tabs-nav > div {
    display: flex;
    justify-content: flex-start;
  }
  .data-body {
    margin-top: 12px;
    overflow: hidden;
    display: flex;

    .data-left {
      width: 45%;
      padding-top: 21px;
      margin-right: 6px;
    }

    .data-right {
      flex: 1;
      min-width: 0;
    }
  }
}
</style>
