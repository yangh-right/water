<!--  -->
<template>
  <div class="water-analysis-view">
    <!-- <div class="card-box wbgc-card">
      <DeviceRun :title="'配电间能耗分析'" :waterPlantId="waterPlantId" />
    </div> -->
    <div class="card-box wbgc-card">
      <DeviceRun
        :title="'构筑物电量统计'"
        classificationType=2
        :waterPlantId="waterPlantId"
      />
    </div>
  </div>
</template>

<script>
import DeviceRun from './device-run.vue';
export default {
  name: 'DeviceAnalysis',
  components: {
    DeviceRun
  },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  computed: {},
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
    height: 100%;
    border-radius: 4px;
    display: flex;
    flex-shrink: 1;
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
