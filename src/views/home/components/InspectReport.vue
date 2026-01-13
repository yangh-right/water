<!--
 * @Description: 巡检报告
 * @Author: limz
 * @Date: 2021-08-24 11:30:17
 * @LastEditTime: 2021-09-30 09:01:18
 * @LastEditors: limz
-->
<template>
  <w-modal
    v-model="visible"
    :width="720"
    centered
    :title="info.inspectionContent + '-巡检报告'"
    :footer="false"
    @cancel="cancel"
  >
    <div ref="inspectReport" class="inspect-report">
      <div class="inspect-report-header">
        <p>
          <span class="supply-text-third">巡检人：</span>
          <span class="supply-text-main">{{ info.inspectionUserName }}</span>
        </p>
        <p>
          <span class="supply-text-third">巡检计划时间：</span>
          <span class="supply-text-main">{{ info.planStartTime }}</span>
        </p>
        <p>
          <span class="supply-text-third">巡检完成时间：</span>
          <span class="supply-text-main">{{ info.inspectionFinishTime }}</span>
        </p>

        <div v-for="item in offlineRecords" :key="item.id">
          <p>
            <span class="supply-text-third">巡检操作时间：</span>
            <span class="supply-text-main">{{ item.createTime }}</span>
          </p>
          <p>
            <span class="supply-text-third">泵房离线时间：</span>
            <span class="supply-text-main">{{ item.offlineTime }}</span>
          </p>
        </div>
      </div>
      <div class="inspect-report-content">
        <w-steps direction="vertical">
          <w-step v-for="(s, idx) in stepList" :key="s.id" status="finish">
            <span slot="icon" class="icon-step supply-border-primary"></span>
            <span slot="title" class="supply-text-sm title">
              <span class="supply-text-third">{{ `巡检步骤${idx + 1}：` }}</span>
              <span class="supply-text-main">
                {{ s.inspectionName || '--' }}
              </span>
            </span>
            <div slot="description">
              <div v-for="d in s.details" :key="d.id" class="details-item">
                <p>
                  <span class="supply-text-third name">{{ d.name }}</span>
                  <w-radio-group v-model="d.resultType" :disabled="true">
                    <w-radio :value="0" class="radio1">正常</w-radio>
                    <w-radio :value="1" class="radio1">异常</w-radio>
                    <w-radio :value="-1">无</w-radio>
                  </w-radio-group>
                </p>
                <div v-if="d.resultType === 1" class="anomaly">
                  <div v-for="(a, i) in anomalyItems" :key="a.code" :class="{ block: i <= 3 }">
                    <span class="supply-text-secondary">{{ a.name }}：</span>
                    <span
                      v-if="a.code === 'operatorName'"
                      class="supply-text-third value"
                      :title="s.operatorName"
                    >
                      {{ s.operatorName }}
                    </span>
                    <span v-else class="supply-text-main value" :title="a.value || d[a.code]">
                      {{ a.value || d[a.code] }}
                    </span>
                  </div>
                </div>
              </div>
              <template v-if="s.files.length > 0">
                <div
                  v-for="(item, idx) in s.files"
                  :key="item.url"
                  class="img-item"
                  @mouseenter="hoverIdx = idx"
                  @mouseleave="hoverIdx = -1"
                >
                  <img :src="baseImgApi + item.url" />
                  <span>{{ item.createTime }}</span>
                  <div class="hover-icon">
                    <w-icon
                      type="ic_resize_enlarge"
                      class="supply-text-lg supply-text-invert"
                      @click="showBigImg(baseImgApi + item.url)"
                    />
                    <!-- <i
                      class="supply-text-lg supply-text-invert icon-ic_resize_enlarge"
                      @click="showBigImg(baseImgApi + item.url)"
                    ></i> -->
                  </div>
                </div>
              </template>
            </div>
          </w-step>
        </w-steps>
      </div>
    </div>
    <div class="inspect-btns">
      <w-button class="back" @click="cancel">返回</w-button>
      <w-button class="download" type="primary" :loading="loading" @click="downloadPDF">
        下载
      </w-button>
    </div>
  </w-modal>
</template>

<script>
import {
  GetInspectionReport, // 巡检报告
  ExportReportPdf // 导出PDF
} from '@/api/home';
import serverConfig from '@/config/server.config';

