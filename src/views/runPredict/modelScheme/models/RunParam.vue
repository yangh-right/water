<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-07-28 18:58:21
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-06-25 10:58:05
 * @Description: 
-->
<template>
  <div class="module-wrap">
    <div :id="'point-container' + tab">
      <div v-for="(item, index) in moduleList" :key="item.name" class="module">
        <div v-if="item.name" class="module-header supply-flex supply-items-center">
          <div class="line"></div>
          <div class="module-title supply-text-main">{{ item.name }}</div>
          <span
            @click="changeState(index)"
            class="supply-ml-auto module__collapse supply-cursor-pointer"
          >
            {{ item.openState === 0 ? '展开' : '收起' }}
          </span>
        </div>
        <transition name="collapse" @after-enter="onCollapse" @after-leave="onCollapse">
          <div v-show="item.openState" class="point" :style="{ columnCount: 2 }">
            <div v-for="(point, i) in item.points" :key="i" class="point__item">
              <span class="item__name">{{ point.name }}</span>
              <div class="list">
                <span>
                  <span class="list__item" :title="point.value"
                    ><w-input-number
                      v-model="point.value"
                      disabled
                      class="list__input"
                      placeholder="请输入"
                    ></w-input-number
                  ></span>
                  <span class="supply-w-10 supply-ml-1.5 supply-inline-block">{{
                    point.pointUnit
                  }}</span>
                </span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <w-empty v-if="!moduleList.length" style="height: 250px" class="predict-empty"></w-empty>
  </div>
</template>

<script>
import Macy from 'macy';

export default {
  name: 'RunParam',
  props: {
    moduleList: {
      type: Array,
      default: () => []
    },
    tab: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },

  components: {},

  computed: {},
  watch: {
    moduleList: {
      handler(val) {
        setTimeout(() => {
          this.macyObj.recalculate(true);
        }, 100);
      }
    }
  },
  mounted() {
    this.macyObj = new Macy({
      container: '#point-container' + this.tab, // 图像列表容器id
      trueOrder: false,
      waitForImages: false,
      useOwnImageLoader: false,
      debug: true,

      // 设计间距
      margin: {
        x: 12,
        y: 12
      },

      // 设置列数
      columns: 2
    });
  },
  methods: {
    changeState(idx) {
      let val = Math.abs(this.moduleList[idx].openState - 1);
      this.moduleList.forEach((o, i) => {
        o.openState = i === idx ? val : o.openState;
      });
    },
    onCollapse() {
      this.$nextTick(() => {
        this.macyObj.recalculate(true);
      });
    }
  }
};
</script>
<style lang="less" scoped>
.module-wrap {
  height: auto;
  .module {
    width: 50%;
    margin-bottom: 0px;
    .line {
      height: 24px;
      width: 3px;
      background-color: var(--supply-color-primary-DEFAULT);
      margin-right: 8px;
    }
    &-header {
      padding: 8px 0;
      .module-title {
        font-weight: 600;
        font-size: 14px;
        color: var(--supply-text-main);
      }
      .module__collapse {
        color: var(--supply-color-primary-DEFAULT);
        font-weight: 400;
        font-size: 12px;
      }
    }
    .collapse-enter-active {
      transition: all 0.5s ease-out;
    }
    .collapse-leave-active {
      transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
    }
    .collapse-enter-from,
    .collapse-leave-to {
      opacity: 0;
    }
    .point {
      column-gap: 27px;
      padding: 8px 0 0 0;
      &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        .item__name {
          width: calc(100% - 162px);
          white-space: wrap;

          font-weight: 400;
          font-size: 14px;
          color: var(--supply-text-secondary);
        }
        .list {
          &__item {
            margin-right: 4px;
            &:nth-last-child(1) {
              margin-right: 0;
            }
          }
        }
        /deep/ .list__input {
          .wpg-input-number-handler-wrap {
            display: none;
          }
        }
      }
    }
  }
}
</style>
