<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-10 11:25:00
-->
<template>
  <div
    class="content"
    :style="{ height: height, marginBottom: switchBtns.length ? '0px' : '12px' }"
  >
    <div class="content-title">
      <div class="title">{{ title }}</div>
      <div v-if="switchBtns.length" class="switch-btns">
        <div
          v-for="(item, index) in switchBtns"
          :key="item.value + index"
          :class="currentTab === item.value ? 'btn active' : 'btn'"
          @click="changeBtn(item)"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper" :style="{ height: switchBtns.length ? '270px' : '220px' }">
        <bar-chart v-if="flag" :darkTheme="'light'" :option="options" ref="barChart"></bar-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
export default {
  name: 'BarChartPart',
  inject: ['state'],
  props: {
    height: {
      type: String,
      default: '240px'
    },
    options: {
      type: Object,
      default: () => {}
    },
    switchBtns: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    flag() {
      if (this.options.xAxis[0].type === 'category') {
        return this.options.xAxis[0].data.length > 0;
      } else {
        return this.options.yAxis[0].data.length > 0;
      }
    }
  },
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  data() {
    return {
      currentTab: 'A',
      dataList: []
    };
  },
  watch: {
    'state.theme': {
      handler() {
        this.changeThemeColor();
      }
    }
  },
  created() {
    this.changeThemeColor();
  },
  methods: {
    changeThemeColor() {
      if (this.state.theme === 'green') {
        this.options.color[0] = '#008583';
      } else if (this.state.theme === 'red') {
        this.options.color[0] = '#ce4c1c';
      } else {
        this.options.color[0] = '#4385f3';
      }
    },
    changeBtn(data) {
      // this.flag = false;
      // this.loading = true;
      this.currentTab = data.value;
      this.$emit('changeArea', this.currentTab);
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  margin-bottom: 12px;
  width: 100%;
  height: 240px;
  background-color: var(--supply-color-bg-card-component);
  &-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 12px;
    height: 50px;
    .title {
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0;
    }
  }
  .switch-btns {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 64px;
      height: 32px;
      cursor: pointer;
      color: #333333;
      font-weight: 400;
      font-size: 14px;
      border: 1px solid #d6d6d6;
      border-radius: 4px 0 0 4px;
    }
    .btn:last-child {
      border-radius: 0px 4px 4px 0px;
    }
    .active {
      border: 1px solid #4285f4;
      color: #4285f4;
    }
  }
  .spin {
    height: calc(100% - 90px);
  }
  .chart-wrapper {
    padding: 10px 0;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
