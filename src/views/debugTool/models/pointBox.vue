<template>
  <card-box :title="title">
    <div slot="titleRight">
      <slot name="titleRight"></slot>
    </div>
    <div v-if="list.length" class="point-box">
      <div :class="{ 'supply-justify-evenly': isEvenly, point__wrapper: true }">
        <div
          v-for="(item, index) in list"
          :key="index"
          :style="{ width: itemWidth }"
          class="point__item"
        >
          <div class="item__con">
            <div class="point__title" :title="item.name">{{ item.name }}</div>
            <div class="point__val">
              <div class="point__pv" :title="item.defaultValue">{{ item.defaultValue }}</div>
              <div class="point__unit">{{ item.unit }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <w-empty v-else class="empty"></w-empty>
  </card-box>
</template>

<script>
import CardBox from '@/components/CardBox';
const OneItemWidth = {
  1: '87%',
  2: '60%'
};
export default {
  components: { CardBox },
  props: {
    list: {
      type: Array,
      default: []
    },
    title: {
      type: String,
      default: ''
    },
    col: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {};
  },
  computed: {
    isEvenly() {
      return this.list.length < 2 || this.col === 1;
    },
    itemWidth() {
      if (this.list.length > 1 && this.col > 1) {
        return `calc(100% / ${this.col})`;
      } else {
        return OneItemWidth[this.col] || '250px';
      }
    }
  },
  watch: {
    list: {
      handler(val) {
        this.list?.forEach(item => {
          item.unit = item.unit || item?.pointObj?.pointUnit || '';
        });
      }
    }
  },
  methods: {}
};
</script>
<style lang="less" scoped>
.empty {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.point-box {
  height: 100%;
  width: 100%;
  padding: 12px 12px 15px 15px;
}
.point__wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  align-content: space-evenly;
  flex-flow: wrap;
  overflow-y: auto;
  .point__item {
    width: 33.3%;
    margin-bottom: 45px;
    .item__con {
      .point__title {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        color: var(--supply-color-secondary);
        margin-bottom: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        letter-spacing: 0;
      }
      .point__val {
        display: flex;
        align-items: center;

        .point__pv {
          width: calc(100% - 82px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 400;
          font-size: 16px;
          letter-spacing: 0;
          height: 28px;
          background: var(--supply-color-bg-card-dark);
          border: 1px solid var(--supply-color-border-DEFAULT);
          border-radius: 4px;
          line-height: 28px;
          padding-left: 12px;
          color: var(--supply-color-main);
        }
        .point__unit {
          width: 66px;
          margin-left: 6px;
          font-weight: 400;
          font-size: 14px;
          color: var(--supply-color-main);
          letter-spacing: 0;
        }
      }
    }
  }
}
</style>
