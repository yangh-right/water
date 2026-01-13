<!--
 * @Description:首页人员轨迹人员信息弹窗
-->
<template>
  <div class="people-popup supply-bg-white" v-if="visible">
    <div
      :class="[
        'people-popup-title supply-bg-primary supply-flex supply-items-center',
        { 'no-task': !hasTask }
      ]"
    >
      <div class="people-popup-icon supply-mx-2"></div>
      <span class="supply-text-sm supply-text-white supply-mx-1">{{ people.userName }}
        <span class="supply-text-xs supply-text-gray-300">{{hasTask ? '忙碌' : '空闲'}}</span>
      </span>
    </div>
    <div :class="['supply-m-2 supply-px-2 card', { 'no-task': !hasTask }]">
      <div class="supply-flex supply-items-center supply-py-1">
        <span class="supply-text-gray-400 supply-flex-none supply-mr-5">电话</span>
        <span :title="people.phone||''" class="supply-mr-auto supply-truncate">{{ people.phone }}</span>
      </div>
      <div class="supply-flex supply-items-center supply-py-1">
        <span class="supply-text-gray-400 supply-flex-none supply-mr-5">地址</span>
        <span :title="people.userAddress||''" class="supply-mr-auto supply-truncate">{{ people.userAddress }}</span>
      </div>
    </div>
    <div class="card supply-m-2 supply-px-2" v-if="hasTask">
      <div class="supply-text-gray-400 supply-py-2">正在执行的工单</div>
      <div class="supply-overflow-y-auto supply-max-h-20 supply-leading-7">
        <div class="supply-flex" v-for="(task, index) in people.ticketInfoMapVOList" :key="index">
          <span
            class="supply-mr-auto supply-truncate"
            :title="task.title"
            >{{ task.title }}</span
          >
          <a @click="detail(task)" class="supply-flex-none">工单详情</a>
        </div>
      </div>
    </div>
    <div class="supply-flex supply-m-2 supply-pb-2">
      <a
        class="patch-btn supply-ml-auto supply-flex supply-items-center supply-border supply-border-solid supply-border-primary supply-justify-center"
        @click="patchSheet"
        >给他派单</a
      >
    </div>
    <w-icon
      class="supply-text-white supply-absolute supply-top-0 supply-right-0 supply-cursor-pointer supply-p-2"
      type="close"
      @click="visible = false"
    />
  </div>
</template>

<script>
import { getSheetDetail } from '@/api/map';
import Vue from 'vue';

export default Vue.extend({
  name: 'PeoplePopup',
  data() {
    return {
      visible: false,
      addTicket: () => {},
      people: {
        distance: null,
        groupName: null,
        id: '',
        lat: '',
        lng: '',
        phone: '',
        status: '',
        ticketInfoMapVOList: [],
        userAddress: null,
        userName: ''
      }
    };
  },
  inject: ['linkToOther'],
  computed: {
    hasTask() {
      return this.people.ticketInfoMapVOList?.length;
    }
  },
  methods: {
    patchSheet() {
      this.addTicket();
      // this.drillDown('/manage/orderManage?patch=true')
    },
    detail(task) {
      this.goto({
        path: '/work-manage/detail',
        query: {
          id: task.id
        }
      })
    },
  }
});
</script>
<style lang="less" scoped>
.people-popup {
  transform: translateY(-100%);
  a {
    @apply supply-text-primary;
  }
  width: 260px;
  .people-popup-title {
    height: 30px;
    &.no-task {
      background: #6281a3;
    }
    .people-popup-icon {
      width: 11px;
      height: 16px;
      background-image: url('./assets/ic_account_balance.png');
      background-repeat: no-repeat;
      background-size: contain;
    }
  }
  .patch-btn {
    width: 80px;
    height: 28px;
    line-height: 28px;
  }
  .card {
    background: #edf7f7;
    &.no-task {
      background: #f2f7fc;
    }
  }
}
</style>