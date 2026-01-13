<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-07-25 16:13:12
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-12-04 11:03:47
 * @Description: 
-->
<template>
  <div class="addform">
    <draggable :disabled="disabledDrag" v-model="dataList">
      <div
        :class="{
          addform__item: true,
          'supply-cursor-move': !disabledDrag,
          [itemClass]: itemClass
        }"
        v-for="(item, index) in dataList"
        :key="index"
      >
        <w-info-form :layout="layout" ref="info-form" :model="item" :fields="fields">
          <template #footer> </template>
          <template v-for="field in fields.filter(field => $scopedSlots[field.name])" #[field.name]>
            <slot :name="field.name" :addForm="item"></slot>
          </template>
        </w-info-form>
        <div :class="['action', actionClass]">
          <w-icon
            title="删除"
            v-if="!disabled && dataList.length > 1"
            class="delete supply-mr-2.5"
            @click="deletePoint(index)"
            type="delete"
          />
          <w-icon
            title="新增"
            v-if="!disabled && index === dataList.length - 1"
            class="add"
            @click="addPoint"
            type="plus-circle"
          />
        </div>
      </div>
    </draggable>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: 'addForm',
  components: {
    draggable
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    defaultForm: {
      type: Object,
      default: () => ({})
    },
    fields: {
      type: Array,
      default: () => []
    },
    layout: {
      type: Object,
      default: () => ({
        span: 8,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      })
    },
    isDraggable: {
      type: Boolean,
      default: false
    },
    actionClass: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    itemClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dataList: []
    };
  },
  computed: {
    disabledDrag() {
      return this.disabled || !this.isDraggable;
    }
  },
  watch: {
    value: {
      handler(val) {
        this.dataList = val || [];
        if (!this.dataList.length) {
          this.addPoint();
          this.$emit('input', this.dataList);
        }
      },
      immediate: true
    },
    dataList: {
      handler(val) {
        this.$emit('input', val);
      },
      deep: true
    }
  },
  methods: {
    handleForm() {
      return new Promise((resolve, reject) => {
        const promises = [];
        this.$refs['info-form'].forEach(form => {
          promises.push(form.validate());
        });
        Promise.allSettled(promises).then(res => {
          if (res.every(item => item.status === 'fulfilled')) {
            this.$emit('input', this.dataList);
            resolve(this.dataList);
          } else {
            reject(false);
          }
        });
      });
    },
    addPoint() {
      const newItem = {};
      this.fields.forEach(item => {
        newItem[item.name] = this.defaultForm?.[item.name];
      });
      this.dataList.push(newItem);
    },
    deletePoint(index) {
      this.dataList.splice(index, 1);
    },
    change() {
      this.$emit('input', this.dataList);
    }
  }
};
</script>
<style lang="less" scoped>
.addform {
  &__item {
    position: relative;

    .action {
      position: absolute;
      width: 45px;
      right: -58px;
      top: 1px;
      display: flex;
      align-items: center;
      height: calc(100% - 20px);
      .wpgicon {
        font-size: 16px;
        cursor: pointer;
        color: var(--supply-color-primary-DEFAULT);
        &:hover {
          color: var(--supply-color-primary-hover);
        }
      }
    }
  }
}
</style>
