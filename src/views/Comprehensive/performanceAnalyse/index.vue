<template>
  <div class="performanceAnalyse">
    <table-search class="plan-manage-list">
      <w-row slot="form" :gutter="12">
        <w-col :span="6">
          <w-form-item :label="`选择${textReplace}:`" v-bind="layout">
            <factory-select
              v-model="options.waterPlantId"
              autoSelect
              :showAll="!autoSelect"
              @input="getStructureByStationId"
            ></factory-select>
          </w-form-item>
        </w-col>
        <w-col :span="6">
          <w-form-item label="设备关键词:" v-bind="layout">
            <w-input
              v-model="options.keyword"
              placeholder="请输入设备名称/规格型号/编号"
              allowClear
            ></w-input>
          </w-form-item>
        </w-col>
        <w-col :span="6">
          <w-form-item label="选择日期:" v-bind="layout">
            <w-date-picker v-model="options.dayTime" style="width: 100%;" :allowClear="false" />
          </w-form-item>
        </w-col>
        <w-col class="supply-float-right">
          <w-form-item>
            <w-button class="supply-mr-3" @click="handleReset" icon="reload">重置</w-button>
            <w-button type="primary" @click="search" icon="search">查询</w-button>
            <return-control
              class="supply-ml-3"
              :is-drill-down="true"
              path="/Comprehensive/performanceSelfTest"
            ></return-control>
          </w-form-item>
        </w-col>
      </w-row>
      <div class="chart-flex">
        <template v-if="chartData.length > 0">
          <div class="chart-item" v-for="(item, index) of chartData" :key="index">
            <div class="item">
              <analyseChart
                :title="'设备对比值-' + item.equipmentName"
                :chartData="item.historyDataList"
              />
            </div>
            <div class="appraise">
              <div class="appraise-header">
                <div class="text">
                  <span></span>
                  <div class="appraise-title">综合评价-{{ item.equipmentName }}</div>
                </div>
                <img src="@/assets/icons/corner_mark.png" />
              </div>
              <div class="appraise-content" v-if="item.evaluationList.length">
                <div class="content-item" v-for="(it, i) of item.evaluationList" :key="i">
                  <div class="sign"></div>
                  <div class="item-text">
                    {{ it }}
                  </div>
                </div>
              </div>
              <w-empty v-else />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="chart-item">
            <div class="item">
              <analyseChart :title="'设备对比值'" :chartData="[]" />
            </div>
            <div class="appraise">
              <div class="appraise-header">
                <div class="text">
                  <span></span>
                  <div class="appraise-title">综合评价</div>
                </div>
                <img src="@/assets/icons/corner_mark.png" />
              </div>
              <w-empty class="empty" />
            </div>
          </div>
        </template>
        <div class="pagination">
          <w-pagination
            :current="page.current"
            :pageSize="page.pageSize"
            :total="total"
            :show-total="total => `共 ${total} 条`"
            @change="paginationChange"
          />
        </div>
      </div>
    </table-search>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import moment from 'moment';
import {
  sysDictListByCode,
  getStructureByStationId,
  deviceCompareCurve
} from '@/api/deviceManagement';
import FactorySelect from '@/components/factory-select/index';
import DeviceType from '../components/DeviceType.vue';
import analyseChart from './analyseChart.vue';

