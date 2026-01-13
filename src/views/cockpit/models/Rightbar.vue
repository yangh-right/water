<!--
 * @Author: wangyr
 * @Date: 2023-02-09 09:28:33
 * @LastEditors: fengtaotao
 * @LastEditTime: 2024-10-24 11:02:47
 * @Description:
-->
<template>
  <div class="sidebar">
    <div class="table-container">
      <evaluate-result
        v-show="buttonCodes['sludgeEvaluation']"
        :factoryId="factoryId"
      ></evaluate-result>
      <ticket-type v-show="buttonCodes['ordesType']"></ticket-type>
      <alarm-info :factoryId="factoryId"></alarm-info>
      <device-maintain :factoryId="factoryId"></device-maintain>
    </div>
  </div>
</template>

<script>
import EvaluateResult from '../components/EvaluateResult.vue';
import AlarmInfo from '../components/AlarmInfo.vue';
import DeviceMaintain from '../components/DeviceMaintain.vue';
import TicketType from '../components/TicketType.vue';
import { mapState } from 'vuex';
export default {
  name: 'Rightbar',
  components: {
    EvaluateResult,
    AlarmInfo,
    DeviceMaintain,
    TicketType
  },
  props: {
    factoryId: {
      type: String,
      required: true,
      default: ''
    }
  },
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  data() {
    return {
      currentModules: []
    };
  },
  watch: {},
  methods: {}
};
</script>

<style lang="less" scoped>
.sidebar {
  width: 100%;

  .table-container {
    height: 100%;
  }
  /deep/.card-box {
    height: 33.3%;
    position: relative;
    background: var(--supply-color-bg-card-DEFAULT);
    .card-title {
      font-family: PingFangSC-Medium, sans-serif;
      font-weight: 500;
      font-size: 16px;
      color: var(--supply-color-main);
      letter-spacing: 0;
      margin-bottom: 10px;
    }
  }
}
</style>
