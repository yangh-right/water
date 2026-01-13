<template>
  <div class="full-view">
    <div class="full-view-top">
      选择污水厂：<FactorySelect
        v-model="waterPlantId"
        style="width: 200px;"
        autoSelect
      ></FactorySelect>
      <!-- <TimePicker
        style="width: 310px"
        v-model="time"
        :timePickerOption="{ defaultTimeType: 'date', disabledDate: disabledDate }"
        size="default"
        @change="timeChange"
      ></TimePicker> -->
    </div>
    <div class="full-view-middle">
      <PowerAnalysis :waterPlantId="waterPlantId" class="card" />
      <StructuresAnalysis :waterPlantId="waterPlantId" class="card" />
      <DeviceAnalysis :waterPlantId="waterPlantId" class="card" />
    </div>
  </div>
</template>

<script>
import components from './components';
export default {
  name: 'CostAnalysis',
  inject: ['state'],
  components: { ...components },
  data() {
    return {
      waterPlantId: ''
    };
  },
  mounted() {},
  watch: {},
  methods: {}
};
</script>

<style lang="less" scoped>
.full-view {
  width: 100%;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  &-top {
    height: 50px;
    width: 100%;
    border-radius: 4px;
    background: var(--supply-color-bg-card-DEFAULT);
    display: flex;
    align-items: center;
    padding: 0 12px;
    margin-bottom: 10px;
    /deep/ .wpg-calendar-picker-input {
      height: 36px !important;
      line-height: 36px !important;
    }
    /deep/ .wpg-calendar-input-wrap {
      height: 36px !important;
    }
    /deep/.yearInput {
      height: 36px !important;
    }
    /deep/.anticon-calendar {
      line-height: 40px !important;
    }
  }
  &-middle {
    width: 100%;
    height: calc(100% - 64px);
    display: flex;
    .card {
      width: 33.3%;
      height: 100%;
      border-radius: 4px;
      margin-right: 10px;
      &:last-child {
        margin-right: 0;
      }
    }
    .card:nth-child(2) {
      width: 33.3%;
    }
    .card:nth-child(3) {
      width: 33.3;
    }
  }

  &-bottom {
    display: flex;
    width: 100%;
    height: calc(100% - 48px);
    border-radius: 4px;
    .left {
      width: 31%;
      margin-right: 10px;
      border-radius: 4px;
      height: 100%;
    }
    .right {
      width: 68%;
      border-radius: 4px;
      height: 100%;
      box-shadow: 0 1px 6px 2px rgba(4, 12, 25, 0.08);
    }
  }
}

/deep/ .wpg-tabs-tab {
  width: 100px;
  text-align: center;
  margin: 0 10px;
}
</style>
