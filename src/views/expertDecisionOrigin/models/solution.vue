<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-07-19 09:09:24
 * @Description:
-->
<template>
  <div class="warn-diagnosis">
    <w-button @click="toModel" class="btn">查看详情</w-button>
    <card-box title="方案选择">
      <div class="solution" v-if="dataList.length">
        <w-button
          :disabled="!btnDataMap[item.dictValue]"
          @click="clickSolution(item)"
          class="solution__item"
          v-for="(item, index) in dataList"
          :key="item.dictValue"
        >
          {{ item.dictName }}
        </w-button>
      </div>
      <w-empty v-else class="w-center"></w-empty>
    </card-box>
    <w-modal
      v-model="visible"
      :title="curSolution.dictName"
      destroyOnClose
      :maskClosable="false"
      class="secondary-modal"
      :width="'600px'"
      :bodyStyle="{ padding: '8px 16px' }"
      centered
      okText="保存"
      @ok="handleOk"
    >
      <div class="form-item">
        <!-- <div class="form-item__label">{{curSolution.solutionName}}：</div> -->
        <div class="form-item__content">
          <w-textarea :rows="10" v-model="note" placeholder="请输入" />
        </div>
      </div>
    </w-modal>
  </div>
</template>

<script>
import { measuresTypeCount, addOrUpdatePlan } from '@/api/diagnosis';
import { adoptionStatisticsOption as option } from './config';
import { themeMixin } from '@/core/mixins';
import moment from 'moment';
import CardBox from './CardBox';
export default {
  mixins: [themeMixin],
  props: {
    alarmInfo: {
      type: Object,
      default: () => ({})
    },
    search: {
      type: Object,
      default: () => ({})
    },
    controlId: {
      type: Number | undefined,
      default: undefined
    },
    predictionId: {
      type: String,
      default: ''
    },
    defaultPredictionId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      note: '',
      btnDataMap: {},
      dataList: [],
      visible: false,
      curSolution: {}
    };
  },

  components: { CardBox },
  computed: {
    params() {
      let params = {
        waterPlantId: this.alarmInfo.pumpHouseId
      };
      if (this.search.date[0]) {
        params.startTime = moment(this.search.date[0]).format('YYYY-MM-DD HH:mm:ss');
        params.endTime = moment(this.search.date[1]).format('YYYY-MM-DD HH:mm:ss');
      }
      return params;
    }
  },
  watch: {
    params: {
      handler(val) {
        this.getData();
      },
      immediate: true
    }
  },
  mounted() {
    this.$bus.$on('sendDecisionData', res => {
      this.btnDataMap = {};
      res?.content?.forEach(plan => {
        this.btnDataMap[plan.measuresType] = plan;
      });
    });
  },
  destroyed() {
    this.$bus.$off(['sendDecisionData']);
  },
  methods: {
    toModel() {
      this.drillDown({
        path: '/expertProcessControl',
        query: {
          tab: this.alarmInfo.expertDecisionType,
          id: this.controlId || ''
        }
      });
    },
    clickSolution(solution) {
      this.curSolution = solution;
      this.note = this.btnDataMap[solution.dictValue].measures;
      this.visible = true;
    },
    async getData() {
      if (!this.params.waterPlantId) return;
      const { resultData, status } = await measuresTypeCount(this.params);
      if (status === 'complete') {
        this.dataList = resultData || [];
        this.$emit('getSolutions', this.dataList);
      }
    },
    async handleOk() {
      const { planId, controlId, measuresType } = this.btnDataMap[this.curSolution.dictValue];
      let params = {
        id: planId,
        controlId,
        measuresType,
        measures: this.note
      };
      const { resultData, status } = await addOrUpdatePlan(params);
      if (status === 'complete') {
        this.visible = false;
        this.$message.success('修改成功');
        this.$bus.$emit('updatePlan');
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .card-box__title {
  .text {
    max-width: 150px;
  }
}
.form-item {
  display: flex;
  /* &__label {
    width: 8.1%;
    text-align: right;
  } */
  &__content {
    padding: 20px 20px 0;
    flex: 1;
    overflow: hidden;
  }
}
.solution {
  display: flex;
  overflow: auto;
  margin-right: -12px;
  height: 100%;
  flex-wrap: wrap;
  justify-content: space-around;
  align-content: space-around;
  padding-top: 12px;
  &__item {
    margin: 12px 12px 0 0;
    box-shadow: -4px 4px 6px inset rgba(255, 255, 255, 0.6), 4px -4px 6px inset rgba(0, 0, 0, 0.2);
    border: 1px solid #eeeeeeb8;
    &:active {
      box-shadow: -2px 2px 4px inset rgba(255, 255, 255, 0.6), 2px -2px 4px inset rgba(0, 0, 0, 0.2);
    }
    &:focus,
    &:hover {
      color: unset;
      background-color: unset;
      border-color: #eeeeeeb8;
    }
  }
}
.warn-diagnosis {
  width: 100%;
  height: 100%;
  position: relative;
  .btn {
    z-index: 10;
    position: absolute;
    right: 16px;
    top: 10px;
  }
}
</style>
