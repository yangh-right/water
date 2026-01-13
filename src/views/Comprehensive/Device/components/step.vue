<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-28 09:22:05
-->
<template>
  <div :class="currentStep == data[index].value ? 'step active' : 'step'" @click="changeStep">
    <div v-if="index != 0" :class="isDark ? 'left dark' : 'left'"></div>
    <div :class="currentStep == data[index].value ? 'active-middle middle' : 'middle'">
      <div :class="currentStep == data[index].value ? 'active-order order' : 'order'">
        {{ index + 1 }}
      </div>
      <div :class="currentStep == data[index].value ? 'active-text text' : 'text'">
        {{ data[index].label }}
      </div>
    </div>
    <div
      v-if="index != data.length - 1"
      :class="currentStep == data[index].value ? 'active-right right' : 'right'"
    ></div>
  </div>
</template>
<script>
export default {
  name: 'Step',
  inject: ['state'],
  props: {
    index: {
      type: Number,
      default: 0
    },
    currentStep: {
      type: String,
      default: '1'
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    isDark() {
      return this.state.theme === 'dark';
    }
  },
  data() {
    return {};
  },
  created() {},
  methods: {
    changeStep() {
      this.$emit('changeStep', this.data[this.index].value);
    }
  }
};
</script>

<style lang="less" scoped>
.step {
  width: 198px;
  margin-bottom: 10px;
  position: relative;
  display: flex;
  cursor: pointer;
}
.middle {
  width: 180px;
  height: 40px;
  background: var(--supply-color-bg-card-dark);
  border: 1px solid var(--supply-rgb-color-bg-DEFAULT);
  color: var(--supply-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  .order {
    width: 30px;
    height: 30px;
    border-radius: 30px;
    background: #cccccc;
    display: flex;
    align-items: center;
    font-size: 15px;
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
  font-size: 15px;
  margin-left: 10px;
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
