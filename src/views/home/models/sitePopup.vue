<template>
  <div ref="sitePopup" class="sitePopup" tabindex="-1" @mousedown.stop @click="handleClick">
    <div
      class="sitePopup-inner"
      :class="[popupClassName, { emAnimate: showEmAnimation }]"
      :style="{ width: checkListVisible() && flag ? '170px' : 'auto' }"
    >
      <w-tooltip overlayClassName="tooltip-black">
        <template
          v-if="popupClassName === 'offline' && site && site.pointList && site.pointList.length > 0"
          slot="title"
        >
          污水厂离线状态，数据最后一次上传时间为{{
            site.pointList[0].dateTime || ''
          }}，当前时刻数据不准确，供参考
        </template>
        <div class="sitePopup-header" :class="[popupClassName, { 'st-spec': !checkListVisible() }]">
          <div
            class="sitePopup-left"
            @click.stop="gotoPumpDetails(site)"
            :class="{ center: !checkListVisible() || !flag }"
          >
            <!-- <span class="sitePopup-tag" :style="{background:site.zoneColor}"></span> -->
            <p class="sitePopup-title">{{ site.siteName }}</p>
          </div>
        </div>
      </w-tooltip>
      <!-- <div v-if="checkListVisible()" class="sitePopup-main">  -->
      <div v-if="checkListVisible() && flag" class="sitePopup-main">
        <div class="sitePopup-list">
          <div
            v-for="(item, idx) in site.pointList"
            v-show="checkItemVisible(item)"
            :key="idx"
            class="sitePopup-item"
          >
            <p
              v-if="!pointControl || pointControl.itemVisible.name"
              class="sitePopup-label"
              :title="item.functionMemo"
            >
              {{ item.functionMemo }}
            </p>
            <p class="sitePopup-val">
              {{ item.pv }}
              <span v-if="!pointControl || pointControl.itemVisible.unit">{{ item.unit }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SitePopup',
  data() {
    return {
      showEmAnimation: false
    };
  },
  computed: {
    popupClassName() {
      if (this.site.isAlarm) {
        // 报警
        return 'alarm';
      } else if (this.site.isOff) {
        return 'offline';
      } else {
        return '';
      }
    },
    flag() {
      return this.site.isShowMain;
    }
  },
  methods: {
    gotoPumpDetails(site) {
      this.drillDown({
        path: '/runMonitor/pumpDetail',
        query: {
          pumpId: site.id
        }
      });
    },
    /**
     * 检查列表显示
     * @returns {boolean|*}
     */
    checkListVisible() {
      const _list = this.site.pointList;
      if (_list && _list.length) {
        if (!this.pointControl) return true;
        const _pointCheckList = this.pointControl.checkList;
        return _list.some(v => _pointCheckList.indexOf(v.functionName)) > -1;
      }
      return false;
    },
    /**
     * 检查列表项显示
     * @param item
     * @returns {boolean}
     */
    checkItemVisible(item) {
      if (!this.pointControl) return true;
      return this.pointControl.checkList.indexOf(item.functionName) > -1;
    },
    /**
     * 开启搜索定位动画
     */
    openAnimation() {
      this.animationTimeout && clearTimeout(this.animationTimeout);
      this.showEmAnimation = true;
      this.animationTimeout = setTimeout(() => {
        this.showEmAnimation = false;
      }, 1000);
    },

    /**
     * 点击打开弹窗
     */
    handleClick() {}
  }
};
</script>

<style scoped lang="less">
@keyframes alarm {
  from {
    transform: translate3d(-50%, -50%, 0) scale(1);
    opacity: 0.75;
  }
  to {
    transform: translate3d(-50%, -50%, 0) scale(1.1, 1.2);
    opacity: 0;
  }
}

.sitePopup {
  cursor: pointer;

  &-inner {
    position: relative;
    // min-width: 100px;
    // width: 170px;
    border-radius: 4px;
    box-shadow: 0 4px 10px 1px rgba(0, 0, 0, 0.1);
    background-color: var(--supply-color-bg-card-component);
    backdrop-filter: blur(2px);
    .sitePopup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 22px;
      padding-left: 8px;
      padding-right: 4px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      background-color: var(--supply-color-subTitle);
      &.st-spec {
        border-radius: 4px;
      }
    }
    &.offline {
      box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
      background-color: var(--supply-color-bg-card-component);

      .sitePopup {
        &-header {
          background-color: var(--supply-color-subTitle);
        }
      }
    }

    &.alarm {
      background-color: var(--supply-color-bg-card-component);

      .sitePopup {
        &-header {
          background-color: #f64357;
          animation: blink 0.7s linear infinite;
        }
      }
    }
  }

  &-left {
    flex: 1;
    display: flex;
    align-items: center;
    height: 100%;
    &.center {
      justify-content: center;
    }
  }

  &-title {
    display: flex;
    align-items: center;
    font-size: 12px;
    white-space: nowrap;
    color: var(--supply-color-bg-card-DEFAULT);
  }

  &-main {
    padding: 6px 0;
    overflow: hidden;
  }

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 22px;
    padding: 0 8px;
    font-size: 12px;
  }

  &-label {
    max-width: 100px;
    margin-right: 14px;
    color: var(--supply-color-secondary);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    &.alarm {
      color: var(--supply-color-danger-DEFAULT);
    }
  }

  &-val {
    font-weight: bold;
    white-space: nowrap;
    color: var(--supply-color-main);

    &.alarm {
      font-size: 14px;
      color: var(--supply-color-danger-DEFAULT);
    }

    span {
      margin-left: 4px;
      font-size: 10px;
      font-weight: normal;
      color: var(--supply-color-third);
    }
  }
}
@keyframes blink {
  0% {
    background-color: #f39ca6;
  }
  50% {
    background-color: #f64357;
  }
  100% {
    background-color: #f39ca6;
  }
}
@keyframes bounce {
  0%,
  20%,
  53%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateZ(0);
  }

  40%,
  43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -30px, 0) scaleY(1.1);
  }

  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -15px, 0) scaleY(1.05);
  }

  80% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateZ(0) scaleY(0.95);
  }

  90% {
    transform: translate3d(0, -4px, 0) scaleY(1.02);
  }
}
</style>

<style lang="less">
.tooltip-black.ant-tooltip {
  .ant-tooltip-arrow::before,
  .ant-tooltip-inner {
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
  }
}
</style>
