<template>
  <div>
    <TheModal
      title="水质指标标准详情"
      :visible="visible"
      @submit="handleSubmit"
      :zIndex="99"
      :info="info"
      @cancel="handleCancel"
      v-loading="loading"
    >
      <template #header>
        <w-button type="primary" style="margin-bottom: 16px" @click="operate('editStandard')"
          >编辑标准</w-button
        >
      </template>
      <template #topExtra>
        <p class="wfc2" style="margin: 18px 0 0 0">
          标准定义：
          <span style="margin-right: 40px">
            <div class="warning color-orange"><span class="warning-content">!</span></div>
            <template v-if="info">
              <span class="warning-color">{{ info.warningName }}</span>
              <span
                v-if="
                  !['in', 'ni'].includes(info.warningOpt) && !['bt', 'nb'].includes(info.warningOpt)
                "
              >
                {{ operatorsDict[info.warningOpt] }}{{ info.warningValue }}
              </span>
              <span
                v-else-if="
                  !['in', 'ni'].includes(info.warningOpt) && ['bt', 'nb'].includes(info.warningOpt)
                "
              >
                {{ operatorsDict[info.warningOpt] }}{{ info.warningMin }}~{{ info.warningMax }}
              </span>
              <span v-else> {{ operatorsDict[info.warningOpt] }}：{{ info.warningRange }} </span>
            </template>
          </span>
          <span>
            <div class="warning color-red"><span class="warning-content">!</span></div>

            <template v-if="info">
              <span class="error-color">{{ info.limitName }}</span>
              <span
                v-if="
                  !['in', 'ni'].includes(info.limitOpt) && !['bt', 'nb'].includes(info.limitOpt)
                "
              >
                {{ operatorsDict[info.limitOpt] }}{{ info.limitValue }}
              </span>
              <span
                v-else-if="
                  !['in', 'ni'].includes(info.limitOpt) && ['bt', 'nb'].includes(info.limitOpt)
                "
              >
                {{ operatorsDict[info.limitOpt] }}{{ info.limitMin }}~{{ info.limitMax }}
              </span>
              <span v-else> {{ operatorsDict[info.limitOpt] }}：{{ info.limitRange }} </span>
            </template>
          </span>
        </p>
      </template>

      <template #content>
        <div class="table-header">
          <span class="table-header-title">已关联采样点</span>
          <div class="table-header-right">
            <w-button type="link" icon="ic_add" @click="addSamplingPoint">添加采样点</w-button>
          </div>
        </div>
        <w-info-table
          :columns="columnsSampling"
          :data-source="dataListSampling"
          :scroll="{ y: 500 }"
        >
          <template #action="{ row }">
            <a @click="deleteSampingPoint(row)">删除采样点</a>
            <w-divider type="vertical"></w-divider>
            <a @click="deleteMonitor(row)" v-if="row.point">删除监测量</a>
            <a v-else @click="addMonitor('single', row)">添加监测量</a>
          </template>
        </w-info-table>

        <div class="table-header">
          <span class="table-header-title">未匹配采样点的监测量</span>
          <div class="table-header-right">
            <w-button type="link" icon="ic_add" @click="addMonitor('multi')">添加监测量</w-button>
          </div>
        </div>
        <w-info-table
          :columns="colunmsMonitor"
          :data-source="dataListMonitor"
          :scroll="{ y: 500 }"
          @deleteMonintor="deleteMonitor"
        >
        </w-info-table>
      </template>
    </TheModal>

    <ModalSampling :visible.sync="modalSamplingVisible" :info="info"></ModalSampling>
    <ModalMonitor
      :visible.sync="modalMonitorVisible"
      :info="info"
      :samplingPoint="selectedSamplingPoint"
      :placeId="standardObj.placeId"
      :type="modalType"
    >
    </ModalMonitor>
  </div>
</template>

