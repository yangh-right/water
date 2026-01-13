<!-- 环境安全监控组件 -->
<template>
  <!-- 使用UnitCard组件作为容器 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 头部右侧：类型选择 -->
    <div slot="headerRight">
      <w-select style="width: 152px;" size="small" v-model="type" @change="typeChange">
        <w-select-option v-for="(item, index) in goods" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-select-option>
      </w-select>
    </div>
    <!-- 数据列表展示 -->
    <div :class="['list', themeConfig.className]" v-if="dataList.length">
      <div
        class="list__item"
        v-for="(item, index) in dataList"
        :key="item.pointName"
        @click="goDetailManage(item)"
      >
        <div class="icon"></div>
        <div class="value">
          <span class="val">{{ item.pointValue }}</span>
          <span class="unit">{{ item.pointUnit }}</span>
        </div>
        <div class="name">{{ item.pointMemo }}</div>
      </div>
    </div>
    <!-- 空状态 -->
    <empty v-else></empty>
  </unit-card>
</template>

<script>
// 导入主题mixin和API
import { themeMixin } from '@/core/mixins.ts';
import { getRealDataByPointConfigCode } from '@/api/optimization.js';

export default {
  name: 'envSafe',
  mixins: [themeMixin], // 使用主题mixin
  components: {
    empty: () => import('../components/empty.vue'),
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue')
  },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    cardTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 主题配置
      themeConfigMap: {
        default: {
          className: 'card-default'
        },
        dark: {
          className: 'card-dark'
        }
      },
      // 数据列表
      dataList: [],
      // 类型选项
      goods: [
        { value: 'medium_grid', label: '中格栅' },
        { value: 'fine_grid', label: '细格栅' },
        { value: 'dosing_room', label: '加药间' },
        { value: 'ozone_room', label: '臭氧间' }
      ],
      // 当前选中类型
      type: 'medium_grid'
    };
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initData();
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      let params = {
        configCode: this.type,
        pumpHouseId: this.waterPlantId
      };
      try {
        let { status, resultData } = await getRealDataByPointConfigCode(params);
        if (status === 'complete') {
          this.dataList = resultData || [];
        }
      } catch (error) {
        console.error('数据获取失败:', error);
      }
    },
    goDetailManage() {
      // this.drillDown({
      //   path: '/hazardousChemicals'
      // });
    },
    // 类型切换事件
    typeChange() {
      this.initData();
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.list {
  width: 100%;
  height: 100%;
  padding-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &.card-dark {
    .list__item {
      background-image: linear-gradient(180deg, #68ece47a 0%, #eff9f81f 68%, #fdfdfd00 100%);
      .icon {
        background: url('~@/assets/safeCockpit/point_dark.png') no-repeat;
        background-size: 100% 100%;
      }
      .value {
        background: #d6ecec36;
      }
    }
  }
  &__item {
    width: calc(25% - 18px);
    height: 100%;
    background-image: linear-gradient(180deg, #cfefed 0%, #eff9f8 68%, #fafcff 100%);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    /* cursor: pointer; */
    .icon {
      width: 80px;
      height: 92px;
      border-radius: 6px;
      background: url('~@/assets/safeCockpit/point.png') no-repeat;
      background-size: 100% 100%;
      margin-bottom: 25px;
    }
    .value {
      width: 100%;
      height: 29px;
      background: #d6ecec;
      border-radius: 6px;
      margin-bottom: 12px;
      font-weight: 400;
      font-family: MiSans-Medium, sans-serif;
      font-size: 12px;
      color: var(--supply-color-main);
      letter-spacing: 0;
      line-height: 29px;
      text-align: center;
      .val {
        font-weight: 600;
        font-size: 16px;
        margin-right: 2px;
      }
      .unit {
        font-size: 12px;
        position: relative;
        top: -2px;
      }
    }
    .name {
      font-size: 14px;
      color: var(--supply-color-main);
      letter-spacing: 0;
      text-align: center;
    }
  }
}
</style>
