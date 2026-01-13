<template>
  <div class="content">
    <w-spin :spinning="loading" class="spin">
      <div class="table-wrapper">
        <hooper
          v-if="alarmList.length > 0"
          :infiniteScroll="true"
          class="note"
          :itemsToShow="1"
          :transition="500"
          :centerMode="true"
          :autoPlay="true"
          :vertical="true"
          :playSpeed="5000"
        >
          <slide class="note__slice" v-for="(item, index) in alarmList" :key="item.info">
            <div class="note__item">
              <img src="@/assets/images/modules/allowWay/note.png" /><span :title="item.info">{{
                item.info
              }}</span>
            </div>
          </slide>
        </hooper>
      </div>
    </w-spin>
  </div>
</template>

<script>
import 'hooper/dist/hooper.css';
import { Hooper, Slide } from 'hooper';
import { processControl } from '@/api/analysis.js';

export default {
  name: 'ProcessMonitor',
  components: {
    Hooper,
    Slide
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      alarmInterval: null,
      alarmList: []
    };
  },
  inject: ['state'],
  computed: {},
  watch: {
    waterPlantId: {
      handler(val) {
        this.initData(val);
        this.alarmInterval = setInterval(() => {
          this.initData(val);
        }, 60000);
      }
    }
  },
  methods: {
    async initData(id) {
      this.loading = true;
      let { status, resultData } = await processControl(id);
      this.loading = false;
      if (status === 'complete') {
        if (resultData.length) {
          this.alarmList = resultData;
        } else {
          this.alarmList = [];
        }
      }
    }
  },
  mounted() {
    this.$once('hook:beforeDestroy', () => {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    });
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 36px;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  .spin {
    height: 100%;
  }
  .table-wrapper {
    height: 100%;
    padding: 0 12px;
    box-sizing: border-box;
    margin: 0;
  }

  /deep/ .note {
    overflow: hidden;
    height: 100%;
    .hooper-list {
      overflow: hidden;
    }
    .note__slide {
      height: 40px !important;
    }
    .note__item {
      height: 40px;
      display: flex !important;
      align-items: center;
      > img {
        display: inline-block;
        width: 24px;
        margin-left: 16px;
        margin-right: 14px;
      }
      > span {
        display: inline-block;
        max-width: 596px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .hooper-indicators {
      position: relative;
      top: 2px;
      li {
        line-height: 0.2;
        .hooper-indicator {
          width: 4px;
          height: 4px;
          border-radius: 2px;
          background-color: #9ca8be;
          &.is-active {
            background-color: var(--supply-color-primary-DEFAULT);
          }
        }
      }
    }
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