<script>
import TheModal from './TheModalCommon.vue';
import ModalSampling from './TheModalSamplingPoint.vue';
import ModalMonitor from './TheModalMonitor.vue';
import { modalStandardColums, modalStandardColums2, operatorsDict } from '../config';
export default {
  name: 'modalDetail',
  components: {
    TheModal,
    ModalSampling,
    ModalMonitor
  },
  props: {
    /* 模态框  */
    visible: {
      type: Boolean,
      default: false
    },
    standardObj: {
      type: Object,
      default: () => {}
    },
    //外部获取列表函数
    getOuterList: {
      type: Function,
      default: undefined
    }
  },
  data() {
    return {
      /* 所有 */
      info: undefined,
      /* 表格相关 */
      columnsSampling: modalStandardColums,
      dataListSampling: [],
      colunmsMonitor: modalStandardColums2,
      dataListMonitor: [],
      operatorsDict: operatorsDict,
      /* 本模态框 */
      loading: false,
      /* 其他模态框 */
      modalSamplingVisible: false,
      // 添加监测量模态框
      modalMonitorVisible: false,
      selectedSamplingPoint: undefined,
      modalType: 'multi'
    };
  },
  watch: {
    //模态框 显示 和 隐藏时操作
    visible: {
      handler(val) {
        /* 显示
      1. 获取详情列表 */
        if (val) {
          this.getAllData();
        }
      }
    },
    modalSamplingVisible: {
      handler(val) {
        if (!val) {
          this.getAllData();
          this.getOuterList();
        }
      }
    },
    modalMonitorVisible: {
      handler(val) {
        if (!val) {
          this.getAllData();
          this.getOuterList();
        }
      }
    }
  },
  methods: {
    //获取模态框
    async getAllData() {
      try {
        this.loading = true;
        //获取
        const { resultData } = await this.$http.get(`/controlStandard?id=${this.standardObj?.id}`);
        //分配
        this.dataListSampling = resultData.samplingPointList;
        this.dataListMonitor = resultData.pointList;
        this.info = resultData;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },

    /* 表格相关 */
    operate(type) {
      this.$emit(type, this.info);
    },
    addSamplingPoint() {
      this.modalSamplingVisible = true;
    },
    addMonitor(type, row) {
      this.modalMonitorVisible = true;
      this.selectedSamplingPoint = row;
      this.modalType = type;
    },
    async deleteSampingPoint(data) {
      console.log('删除采样点', data);
      try {
        await this.$http.delete(`/controlStandard/deleteSamplingPoint?id=${data.id}`);
        this.$message.success('删除成功');
        this.getAllData();
        this.getOuterList();
      } catch (error) {
        console.log(error);
      }
    },
    async deleteMonitor(data) {
      this.$confirm({
        title: '删除后该监测量将不再应用此标准，确定要删除吗？',
        okText: '确定删除',
        cancelText: '取消',
        centered: true,
        onOk: async () => {
          try {
            await this.$http.delete(`/controlStandard/deletePoint?id=${data.id}`);
            this.$message.success('删除成功');
            this.getAllData();
            this.getOuterList();
          } catch (error) {
            console.log(error);
          }
        }
      });
    },

    handleSubmit() {
      this.$emit('update:visible', false);
    },
    handleCancel() {
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style lang="less" scoped>
.warning {
  width: 23px;
  height: 0;
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  display: inline-block;
  color: white;
  text-align: left;
  position: relative;
  vertical-align: middle;
  border-radius: 5px;
  &-content {
    position: absolute;
    top: 0;
    left: -2px;
  }
}
.color-red {
  border-bottom: 19px solid #f64357;
}
.color-orange {
  border-bottom: 19px solid #f59f00;
}
.error-color {
  color: #f64357;
}
.warning-color {
  color: #f59f00;
}
.table-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 8px;
  margin-top: 16px;
  &-title {
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    font-size: 14px;
    color: #6281a3;
    line-height: 36px;
  }
}
</style>