export default {
  name: 'InspectReport',
  props: {
    planInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      baseImgApi: serverConfig.IMG_BASE_URL,
      visible: false,
      stepList: [],
      offlineRecords: [], // 泵房离线记录
      info: {},
      anomalyItems: [
        // {
        //   code: 'pumpName',
        //   name: '泵房名称',
        //   value: ''
        // },
        // {
        //   code: 'operatorName',
        //   name: '巡检人员',
        //   value: ''
        // },
        // {
        //   code: 'submitTime',
        //   name: '巡检日期'
        // },
        {
          code: 'name',
          name: '异常项目'
        },
        {
          code: 'unusualReasonDesc',
          name: '异常类型'
        },
        {
          code: 'unusualMemo',
          name: '异常描述'
        }
      ],
      loading: false,
      hoverIdx: -1 // 悬浮的图片下标
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.getReport();
      }
    }
  },
  methods: {
    /* 下载PDF */
    downloadPDF() {
      ExportReportPdf(this.planInfo.id).then(res => {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', `${this.planInfo.name} - 巡检报告.pdf`);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url); // 释放掉blob对象
        }, 200);
      });
    },

    /* 预览截图 */
    showBigImg(url) {
      this.visible = false;
      this.$emit('change', true, url, 'reportModal');
      // this.bigImgVisible = true;
      // this.previewImg = url;
    },

    /* 巡检报告 */
    async getReport() {
      let { status, resultData } = await GetInspectionReport(this.planInfo.id);
      if (status === 'complete') {
        let {
          data,
          inspectionFinishTime,
          inspectionUserName,
          planStartTime,
          inspectionContent,
          offlineRecords
        } = resultData;
        this.stepList = data;
        this.offlineRecords = offlineRecords || [];
        this.info = { inspectionFinishTime, inspectionUserName, planStartTime, inspectionContent };
      }
    },

    cancel() {
      this.visible = false;
    }
  }
};
</script>

<style scoped lang="less">
.inspect-report {
  position: relative;
  padding: 24px 133px;
  height: 420px;
  overflow: auto;
  &-header {
    .title {
      font-family: PingFangSC-Regular, sans-serif;
      margin-bottom: 12px;
    }
    & > p {
      margin-bottom: 16px;
      span.supply-text-third {
        display: inline-block;
        width: 98px;
      }
    }
  }
  &-content {
    .wpg-steps {
      .icon-step {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border-width: 2px;
        border-style: solid;
        position: relative;
        top: -3px;
      }
      /deep/ .wpg-steps-item-title {
        padding-bottom: 12px;
      }
      .details-item {
        margin-bottom: 16px;
        .name {
          display: inline-block;
          width: 210px;
        }
        .wpg-radio-wrapper.radio1 {
          margin-right: 60px;
        }
        .anomaly {
          // background-color: #f2f5f5;
          background-color: var(--supply-color-bg-card-tint);
          padding: 20px 24px 4px;
          margin-top: 16px;
          .block {
            margin-bottom: 10px;
          }
          li {
            margin-bottom: 16px;
            .value {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            &.block {
              // width: 50%;
              width: 100%;
              display: inline-block;
              .value {
                display: inline-block;
                // max-width: 98px;
                white-space: normal;
                position: relative;
                top: 5px;
              }
            }
          }
        }
      }
      .img-item {
        display: inline-block;
        width: 146px;
        height: 100px;
        margin-right: 20px;
        padding: 5px;
        // background-color: #f7fafa;
        background-color: var(--supply-color-bg-card-tint);
        position: relative;
        overflow: hidden;
        img {
          width: 146px;
          height: 100px;
        }
        span {
          font-size: 12px;
        }
        .hover-icon {
          width: 0;
          height: 0;
          overflow: hidden;
          transition: all 0.1s;
        }
        &:hover {
          .hover-icon {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            i {
              z-index: 9;
              cursor: pointer;
              &:hover {
                font-size: 26px;
              }
            }
          }
          &::after {
            content: '';
            display: inline-block;
            width: 136px;
            height: 100px;
            position: absolute;
            top: 5px;
            left: 5px;
            background: rgba(0, 0, 0, 0.45);
          }
        }
      }
    }
  }
}
.inspect-btns {
  text-align: right;
  .wpg-btn {
    // height: 28px;
  }
  .back {
    margin-right: 10px;
  }
}
</style>
