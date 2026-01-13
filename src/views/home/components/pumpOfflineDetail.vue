<!--
 * @Description:巡检列表异常弹窗
 * @Author: limz
 * @Date: 2021-08-31 17:28:04
 * @LastEditTime: 2021-11-30 22:31:49
 * @LastEditors: limz
-->
<template>
  <div>
  <w-modal
    class="secondary-modal"
    v-model="visible"
    wrapClassName="anomalyModal"
    :width="1024"
    centered
    :title="pumpOfflineList.length + '项异常'"
    :footer="false"
    @cancel="cancel"
  >
    <div class="anomaly">
      <template v-if="pumpOfflineList.length > 0">
        <div v-for="(a, idx) in pumpOfflineList" :key="a.id" class="anomaly-item">
          <div class="title supply-text-main">
            泵房离线：{{ a.skip === 0 ? '未巡检成功':'跳过'}}     离线时间：{{a.offlineTime}}
          </div>
          <w-divider v-if="idx < pumpOfflineList.length - 1" />
        </div>
      </template>
      <w-empty v-else />
    </div>
  </w-modal>
  </div>
</template>

<script>
import { getPumpOfflineListByPlanId } from '@/api/home';
import moment from 'moment';
import serverConfig from '@/config/server.config';
import { outWork } from "@/core/external"
export default {
  name: 'pumpOfflineDetail',
  props: {
    planId: {
      type: [String, Number],
      default: ''
    },
    planInfo: {
      type: Object,
      default: () => {}
    }
  },
  inject: ['linkToOther'],
  data() {
    return {
      visible: false,
      baseImgApi: serverConfig.IMG_BASE_URL,
      anomalyList: [],
      templateData: {}, // 创建工单数据
      itemId: '' ,// 创建工单的记录id,
      pumpOfflineList: []
    };
  },
  computed: {

  },
  watch: {
    visible(val) {
      if (val) this.getPumpOfflineList();
    }
  },
  methods: {
    cancel() {
      this.visible = false;
    },

    // 根据planId 获取泵房离线详情
    getPumpOfflineList() {
      getPumpOfflineListByPlanId(this.planId).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.pumpOfflineList = resultData || [];
        }
      })
    }

  }
};
</script>

<style scoped lang="less">
@height: 24px;
/deep/.anomalyModal .ant-modal-body {
  padding: 0;
}
.anomaly {
  padding: 20px 53px 40px;
  &-item {
    .title {
      position: relative;
      &::before {
        content: '';
        display: inline-block;
        width: 3px;
        height: 12px;
        background-color: #08a0a3;
        position: absolute;
        top: 5px;
        left: -10px;
      }
    }
    .con {
      margin: 12px 0 25px;
    }
    .steps {
      /deep/ .ant-steps-item {
        &-icon {
          width: @height;
          height: @height;
          .ant-steps-icon {
            font-size: 14px;
            // top: -1px;
            img {
              width: 100%;
              height: auto;
              position: relative;
              top: -2px;
            }
          }
        }
        &-title {
          line-height: @height;
          &::after {
            top: 13px;
          }
        }
        &-description {
          max-width: 240px;
          padding-top: 25px;
          & > div > p {
            margin-bottom: 16px;
            span {
              width: 84px;
              display: inline-block;
            }
          }
        }
      }
    }
    .ant-divider {
      margin: 4px 0 20px;
    }
  }

  .send-ticket {
    right: 0;
    position: absolute;
    height: 28px;
  }
}
</style>
