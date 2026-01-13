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
    :title="planInfo.excCount + '项异常'"
    :footer="false"
    @cancel="cancel"
  >
    <div class="anomaly">
      <template v-if="anomalyList.length > 0">
        <div v-for="(a, idx) in anomalyList" :key="a.inspectDetail.id" class="anomaly-item">
          <div class="title supply-text-main">
            <!-- {{ dealDev(a.ticketInfo.formValue) }}： -->
            <!-- {{ a.inspectDetail.unusualMemo }} -->
            {{ a.inspectDetail.location ? `${a.inspectDetail.location.split('-')[0]}` : '' }}: {{ a.inspectDetail.unusualReasonDesc }}        {{ a.inspectDetail.unusualMemo }}
            <w-button type="primary" v-if="!a.inspectDetail.ticketId" class="send-ticket" @click="handleAdd(a)">派单</w-button>
            <!-- JSON.parse(a.ticketInfo.formValue.pumpHouseDevice).join(', ') || '--' -->
          </div>
          <div class="con supply-text-main">
            <p v-if="a.inspectDetail.ticketId">
              工单编号：
              <span  class="supply-text-primary supply-cursor-pointer" @click="ticketDetails(a.ticketStatus.ticketId)">
                {{ a.ticketInfo.ticketNo }}
              </span>
            </p>
            <!-- <p>{{ a.ticketInfo.formValue.questionDescribe || '' }}</p> -->
          </div>

        <div class="steps">
          <w-steps
            v-if="a.stepDetail.length"
            :style="{ width: (a.stepDetail.length * 100) / 6 + '%' }"
            :current="a.current"
            size="small"
          >
            <w-step v-for="(item, index) of a.stepDetail" :key="item.id">
              <template slot="icon">
                <img
                  v-if="index === a.current"
                  src="@/assets/images/default/cockpit/step-current.png"
                  alt=""
                />
              </template>
              <template slot="title">
                {{ item.stepName }}
              </template>
              <template slot="description">
                <p class="name">{{ item.waitAcceptName || '--' }}</p>
                <p v-if="item.stepEndTime" class="time">
                  {{ item.stepEndTime.replace(/T/g, ' ') }}
                </p>
                <p v-else>--</p>
              </template>
            </w-step>
          </w-steps>
        </div>

          <w-divider v-if="idx < anomalyList.length - 1" />
        </div>
      </template>
      <w-empty v-else />
    </div>
  </w-modal>

  <ticket-dialog
    ref="ticketDialog"
    templateType="waterRepair"
    :templateData="templateData"
    @change="createCallback"
  />
  </div>
</template>

<script>
import TicketDialog from '@/components/TicketDialog/index';
import { GetTicketDetails, CallbackTicketNo } from '@/api/home';
import moment from 'moment';
import serverConfig from '@/config/server.config';
import { outWork } from "@/core/external"
export default {
  name: 'AnomalyDetails',
  components: { TicketDialog },
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
      itemId: '' // 创建工单的记录id
    };
  },
  computed: {
    countTime() {
      return (endTime, startTime) => {
        return moment(endTime).diff(moment(startTime), 'hour');
      };
    },
    dealDev() {
      return info => {
        let { pumpHouseDevice, deviceIds } = info;
        let dev =
          pumpHouseDevice && pumpHouseDevice !== '--'
            ? pumpHouseDevice
            : deviceIds || '';
        return dev; // .join(', ');
      };
    }
  },
  watch: {
    visible(val) {
      if (val) this.getAnomalys();
    }
  },
  methods: {
    cancel() {
      this.visible = false;
    },
    getAnomalys() {
      GetTicketDetails(this.planId).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.anomalyList = resultData.map(r => {
            let { ticketInfo = {}, ticketStatus={}, stepDetailMap = [], stepBaseList = [] } = r.ticketDetail || {};
            let current = 0;
            let detail = [];
            // for (let i in stepDetailMap) {
            //   if (stepDetailMap[i][0]) {
            //     if (stepDetailMap[i][0]?.stepEndTime) {
            //       current++;
            //     }
            //     detail.push(stepDetailMap[i][0]);
            //   }
            // }

            stepBaseList.forEach(item => {
              if (stepDetailMap[item.stepCode][0].stepEndTime) {
                current++;
              }
              detail.push(stepDetailMap[item.stepCode][0]);
            });

            // stepEndTime 存在并不一定代表存在下一节点
            if (current >= detail.length) {
              current = detail.length - 1;
            }

            return {
              ticketInfo,
              ticketStatus,
              detail,
              current,
              inspectDetail: r,
              stepDetail: detail
            };
          });
        }
      });
    },
    /* 跳转工单详情 */
    ticketDetails(id) {
      this.goto({
        path: '/work-manage/detail',
        query: {
          id: id
        }
      })
    },

    /* 创建工单 */
    handleAdd(record) {
      let inspectDetail = record.inspectDetail;
      this.itemId = inspectDetail.id;
      let deviceId = inspectDetail.location?.split('-')[0];
      this.templateData = {
        id: this.itemId,
        type: 1,
        pumpId: this.planInfo.pumpId,
        orgIds: this.planInfo.orgId,
        images: [],
        deviceIds: deviceId,
        ticketAddress: {
          address: this.planInfo.pumpHouseAddress || '',
          point: {}
        }
      };
      this.$refs.ticketDialog && (this.$refs.ticketDialog.visible = true);
    },
    // 工单创建成功回调
    createCallback(data) {
      if (data?.id) {
        // 更新ticketNo 到数据库
        CallbackTicketNo({
          ticketNo: data.ticketNo,
          resultDetailId: this.itemId
        }).then(res => {
          if (res.status === 'complete') {
            this.getAnomalys();
          }
        });
      }
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