export default {
  name: 'performanceAnalyse',
  components: {
    FactorySelect,
    DeviceType,
    analyseChart
  },
  data() {
    return {
      chartData: [],
      options: {
        keyword: '',
        waterPlantId: undefined,
        dayTime: moment()
      },
      layout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      page: {
        current: 1,
        pageSize: 2
      },
      total: 2,
      tableLoading: false,
      placeIdList: []
    };
  },
  computed: {
    ...mapState('configure', ['textReplace']),
    ...mapGetters('device', ['currentDeviceType']),
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    }
  },
  watch: {},

  mounted() {
    this.search();
  },
  methods: {
    /**
     * 异步获取安装地址（构筑物、仓库）列表
     */
    async getStructureByStationId() {
      try {
        this.options.placeId = '';
        let params = {
          waterPlantId: this.options.waterPlantId ? this.options.waterPlantId : ''
        };
        const { resultData } = await getStructureByStationId(params);
        if (!resultData) {
          console.error('No data returned for getStructureByStationId');
          return;
        }
        this.placeIdList = resultData.map(item => ({
          label: item.name,
          value: item.id,
          ...item
        }));
      } catch (error) {
        console.error('Error fetching structure data:', error);
      }
    },
    async getDeviceCompareLine() {
      this.loading = true;
      try {
        let params = {
          page: {
            current: this.page.current,
            size: this.page.pageSize
          },
          ...this.options,
          startDateTime: moment(this.options.dayTime).format('YYYY-MM-DD 00:00:00'),
          endDateTime: moment(this.options.dayTime).format('YYYY-MM-DD 23:59:59')
        };
        const { status, resultData } = await deviceCompareCurve(params);
        if (status === 'complete') {
          console.log('resultData', resultData);
          this.chartData = resultData.records;
          this.total = resultData.total;
          this.loading = false;
        } else {
          this.loading = false;
          throw new Error('数据获取不完整');
        }
      } catch (error) {
        this.dataSource = [];
        this.loading = false;
        console.error('获取设备参数失败:', error);
        // 可以在这里添加弹窗提示等用户友好的错误处理
      }
    },
    // 重置
    handleReset() {
      this.options = {
        keyword: '',
        waterPlantId: this.options.waterPlantId,
        dayTime: moment()
      };
      this.search();
    },
    search() {
      this.page.current = 1;
      this.getDeviceCompareLine();
    },
    // 分页改变时的处理逻辑
    paginationChange(page) {
      this.page.current = page;
      this.getDeviceCompareLine();
    }
  }
};
</script>

<style lang="less" scoped>
.performanceAnalyse {
  width: 100%;
  height: 100%;
}
/deep/.table-page-list-container {
  .chart-flex {
    width: 100%;
    height: 100%;
    background: var(--supply-color-bg-card-DEFAULT);
    padding: 16px 12px;
    position: relative;
    .chart-item {
      width: 100%;
      height: 47%;
      display: flex;
      align-content: center;
      justify-content: space-between;
      margin-bottom: 10px;
      .item {
        width: calc(100% - 320px);
        height: 100%;
      }
      .appraise {
        width: 300px;
        height: 100%;
        box-shadow: 0 2px 4px 0 var(--bsc2);
        position: relative;
        .empty {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        &-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          height: 42px;
          background: linear-gradient(
            to bottom,
            var(--supply-color-bg-linear-gradient-s) 50%,
            var(--supply-color-bg-linear-gradient-e)
          );
          .text {
            height: 32px;
            display: flex;
            align-items: center;
            padding: 0px 12px;
            span {
              display: inline-block;
              width: 4px;
              height: 18px;
              background: var(--supply-color-auxiliary);
            }
            .appraise-title {
              font-weight: 600;
              font-size: 16px;
              color: var(--supply-color-main);
              letter-spacing: 0;
              margin-left: 8px;
            }
          }
          img {
            width: 32px;
            height: 32px;
          }
        }
        &-content {
          width: 100%;
          height: calc(100% - 52px);
          margin-top: 10px;
          padding: 0 10px 10px;
          overflow-y: auto;
          .content-item {
            width: 100%;
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            .sign {
              width: 5px;
              height: 5px;
              background: #3678ff;
              border-radius: 5px;
              margin-top: 8px;
              margin-right: 6px;
            }
            .item-text {
              width: 100%;
              word-break: break-word;
              /* 或 */
              overflow-wrap: break-word;
              white-space: normal;
            }
          }
        }
      }
    }
    .pagination {
      position: absolute;
      bottom: 12px;
      right: 12px;
    }
  }
}
/deep/.table-page-search-wrapper {
  padding: 12px 24px !important;
}
</style>
