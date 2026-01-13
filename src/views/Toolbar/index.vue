<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-08-17 11:20:19
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-03-04 09:54:10
 * @Description:
-->
<template>
  <div class="supply-toolbar supply-text-main supply-flex supply-items-center">
    <Bulletin v-permission:button="'bulletin_top_entrance'"/>
    <!-- 通知 -->
    <Message :option="noticeOption" v-permission:button="'notice_top_entrance'"/>
    <Alarm v-permission:button="'alarm_top_entrance'"/>
    <!-- 工单 -->
    <Message :option="orderOption" v-permission:button="'order_top_entrance'"/>
    <IosPopup />
  </div>
</template>
<script>
import { computed, defineComponent, onMounted, getCurrentInstance, onUnmounted, reactive, toRefs } from '@vue/composition-api';
import Bulletin from "./Bulletin.vue";
import Message from "./Message.vue";
import Alarm from "./Alarm.vue";
import IosPopup from "./IosPopup.vue";
import { Fragment } from 'vue-fragment';
import { GetInspNum } from '@/api/home';
import { useStore, useThis } from "@/utils/composition";

export default defineComponent({
  components: {
    Fragment,
    Bulletin,
    Message,
    Alarm,
    IosPopup
  },
  setup() {
    const _this = getCurrentInstance()?.proxy;
    const store = useStore()
    const state = reactive({
      noticeOption: {
        code: 'notice',
        name: '通知',
        icon: 'ic_email',
        clientType: '2'
      },
      orderOption: {
        code: 'order',
        name: '工单',
        icon: 'ic_assignment_24px',
        clientType: '4'
      },
      inspectNumber: 0,
      timer: null,
      hasNotice: computed(() => store.state.configure.hasNotice)
    });

    async function getInspectionNumber() {
      try {
        let { status, resultData } = await GetInspNum();
        if (status === 'complete') {
          state.inspectNumber = resultData;
        }
      } catch(error) {
        console.error('getInspectionNumber:', error);
      }
    }

    onMounted(() => {
      getInspectionNumber();

      state.timer = setInterval(() => {
        getInspectionNumber();
      }, 5000);
    });

    onUnmounted(() => {
      clearInterval(state.timer);
    });

    function goRouting() {
      _this.drillDown({ path: '/inspect' });
    }

    return {
      ...toRefs(state),
      goRouting
    };
  }
});
</script>
<style lang="less" scoped>
.supply-toolbar {
  color: #fff;
}
</style>
