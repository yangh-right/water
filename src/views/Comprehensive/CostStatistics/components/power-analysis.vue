<!--  -->
<template>
  <div class="water-analysis-view">
    <div class="card-box wbgc-card">
      <CarbonEmission
        :title="'污水处理量'"
        :dataEchart="dataEchart"
        strChar="flowPv"
        strUnit="m³"
        :loading="loading"
      />
    </div>
    <div class="card-box wbgc-card" v-loading="loading">
      <CarbonEmission
        :title="'电耗处理量'"
        :dataEchart="dataEchart"
        strChar="powerPv"
        strUnit="kw.h"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script>
import CarbonEmission from './carbon-emission';

export default {
  name: 'PowerAnalysis',
  components: {
    CarbonEmission
  },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },

    dataEchart: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  },
  watch: {},

  methods: {}
};
</script>
<style lang="less" scoped>
.water-analysis-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  p {
    margin-bottom: 0;
  }
  .card-box {
    width: 100%;
    height: 50%;
    border-radius: 4px;
    display: flex;
    flex-shrink: 0;
    flex-flow: 0;
    justify-content: space-between;
    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

html[data-wpg-theme='green'] {
  .water-analysis-view {
    .model-item-content {
      background: #ddf3f0;
    }
  }
}
html[data-wpg-theme='red'] {
  .water-analysis-view {
    .model-item-content {
      background: #fcf3f2;
    }
  }
}
html:not([data-wpg-theme='dark']) {
  .water-analysis-view {
    .top {
      box-shadow: 0 1px 6px -1px rgba(4, 12, 25, 0.08);
      &-item {
        p:first-child {
          color: #666;
        }
        p:nth-child(2) {
          color: #333;
        }
      }
    }
  }
}

html[data-wpg-theme='dark'] {
  .water-analysis-view {
    .top {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
      &-item {
        p:first-child {
          color: #adb5bd;
        }
        p:nth-child(2) {
          color: #fff;
        }
      }
    }
    .content {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
      .model-item-content {
        background: #181c24;
      }
    }
  }
}
</style>
