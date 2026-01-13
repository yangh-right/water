<template>
  <div class="predictOutcome">
    <div class="along-head">
      <w-tabs class="tab-wrap" size="large" v-model="tab">
        <w-tab-pane v-if="buttonCodes['outerPredict']" key="2" tab="出水预测结果">
          <div class="tab-content">
            <div
              class="content-item point-item"
              v-for="item of waterList"
              :key="item.label"
              :class="item.flag ? 'placeholder' : ''"
            >
              <span class="title" v-if="!item.flag"> {{ item.label }} </span>
              <chart
                v-if="!item.flag"
                :key="item.label"
                :flag="false"
                :showTimeLine="tab === '2'"
                :waterPlantId="waterPlantId"
                :chartItem="item"
                :signedPv="item.signedPv"
                :rangeTime="rangeTime"
              />
            </div>
          </div>
        </w-tab-pane>
        <w-tab-pane v-if="buttonCodes['processPredict']" key="1" tab="过程预测结果">
          <div class="tab-content">
            <div
              class="content-item"
              v-for="item of courseList"
              :key="item.label"
              :class="item.flag ? 'placeholder' : ''"
            >
              <span class="title" v-if="!item.flag"> {{ item.label }} </span>
              <chart
                v-if="!item.flag"
                :flag="true"
                :key="item.label"
                :waterPlantId="waterPlantId"
                :chartItem="item"
                :rangeTime="rangeTime"
              />
            </div>
          </div>
        </w-tab-pane>
      </w-tabs>
      <div class="search">
        <w-button
          icon="download"
          v-if="tab === '2'"
          class="supply-mr-3"
          @click="download"
          slot="titleRight"
          >导出</w-button
        >
        <div v-if="buttonCodes['simulate'] && !!simulate && false" class="supply-mr-5">
          模拟开关：
          <w-switch
            size="small"
            :checked="simulate.status"
            @change="setStatus(simulate.id, !simulate.status)"
          />
        </div>
        <div class="supply-mr-5">
          时间范围：
          <w-range-picker
            v-model="rangeTime"
            show-time
            :disabled-date="disabledDate"
            :allowClear="true"
            @calendarChange="onCalendarChange"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </div>
        <div>
          选择污水厂：
          <FactorySelect
            style="width:220px"
            autoSelect
            @change="factoryChange"
            v-model="waterPlantId"
          ></FactorySelect>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';
import FactorySelect from '@/components/factory-select/index.vue';
import { courseList, waterList } from './data';
import { exportFile } from '@/utils/util';
import {
  GetSysParamPage, // 分页查询
  ChangeStatus,
  exportEffluentQualityControl
} from '@/api/analysis';
export default {
  name: 'predictOutcome',
  components: {
    FactorySelect,
    chart: () => import('./chart.vue')
  },
  data() {
    return {
      tab: '2',
      placement: 'right',
      courseList,
      waterList,
      rangeTime: [moment().subtract(14, 'days'), moment()],
      currentDate: null,
      timeType: 'day',
      waterPlantId: '',
      simulate: undefined
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  watch: {},
  activated() {
    this.tab = this.$route.query.tab || this.tab;
  },
  methods: {
    async loadData() {
      let params = {
        page: {
          current: 1,
          size: 999
        }
      };
      await GetSysParamPage(params).then(res => {
        if (res.status === 'complete') {
          this.systemList = res.resultData.records;
          this.simulate = this.systemList.find(r => r.code === 'simulate');
        }
      });
    },
    /* 导出 */
    download() {
      let startTime = this.rangeTime.length
        ? moment(this.rangeTime[0]).format('YYYY-MM-DD HH:mm:ss')
        : moment()
            .subtract(12, 'hours')
            .format('YYYY-MM-DD HH:mm:ss');
      let endTime = this.rangeTime.length
        ? moment(this.rangeTime[1])
            .add(24, 'hours')
            .format('YYYY-MM-DD HH:mm:ss')
        : moment()
            .add(24, 'hours')
            .format('YYYY-MM-DD HH:mm:ss');
      let params = {
        startTime,
        pointConfigCodeList: this.waterList
          .filter(item => item.superiorCode)
          .map(item => item.superiorCode),
        queryType: 'day',
        endTime,
        waterPlantId: this.waterPlantId
      };
      exportEffluentQualityControl(params).then(res => {
        exportFile(res, '出水预测结果');
      });
    },
    /** 设置是否有效 */
    setStatus(id, status) {
      this.originWaterPlantId = this.waterPlantId;
      this.$confirm({
        title: '提示',
        content: '确定要修改吗?',
        onOk: async () => {
          let res = await ChangeStatus(`?id=${id}&status=${status}`);
          if (res.status === 'complete') this.$message.success('修改成功！');
          this.waterPlantId = '';
          this.loadData();
          this.$nextTick(() => {
            this.waterPlantId = this.originWaterPlantId;
          });
        }
      });
    },
    /* 禁选时间 */
    disabledDate(current) {
      if (this.currentDate) {
        let one = 30 * 24 * 3600 * 1000;
        let minTime = this.currentDate - one;
        let maxTime = this.currentDate + one;
        let lastTime = this.$moment().endOf(this.timeType);
        maxTime = maxTime > lastTime ? lastTime : maxTime;
        return current < minTime || current > maxTime;
      } else {
        return current && current > this.$moment().endOf(this.timeType);
      }
    },
    onCalendarChange(date) {
      if (date[0] && !date[1]) {
        this.currentDate = date[0];
      } else if (date[0] && date[1]) {
        this.currentDate = null;
      }
    },
    factoryChange() {}
  },
  created() {
    this.loadData();
  }
};
</script>

<style lang="less" scoped>
.predictOutcome {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;

  .along-head {
    position: relative;
    height: 100%;
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
    .search {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: absolute;
      right: 7px;
      top: 7px;
    }
  }
  /deep/.wpg-tabs-content {
    height: calc(100% - 62px);
    .wpg-tabs-tabpane {
      height: 100%;
    }
  }
  .tab-content {
    display: flex;
    width: 100%;
    border-radius: 4px;
    height: 100%;
    overflow-y: auto;
    margin-top: 12px;
    justify-content: space-between;
    flex-wrap: wrap;

    .content-item {
      width: 32.9%;
      height: 48.3%;
      background: var(--supply-color-bg-card-DEFAULT);
      border-radius: 4px;

      padding: 12px 12px 4px 12px;
      margin-bottom: 12px;
      .title {
        font-weight: 500;
        font-size: 14px;
        color: var(--supply-color-main);
      }
    }
    .point-item {
      width: 49.7%;
    }
    .placeholder {
      background: none !important;
    }
  }
  .card-box {
    width: 100%;
    position: relative;
  }
  /deep/.wpg-drawer-body {
    padding: 12px !important;
  }
  /deep/.wpg-drawer-wrapper-body {
    overflow: hidden;
  }
}
/deep/.wpg-drawer-mask {
  background-color: rgba(0, 0, 0, 0);
}
</style>
