<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-07-25 16:13:12
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-12-03 16:45:35
 * @Description: 
-->
<template>
    <div class="point-wrapper">
      <draggable
        :disabled="disabled"
        v-model="pointList"
      >
        <div :class="{'point__item': true,  'supply-cursor-move':!disabled}" v-for="(item, index) in pointList" :key="item.pointName + index">
            <virtual-select
               :disabled="disabled"
               class="supply-w-60"
               :options="pointOptions"
               show-search
                :filter-option="filterOption"
                placeholder="请选择监测量"
               v-model="item.pointName"
             >

            </virtual-select>
            <div class="status">
                <div class="condition supply-mx-3">=</div>
                <w-input-number :disabled="disabled" class="value"  v-model="item.value"></w-input-number>
                <span class="supply-mx-3">展示为</span>
                <select-img :disabled="disabled" class="img" v-model="item.imgUrl"></select-img>
            </div>
            
            <w-icon v-if="!disabled" class="action delete" @click="deletePoint(index)" type="close-square" /></span>
        </div>
      </draggable>
        <w-icon v-if="!disabled" class="action add" @click="addPoint" type="plus-circle" />
    </div>
  </template>
  
  <script>
import VirtualSelect from '@/components/Virtual/VirtualSelect';
import draggable from 'vuedraggable';

    import selectImg from './selectImg';
  export default {
    name: 'pointStatus',
    inject: ['getPointOptions'],
    components: {
        selectImg,
        VirtualSelect,
        draggable
    },
    props: {
      value: {
        type: Array,
        default: ()=>[],
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        pointList: [],
      };
    },
    computed: {
        pointOptions() {
        return this.getPointOptions().map(item => ({value:item.pointName, label:item.pointMemo}))
      },
    },
    watch: {
      value: {
        handler(val) {
          this.pointList = val || [];
        },
        immediate: true,
      },
      pointList: {
        handler(val) {
          this.$emit("input", val);
        },
        deep: true,
      },
    },
    methods: {
       filterOption(input, option) {
        return option.componentOptions.children[0].text.indexOf(input) >= 0;
      },
      addPoint() {
        this.pointList.push({
          pointName: undefined,
          value: 1,
          imgUrl: "",
        });
      },
      deletePoint(index) {
        this.pointList.splice(index, 1)
      },
      change() {
        this.$emit("input", this.pointList);
      },
    },
  };
  </script>
  <style lang="less" scoped>
  .point-wrapper {
    .action {
      font-size: 16px;
      background-color: var(--supply-color-bg-card-DEFAULT);
      &.add {
       font-size: 20px;
      }
     }
    .point__item {

      position: relative;
      margin-bottom: 4px;
      padding: 4px;
      border: 1px dotted #ccc;
      border-radius: 4px;
      width: 100%;
      .delete {
       position: absolute;
       right: 0;
       top: 0;
      }
      .status {
        margin-top: 6px;
        display: flex;
        align-items: center;
          .value {
            margin-top: 4px;
            width: 70px;

          }
      }
    }
  }
  </style>
  