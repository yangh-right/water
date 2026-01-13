<template>
  <span class="grid">
    <w-checkbox
      v-for="(item, index) in data"
      :key="index"
      class="grid-item"
      @click="select(index)"
      >{{ item.name }}</w-checkbox
    >
  </span>
</template>

<script>
import { isEqual } from 'lodash-es';
export default {
  components: {},
  props: {
    data: {
      type: Array,
      default: () => {
        return [];
      }
    },
    value: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    let selectedArr = [];
    this.data.forEach((item, i) => {
      if (this.value.includes(item.value)) {
        selectedArr.push(i);
      }
    });
    if (!selectedArr.length) {
      selectedArr = [0];
    }
    return {
      selectedArr
    };
  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        let selectedArr = [];
        this.data.forEach((item, i) => {
          if (this.value.includes(item.value)) {
            selectedArr.push(i);
          }
        });
        if (!selectedArr.length) {
          selectedArr = [0];
        }
        if (!isEqual(this.selectedArr, selectedArr)) {
          this.selectedArr = selectedArr;
        }
      }
    },
    selectedArr: {
      handler(val) {
        let arr = [];
        let textArr = [];
        val.forEach(el => {
          arr.push(this.data[el].value);
          textArr.push(this.data[el].name);
        });
        this.$emit('update', arr, textArr);
      },
      deep: true
    }
  },
  mounted() {},
  methods: {
    select(index) {
      // 可多选
      let searchIndex = this.selectedArr.indexOf(index);
      // 点中
      if (searchIndex === -1) {
        this.selectedArr.push(index);
      } else if (this.selectedArr.length > 1) {
        // 取消
        this.selectedArr.splice(searchIndex, 1);
      }
    }
  }
};
</script>
<style lang="less" scoped>
.btn-wrapper {
  padding-top: 10px;
}

.select-btn {
  color: var(--supply-color-primary-DEFAULT);
  font-size: 14px;
  padding: 10px;
}

.grid {
  height: 28px;
}
.grid-item {
  display: inline-block;
  line-height: 28px;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
  height: 28px;
  font-size: 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
  &:hover {
    color: var(--supply-color-primary-DEFAULT);
  }
}
.span-active {
  color: white;
  border-top: 1px solid var(--supply-color-primary-DEFAULT);
  border-bottom: 1px solid var(--supply-color-primary-DEFAULT);
  background: var(--supply-color-primary-DEFAULT);
  &:hover {
    color: white;
  }
}
</style>
