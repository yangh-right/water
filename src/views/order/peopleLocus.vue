<template>
  <div class="one-map">
    <div class="one-map-main">
      <Map ref="oneMap" @addTicket="addTicket" />
    </div>

    <TrailPanel :defaultRate="1" @hideLoading="hideLoading"></TrailPanel>

    <!-- 员工派单弹框 -->
    <TicketDialog ref="ticketDialog" :templateType="templateType" :templateData="templateData" />
    <!-- 加载中 -->
    <w-spin class="map-loading" v-if="loading"></w-spin>
  </div>
</template>

<script>
export default {
  name: 'peopleLocus',
  components: {
    TrailPanel: () => import('@/views/home/components/TrailPanel.vue'), //人员轨迹
    Map: () => import('./components/Map.vue'),
    TicketDialog: () => import('@/components/TicketDialog/index.vue')
  },
  data() {
    return {
      loading: false,
      templateData: {},
      templateType: 'zhjs-xjgd'
    };
  },
  methods: {
    hideLoading() {
      this.loading = false;
    },
    /**
     * 打开派单弹框
     */
    addTicket() {
      this.templateData = {
        id: new Date().valueOf()
      };
      this.$refs.ticketDialog && (this.$refs.ticketDialog.visible = true);
    }
  }
};
</script>

<style lang="less" scoped>
.one-map {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;

  .map-loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
  }
  &-main,
  &-main .map-wrapper {
    width: 100%;
    height: 100%;
    /deep/ .dpPopup {
      margin-bottom: 0;
      pointer-events: none;

      &:hover {
        z-index: 1;
      }

      .leaflet-popup-content-wrapper {
        padding: 0;
        background-color: transparent;
        border-radius: 6px;
        box-shadow: none;
      }

      .leaflet-popup-content {
        width: auto !important;
        margin: 0;

        & > div {
          pointer-events: auto;
        }

        p {
          margin-top: 0;
          margin-bottom: 0;
        }
      }

      .leaflet-popup-tip-container {
        display: none;
      }
    }
  }
}
</style>
