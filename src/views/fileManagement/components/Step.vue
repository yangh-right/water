<!-- 步骤条组件 -->
<template>
  <div :class="currentStep === data[index].dictValue ? 'step active' : 'step'" @click="changeStep">
    <!-- 左侧箭头 -->
    <div v-if="index !== 0" :class="isDark ? 'left dark' : 'left'"></div>
    <!-- 中间内容 -->
    <div :class="currentStep === data[index].dictValue ? 'active-middle middle' : 'middle'">
      <!-- 序号 -->
      <div :class="currentStep === data[index].dictValue ? 'active-order order' : 'order'">
        {{ index + 1 }}
      </div>
      <!-- 步骤名称 -->
      <div :class="currentStep === data[index].dictValue ? 'active-text text' : 'text'">
        {{ data[index].dictName }}
      </div>
    </div>
    <!-- 右侧箭头 -->
    <div
      v-if="index !== data.length - 1"
      :class="currentStep === data[index].dictValue ? 'active-right right' : 'right'"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Step',
  inject: ['state'],
  props: {
    // 当前步骤索引
    index: {
      type: Number,
      default: 0
    },
    // 当前选中的步骤值
    currentStep: {
      type: String,
      default: '1'
    },
    // 步骤数据
    data: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    // 是否暗黑模式
    isDark() {
      return this.state.theme === 'dark';
    }
  },
  methods: {
    // 切换步骤
    changeStep() {
      this.$emit('changeStep', this.data[this.index].dictValue);
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.step {
  width: 234px;
  margin-bottom: 10px;
  position: relative;
  display: flex;
  cursor: pointer;
}
.middle {
  width: 220px;
  height: 40px;
  background: var(--supply-color-bg-card-dark);
  border: 1px solid var(--supply-rgb-color-bg-DEFAULT);
  color: var(--supply-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  .order {
    width: 20px;
    height: 20px;
    border-radius: 20px;
    background: #cccccc;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  .active-order {
    background: var(--supply-color-online);
    color: #fff;
  }
}
.active-middle {
  color: var(--supply-color-online);
}
.text {
  margin-left: 6px;
  display: inline-block;
  color: var(--supply-color-secondary);
}
.active-text {
  color: var(--supply-color-online);
}
.right {
  width: 0;
  height: 0;
  border: 20px solid transparent;
  border-left: 15px solid var(--supply-color-bg-card-dark);
}
.active-right {
  border-left: 15px solid var(--supply-color-bg-card-dark);
}
.left {
  position: absolute;
  width: 0;
  height: 0;
  border: 20px solid transparent;
  border-left: 15px solid #fff;
}
.dark {
  border-left: 15px solid #181c24;
}
.step:hover {
  .middle {
    background: var(--supply-color-table-hover);
  }
  .right {
    border-left: 15px solid var(--supply-color-table-hover);
  }
}
</style>
