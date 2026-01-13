<!-- 视频门禁监控组件 -->
<template>
  <!-- 使用UnitCard组件作为容器 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 内容区域，根据主题切换样式 -->
    <div :class="['card-inner', themeConfig.className]">
      <!-- 数据列表展示 -->
      <div class="list">
        <!-- 遍历数据列表 -->
        <div
          class="list__item"
          v-for="(item, index) in dataList"
          :key="item.name"
          @click="goDetailManage(item)"
        >
          <!-- 左侧区域：图标和总数 -->
          <div class="left">
            <div class="icon"></div>
            <div class="total">
              <div class="title">{{ item.name }}</div>
              <div class="value">{{ item.total }}个</div>
            </div>
          </div>
          <!-- 右侧区域：在线/离线状态 -->
          <div class="line">
            <div class="line__item online">
              <div class="title">
                <w-icon class="icon" type="ic_wifi"></w-icon>
                <span class="name">在线：</span>
              </div>
              <div class="value">{{ item.normal }}个</div>
            </div>
            <div class="line__item">
              <div class="title">
                <w-icon class="icon" type="ic_wifi"></w-icon>
                <span class="name">离线：</span>
              </div>
              <div class="value">{{ item.abnormal }}个</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </unit-card>
</template>

<script>
// 导入API和mixin
import { securityAnalysis } from '@/api/cockpit';
import { themeMixin } from '@/core/mixins.ts';

// 数据处理函数
function setData(data) {
  // 初始化数据结构
  let initData = [
    { name: '视频总数：', total: 0, normal: 0, abnormal: 0, type: 'video' },
    { name: '门禁总数：', total: 0, normal: 0, abnormal: 0, type: 'door' }
  ];
  // 合并API返回的数据
  initData[0] = { ...initData[0], ...data?.video };
  initData[1] = { ...initData[1], ...data?.access };
  // 处理空值情况
  initData.forEach(item => {
    item.total = item.total ?? 0;
    item.normal = item.normal ?? 0;
    item.abnormal = item.abnormal ?? 0;
  });
  return initData;
}

export default {
  name: 'accessVideo',
  mixins: [themeMixin], // 使用主题mixin
  components: {
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
      dataList: setData()
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    // 初始化数据
    async initData() {
      const { resultData, status } = await securityAnalysis();
      if (status === 'complete') {
        this.dataList = setData(resultData);
      }
    },
    goDetailManage(item) {
      if (item.type === 'video') {
        this.drillDown({
          path: '/factoryMonitoring'
        });
      } else if (item.type === 'door') {
        this.drillDown({
          path: '/runMonitor/doorManage'
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.card-inner {
  width: 100%;
  height: 100%;
  &.card-dark {
    .list {
      &__item {
        background: #181c24;
        cursor: pointer;
        &:nth-child(1) {
          .left {
            .icon {
              background: url('~@/assets/safeCockpit/video_dark.png') no-repeat;
              background-size: 100% 100%;
            }
          }
        }
        &:nth-child(2) {
          .left {
            .icon {
              background: url('~@/assets/safeCockpit/door_dark.png') no-repeat;
              background-size: 100% 100%;
            }
          }
        }
      }
    }
  }
  .list {
    margin-top: 22px;
    &__item {
      padding: 14px 17px;
      background: #f0f6f7;
      border-radius: 4px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      &:nth-last-child(1) {
        margin-bottom: 0;
      }
      &:nth-child(1) {
        .left {
          .icon {
            background: url('~@/assets/safeCockpit/video.png') no-repeat;
            background-size: 100% 100%;
          }
        }
      }
      &:nth-child(2) {
        .left {
          .icon {
            background: url('~@/assets/safeCockpit/door.png') no-repeat;
            background-size: 100% 100%;
          }
        }
      }
      .left {
        display: flex;
        align-items: center;

        .icon {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          margin-right: 12px;
        }
        .total {
          .title {
            font-weight: 400;
            font-size: 14px;
            color: var(--supply-color-main);
            letter-spacing: 0;
            margin-bottom: 13px;
            margin-top: 1px;
          }
          .value {
            font-weight: 600;
            font-size: 16px;
            color: var(--supply-color-main);
            letter-spacing: 0;
          }
        }
      }
      .line {
        width: 201px;

        &__item {
          padding: 0 12px;
          width: 100%;
          height: 30px;
          margin-bottom: 10px;
          background: var(--supply-color-bg-card-DEFAULT);
          border-radius: 2px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 400;
          font-size: 15px;
          color: var(--supply-color-main);
          letter-spacing: 0;

          &.online {
            .title {
              .icon {
                color: #00c48d;
              }
            }
          }
          &:nth-last-child(1) {
            margin-bottom: 0;
          }
          .title {
            .icon {
              position: relative;
              top: 2px;
              margin-right: 3px;
              font-size: 20px;
              color: #869e97;
            }
          }
        }
      }
    }
  }
}
</style>
