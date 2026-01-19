<template>
  <div class="predictOutcome">
    <div class="along-head">
      <div class="tab-wrap" size="large" v-model="tab">
        <div class="tab-content">
          <process-content :waterPlantId="waterPlantId" :dateTime="dateTime" :lineCode="lineCode" />
        </div>
      </div>
      <div class="search">
        <div class="supply-mr-5">
          时间日期：
          <w-date-picker
            v-model="dateTime"
            show-time
            :disabled-date="disabledDate"
            :allowClear="true"
            :show-time="{ format: 'HH:00' }"
            format="YYYY-MM-DD HH:mm"
            valueFormat="YYYY-MM-DD HH:00:00"
            @calendarChange="onCalendarChange"
          />
        </div>
        <div class="supply-mr-5">
          线段：
          <w-select v-model="lineCode" placeholder="请选择线段" style="width:180px">
            <w-select-option
              v-for="video in processingList"
              :key="video.dictCode"
              :value="video.dictCode"
              :allowClear="true"
              >{{ video.dictName }}</w-select-option
            >
          </w-select>
        </div>
        <div class="supply-mr-5">
          选择净水厂：
          <FactorySelect
            style="width:180px"
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
import ProcessContent from './processContent.vue';
import { courseList, waterList } from './data';
import { sysDictListByCode } from '@/api/manage';
import {
  GetSysParamPage, // 分页查询
  ChangeStatus
} from '@/api/analysis';
export default {
  name: 'predictOutcome',
  components: {
    FactorySelect,
    ProcessContent,
    chart: () => import('./chart.vue'),
  },
  data() {
    return {
      placement: 'right',
      courseList,
      waterList,
      dateTime: moment()
        .subtract(2, 'hours')
        .format('YYYY-MM-DD HH:00:00'),
      rangeTime: [moment().subtract(14, 'days'), moment()],
      lineCode: undefined,
      processingList: [],
      processingDict: {},
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
    //字典code
    async getDict() {
      let { resultData, status } = await sysDictListByCode('purification_line');
      if (status === 'complete') {
        this.processingList = resultData.map(item => ({
          dictCode: item.dictName === '南线' ? 0 : 1,
          dictName: item.dictName
        }));
        this.lineCode = this.processingList?.[0]?.dictCode;
      }
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
    goToPredictWarning() {
      this.drillDown({
        path: '/alarmCenter',
        query: {
          alarmTypeCode: 'water_purification_yujing'
        }
      });
    },
    goToSimulate() {
      this.drillDown({
        path: '/runPredict/optimalDecision'
      });
    },
    factoryChange() {}
  },
  created() {
    this.getDict();
    this.loadData();
  }
};
</script>

<style lang="less" scoped>
.predictOutcome {
  height: 100%;
  overflow-x: hidden;
  position: relative;

  .along-head {
    position: relative;
    height: 100%;
    /deep/ .tab-wrap {
      height: 100%;
      .wpg-tabs-nav {
        height: 20px;
      }
      .wpg-tabs-nav-wrap {
        background: var(--supply-color-bg-card-DEFAULT);
        height: 20px;
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
      left: 7px;
      top: 12px;
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
    overflow-y: hidden;
    justify-content: flex-start;
    gap: 12px;
    flex-wrap: wrap;

    .content-item {
      width: 32.9%;
      height: 48.3%;
      background: var(--supply-color-bg-card-DEFAULT);
      border-radius: 4px;

      padding: 12px 12px 4px 12px;
      /* margin-bottom: 12px; */
      .title {
        font-weight: 500;
        font-size: 14px;
        color: var(--supply-color-main);
      }
    }
    .point-item {
      width: calc(50% - 6px);
    }
    .pool-item {
      width: calc(33.3% - 8px);
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
