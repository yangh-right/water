<template>
  <div class="model-config supply-flex supply-flex-col">
    <div
      class="model-config-tap supply-bg-bg-card-DEFAULT supply-flex-none supply-overflow-hidden"
    >
      <span
        v-for="tab in tabs"
        :key="tab.value"
        :class="tabVal === tab.value ? 'active' : ''"
        @click="changeTab(tab.value)"
      >
        {{ tab.label }}
      </span>
    </div>
    <div class="model-config-body supply-flex-1 supply-overflow-hidden supply-flex supply-flex-col">
      <template v-if="this.tabVal === '1'">
        <PlaceConfig></PlaceConfig>
      </template>
      <template v-if="this.tabVal === '2'">
        <PointConfig></PointConfig>
      </template>
    </div>

  </div>
</template>

<script>
import PointConfig from './models/modelPointConfig.vue';
import PlaceConfig from './models/modelPlaceConfig.vue';
export default {
  name: 'ModelConfig',
  components: { PointConfig, PlaceConfig },
  data() {
    return {
      tabs: [
        {
          label: '构筑物模型配置',
          value: '1'
        },
        {
          label: '监测量模型配置',
          value: '2'
        }
      ],
      tabVal: '1'
    };
  },
  computed: {},
  created() {
  },
  activated() {},
  methods: {
    changeTab(tab) {
      console.log('000', tab);
      this.tabVal = tab;
    },
  }
};
</script>

<style lang="less" scoped>
.model-config {
  height: 100%;
  &-tap {
    height: 50px;
    border-radius: 4px;
    margin-bottom: 12px;
    span {
      display: inline-block;
      height: 100%;
      width: 140px;
      font-size: 14px;
      color: #999999;
      text-align: center;
      font-weight: 400;
      line-height: 48px;
      cursor: pointer;
      &.active {
        color: var(--supply-color-primary-DEFAULT);
        border-bottom: 2px solid var(--supply-color-primary-DEFAULT);
      }
    }
    .ant-btn {
      height: 28px;
      margin-top: 10px;
      margin-right: 30px;
    }
  }
  &-body {
    .manage-seach {
      padding: 12px;
      border-radius: 4px;
      .search-item {
        float: left;
        .ant-input {
          width: 205px;
        }
        .ant-select {
          width: 260px !important;
        }
      }
    }
    .delete-link {
      margin-right: 12px;
    }
    .pagination-con {
      text-align: right;
      padding: 12px 20px;
    }
  }
}
</style>
