<template>
  <div class="alarm-detail-con">
    <div class="body-block">
      <div>
        <div :class="[imgUrl !== '' ? 'blocksmallone' : '', 'item-block']">
          <p class="item-title dis-flex">
            <span class="supply-text-title">报警详情</span>
            <a class="a-style" @click="goToPage">更多报警</a>
          </p>
          <p class="item-title dis-flex">
            <a
              @click="
                drillDown({
                  path: '/runMonitor/pumpDetail',
                  query: { pumpId: alarmInfo.pumpHouseId }
                })
              "
              >{{ alarmInfo.pumpHouseName }}</a
            >
            <span class="name supply-text-title">报警时间：{{ detailData.startTime }}</span>
          </p>
          <div class="detail-block">
            <div>
              <img :src="alarmInfoImg" alt />
              <p :class="`alarm-level${alarmInfo.level}`">{{ alarmInfo.alarmLevelName }}</p>
            </div>
            <div class="item">
              <p>{{ alarmInfo.deviceName }}</p>
              <p :style="{ color: 'red' }">{{ alarmInfo.alarmName }}</p>
              <p>
                <span class="name">报警状态：</span>
                <span class="value supply-text-main">
                  {{
                    alarmInfo.confirm === 1 ? '确认' : alarmInfo.confirm === 0 ? '未确认' : '忽略'
                  }}
                </span>
                <span class="name">是否创建工单：</span>
                <span class="value supply-text-main">
                  {{ alarmInfo.orderId ? '已创建' : '未创建' }}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div v-show="imgUrl !== ''" class="img-block">
          <span class="item-title supply-text-title">报警图片：</span>
          <img class="file-item supply-ml-3" :src="imgUrl" @click="handlePreview(imgUrl)" />
        </div>
        <div :class="[imgUrl !== '' ? 'blocksmall' : '', 'item-block']">
          <span class="item-title supply-text-title">相关知识</span>
          <div v-if="alarmInfo.reason" class="knowledge-con" v-html="alarmInfo.reason"></div>
          <div v-else class="knowledge-con">
            <w-empty size="small" style="width:260px;margin:auto"></w-empty>
          </div>
        </div>
      </div>

      <div class="item-block">
        <div class="supply-flex supply-items-center supply-mb-2">
          <p class="item-title supply-mr-auto supply-mb-0">参数及规则</p>
        </div>
        <div class="rule-block" :title="alarmInfo.ruleDesc">
          <span class="name">报警规则：</span>
          {{ alarmInfo.ruleDesc }}
        </div>
        <p class="item-title">数据分析</p>
        <div class="data-con">
          <search
            @changeType="changeType"
            ref="search"
            class="right-header supply-bg-bg-card-DEFAULT"
            @search="onSearch"
          >
            <template slot="radio" slot-scope="props">
              <w-radio-button @click.stop="toAlarmTime" v-show="props.type === '0'" value="alarm"
                >报警数据快照</w-radio-button
              >
            </template>
          </search>
          <chart-table
            :chart-min-num="1"
            :chart-item-height="240"
            :pumpHouseName="alarmInfo.pumpHouseName"
            type="multiple"
            :search-line-info="searchLineInfo"
            :search-run-info="searchRunInfo"
            :tips="tips"
            :min="min"
            :max="max"
            page="inspect"
          ></chart-table>
        </div>
      </div>
    </div>
    <div class="foot-block">
      <w-button
        v-if="buttonCodes['alarm_ticketConfirm_show']"
        :disabled="alarmInfo.confirmStatus !== 0"
        @click="confirmAlarm"
        >确认</w-button
      >
      <w-button
        v-if="!alarmInfo.ticketId && buttonCodes['alarm_ticketCreate_show']"
        type="primary"
        @click="handleAdd"
        >派单</w-button
      >
      <w-button
        v-if="alarmInfo.ticketId && buttonCodes['alarm_ticketDetail_show']"
        type="primary"
        @click="toTicketDetail(alarmInfo.pumpHouseName)"
        >工单详情</w-button
      >
      <w-button type="primary" @click="toTicketAnalysis(alarmInfo)">报警分析</w-button>
    </div>

    <ticket-dialog
      ref="ticketDialog"
      :templateType="'zhjs-xjgd'"
      :templateData="templateData"
      @update="handleUpdate"
      @createTicket="getAlarmdetail"
    />
    <!-- 报警确认 -->
    <drag-modal
      @close="confirmClose"
      class="alarmdetail-sure"
      ref="alarmConfirm"
      :width="500"
      :height="220"
      :mask="true"
      :isShowFullBtn="false"
      title="报警确认"
    >
      <div class="form-body">
        <w-form>
          <w-form-item v-bind="formItem" label="备注:">
            <w-textarea v-model="remarks" :max="200" placeholder="请输入"></w-textarea>
          </w-form-item>
        </w-form>
      </div>
      <div class="form-footer supply-text-right">
        <w-button
          type="primary"
          class="supply-mr-3"
          ghost
          :disabled="confirmLoading"
          @click="handleReset"
          >取消</w-button
        >
        <w-button
          type="primary"
          class="supply-mr-3"
          :loading="confirmLoading"
          @click="handleConfirm"
          >确定</w-button
        >
      </div>
    </drag-modal>
    <w-modal
      v-if="videoVisible"
      v-model="videoVisible"
      class="video-model secondary-modal"
      :width="'600px'"
      :bodyStyle="{ padding: '8px 16px', height: '500px' }"
      centered
      :footer="null"
    >
      <template slot="title">
        <w-select
          v-model="curVideoId"
          placeholder="请选择视频"
          @change="handleChangeAlarmVideo"
          @dropdownVisibleChange="handlerDropdownVisibleChange"
        >
          <w-select-option v-for="video in videoList" :key="video.videoId" :value="video.videoId">{{
            video.videoName
          }}</w-select-option>
        </w-select>
      </template>
      <video-iframe
        ref="videoIframe"
        :videoId="videoItem.videoId"
        :videoType="videoItem.videoType"
        :outerSize="[600, 560]"
      ></video-iframe>
    </w-modal>
    <!-- 图片大图 -->
    <w-modal
      :visible="imgVisible"
      width="600px"
      :footeeleteDevicer="null"
      :footer="null"
      @cancel="imgVisible = false"
    >
      <img style="width: 100%" :src="previewImgUrl" />
    </w-modal>
  </div>
</template>

<script>
import TicketDialog from '@/components/TicketDialog/index';
import chartTable from '@/components/HistoryMultiChart/chartTable.vue';
import videoIframe from '@/components/VideoModels/videoIframe';
import search from '@/components/history/search.vue';
import { alarmDetailInfo, alarmDetailImgInfo, doConfirm } from '@/api/diagnosis';
import { sysDictListByCode } from '@/api/manage';
import { knowDetailbypageId } from '@/api/work';
import { getButtonPermission } from '@/utils/js/tool/tools';
import { mapState } from 'vuex';
import { outWork } from '@/core/external';
import { Base64 } from 'js-base64';
import storage from '@/utils/storage';
import { USER_INFO } from '@/store/mutation-types';
import DragModal from '@/components/DragModal';

export default {
  name: 'AlarmDetail',
  components: { chartTable, search, TicketDialog, videoIframe, DragModal },
  props: ['detailData'],
  inject: ['linkToOther'],
  data() {
    return {
      videoVisible: false,
      curVideoId: '',
      interval: 'alarm',
      searchLineInfo: null,
      searchRunInfo: null,
      remarks: '',
      confirmId: '',
      formItem: {
        labelCol: { span: 2 },
        wrapperCol: { span: 22 }
      },
      tips: '请选择设备或者监测量！',
      confirmLoading: false,
      titleSearch: {
        dates: [
          {
            startTime: this.$moment()
              .subtract(1, 'hours')
              .format('YYYY-MM-DD HH:mm:ss'),
            endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
          }
        ],
        period: '1',
        timeEnum: 'MINUTES'
      },
      detailList: [
        {
          label: '报警名称',
          width: '50%',
          value: '欠压',
          tip: '1'
        },
        {
          label: '报警类型',
          width: '50%',
          value: '压力报警',
          tip: ''
        },
        {
          label: '报警设备',
          width: '50%',
          value: '高区',
          tip: ''
        },
        {
          label: '报警值',
          width: '50%',
          value: '0.65',
          tip: ''
        },
        {
          label: '报警时间',
          width: '100%',
          value: '2021-07-28 20:04:12',
          tip: ''
        },
        {
          label: '报警状态',
          width: '50%',
          value: '未确认',
          tip: ''
        },
        {
          label: '工单状态',
          width: '50%',
          value: '未创建',
          tip: ''
        }
      ],
      knowledge: {},
      alarmInfo: {},
      imgVisible: false,
      previewImgUrl: '',
      imgUrl: '',
      templateData: null,
      alarmType: [],
      alarmInfoImg: require('@/assets/images/default/icons/img_default_alarm.png'),
      min: 0,
      max: 0,
      flag: false,
      timeQuantum: '0',
      waterPlantId: '',
      videoList: [], // 报警视频下拉列表数据
      videoItem: {} // 当前播放报警视频
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  watch: {
    $attrs(val) {
      this.getAlarmdetail();
    },
    videoItem(val) {
      this.curVideoId = val.videoId;
    }
  },
  mounted() {
    this.getWaterPlant();
    this.getAlarmdetail();
  },
  methods: {
    async getWaterPlant() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.waterPlantId = resultData?.[0]?.id || '';
    },
    // 报警视频下拉框选择切换播放视频
    handleChangeAlarmVideo(value) {
      this.videoItem = this.videoList.filter(item => item.videoId === value)[0];
    },
    handlerDropdownVisibleChange(status) {
      this.$refs.videoIframe && this.$refs.videoIframe.setHideVideo(status);
    },
    goToPage() {
      this.drillDown({
        path: '/alarmCenter'
      });
      this.$emit('close');
    },
    goToVideo() {
      this.videoList = this.alarmInfo.videoList;
      if (this.videoList.length > 0) {
        this.videoItem = this.videoList[0];
        this.videoVisible = true;
      } else {
        this.$message.error('暂未配置视频');
      }
    },
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[data] = res.resultData;
    },

    onSearch(val) {
      this.timeQuantum = '1';
      this.titleSearch = val;
      this.dealParams();
    },
    handleConfirm() {
      const userInfo = JSON.parse(Base64.decode(storage.get(USER_INFO)));
      let params = {
        alarmId: this.detailData.alarmId,
        confirmDesc: this.remarks,
        confirmType: '其他',
        userName: userInfo.userName
      };
      this.confirmLoading = true;
      doConfirm(params)
        .then(res => {
          let { status } = res;
          if (status === 'complete') {
            this.$message.success('确认成功');
            this.$refs.alarmConfirm.visible = false;
            this.getAlarmdetail();
            // this.alarmInfo.confirmStatus = 1
            this.$emit('change');
          }
        })
        .finally(() => {
          this.confirmLoading = false;
        });
    },
    handleReset() {
      this.remarks = '';
      this.$refs.alarmConfirm.visible = false;
    },
    /* 工单 */
    handleAdd() {
      this.templateData = {
        id: this.detailData.alarmId || '',
        pumpId: this.alarmInfo.pumpHouseId,
        orgIds: this.alarmInfo.orgId || '',
        knowledgeCode: this.alarmInfo.knowledgeId || '',
        deviceIds: this.alarmInfo.deviceId,
        title: `${this.alarmInfo.pumpHouseName}发现${this.alarmInfo.alarmContent},请及时处理！`,
        questionDescribe: `${this.alarmInfo.startTime}${this.alarmInfo.pumpHouseName},发现${this.alarmInfo.alarmContent},请及时处理！`,
        type: 0,
        content: `${this.alarmInfo.startTime}${this.alarmInfo.pumpName}污水厂,发生${this.alarmInfo.alarmContent}报警,请及时了解情况并采取响应措施。`,
        // content: this.alarmInfo.alarmContent,
        ticketAddress: {
          address: this.alarmInfo.pumpHouseAddress,
          point: {
            lat: this.alarmInfo.lati || '',
            lng: this.alarmInfo.loni || ''
          }
        },
        workSource: 'homeCall'
      };
      this.$refs.ticketDialog && (this.$refs.ticketDialog.visible = true);
    },
    changeType(type) {
      if (type === '0') {
        this.toAlarmTime();
      }
    },
    confirmClose() {
      this.remarks = '';
    },
    toAlarmTime() {
      this.timeQuantum = '0';
      this.$refs.search.form.interval = 'alarm';
      this.$refs.search.form.space = '1';
      if (this.alarmInfo.startTime) {
        this.titleSearch = {
          dates: [
            {
              startTime: this.$moment(this.alarmInfo.startTime)
                .subtract(10, 'minutes')
                .format('YYYY-MM-DD HH:mm:ss'),
              endTime: this.$moment(this.alarmInfo.startTime)
                .add(10, 'minutes')
                .format('YYYY-MM-DD HH:mm:ss')
            }
          ],
          period: '1',
          timeEnum: 'MINUTES'
        };
      }
      this.dealParams();
    },
    handleUpdate() {},
    confirmAlarm() {
      this.$refs.alarmConfirm.visible = true;
    },
    getAlarmdetail() {
      if (this.$refs.search) {
        this.$refs.search.form.interval = 'alarm';
      }
      if (this.detailData?.alarmId) {
        this.flag = true;
        alarmDetailInfo(this.detailData.alarmId).then(async res => {
          this.alarmInfo = res.resultData;
          // this.imgUrl = '/api/userCenterApi/FileManager/download/0c036c95c31a5c598eeb83fd204db4fa';
          if (this.detailData?.typeCode === 'water_purification_smoke') {
            this.imgUrl = this.alarmInfo?.fileIdUrlVOS?.[0]?.imageUrl || '';
          }
          if (this.alarmInfo.startTime) {
            this.titleSearch = {
              dates: [
                {
                  startTime: this.$moment(this.alarmInfo.startTime)
                    .subtract(10, 'minutes')
                    .format('YYYY-MM-DD HH:mm:ss'),
                  endTime: this.$moment(this.alarmInfo.startTime)
                    .add(10, 'minutes')
                    .format('YYYY-MM-DD HH:mm:ss')
                }
              ],
              period: '1',
              timeEnum: 'MINUTES'
            };
          }
          this.dealParams();
          this.min = res.resultData.minData ? Number(res.resultData.minData) : 0;
          this.max = res.resultData.maxData ? Number(res.resultData.maxData) : 0;
          this.getKnowDetailbypageId(res.resultData.knowledgeId);
        });
      }
    },
    handlePreview(src) {
      this.imgVisible = true;
      this.previewImgUrl = src;
    },
    dealParams() {
      const subPoints = this.alarmInfo.subPointList?.map(item => item.pointLongCode) || [];
      const points = this.alarmInfo.pointLongCode
        ? [this.alarmInfo.pointLongCode, ...subPoints]
        : subPoints;
      // 设备平台负重大，前端代码调整
      this.searchLineInfo = {
        devicePoints: [
          { deviceId: this.alarmInfo.industryDeviceId || this.detailData.deviceId, points: points }
        ],
        deviceType: 'INDUSTRY_DEVICE',
        displayType: [],
        ...this.titleSearch
      };
      if (this.timeQuantum !== '1') {
        let startTime = this.$moment(this.alarmInfo.startTime)
          .subtract(5, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss');
        let endTime = this.$moment(this.alarmInfo.startTime)
          .add(5, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss');
        let startDay = this.$moment(this.alarmInfo.startTime).format('YYYY-MM-DD 00:00:00');
        let endDay = this.$moment(this.alarmInfo.startTime).format('YYYY-MM-DD 23:59:59');
        let startDiff = this.$moment(this.alarmInfo.startTime).diff(
          this.$moment(startDay),
          'minutes'
        );
        let endDiff = this.$moment(endDay).diff(this.$moment(this.alarmInfo.startTime), 'minutes');
        if (startDiff < 5) {
          startTime = startDay;
          endTime = this.$moment(this.alarmInfo.startTime)
            .subtract(-5, 'minutes')
            .format('YYYY-MM-DD HH:mm:ss');
        }
        if (endDiff < 5) {
          startTime = this.$moment(this.alarmInfo.startTime)
            .subtract(5, 'minutes')
            .format('YYYY-MM-DD HH:mm:ss');
          endTime = endDay;
        }
        this.searchLineInfo = {
          ...this.searchLineInfo,
          queryInfluxDBOnly: true,
          dates: [{ startTime, endTime }]
        };
      }
      this.tips = '';
    },

    getKnowDetailbypageId(id) {
      if (!id) {
        this.knowledge = {};
        return false;
      }
      knowDetailbypageId(id).then(res => {
        this.knowledge = res.resultData || {};
      });
    },
    // 跳转工单详情页
    toTicketDetail() {
      this.goto({
        path: '/work-manage/detail',
        query: {
          id: this.alarmInfo.ticketId
        }
      });
      this.$emit('close');
    },
    // 跳转规则详情页
    toTicketAnalysis() {
      this.drillDown({
        path: '/alarmAnalysis',
        query: {
          alarmId: this.detailData.alarmId,
          alarmTime: this.detailData.startTime,
          waterPlantId: this.waterPlantId,
          record: this.detailData.record
        }
      });
      this.$emit('close');
    },
    toRuleDetail() {
      this.linkToOther(
        `/water_purification/editRegulation?ruleId=${this.alarmInfo.ruleSnapshotId ??
          ''}&ruleType=${this.alarmInfo.formType}`
      );
    },
    toKnowledgeDetail(bookId, id) {
      if (getButtonPermission('viewKnowledgeDetail')) {
        this.drillDown({ path: '/order/KnowDetail', query: { bookId, id } });
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .wpg-modal {
  min-height: 220px !important;
}
.color-green {
  color: #008184;
}

.a-style {
  cursor: pointer;
}
.video-model {
  /deep/ .wpg-modal-title {
    .wpg-select {
      min-width: 120px;
    }
  }
  /deep/ .wpg-modal-body {
    height: 400px;
    // padding: 0 !important;
  }
}
.icon-style {
  margin-right: 6px;
  color: #3c81f4;
}
.dis-flex {
  display: flex;
  justify-content: space-between;
}

.alarm-detail-con {
  width: 100%;
  height: 100%;

  .body-block {
    display: flex;
    width: 100%;
    height: calc(100% - 48px);

    > div {
      width: 35%;

      > .item-block {
        height: calc((100% - 12px) / 5 * 2);
        margin-bottom: 12px;

        &:nth-child(2) {
          height: calc((100% - 12px) / 5 * 3);
        }
      }

      &.item-block {
        overflow-y: auto;
        flex: 1;
        margin-left: 12px;
      }
      .blocksmallone {
        height: calc((100% - 60px) / 5 * 2) !important;
      }
      .blocksmall {
        height: calc((100% - 142px) / 5 * 3) !important;
      }
    }
    .img-block {
      height: 88px;
      padding: 13px 16px;
      border: 1px solid var(--supply-color-modal-split);
      margin-bottom: 12px;
    }

    .item-block {
      padding: 13px 16px;
      // border: 1px solid #e0e1e3;
      border: 1px solid var(--supply-color-modal-split);

      &:nth-child(1) {
        padding: 13px 0;

        > p {
          margin: 0 16px;
        }

        .detail-block {
          margin-left: 5px;
        }
      }

      .item-title {
        margin-bottom: 10px;
        color: var(--supply-color-title);
        font-size: 14px;
      }

      .detail-block {
        display: flex;
        align-items: flex-end;
        margin-top: 12px;
        line-height: 24px;

        .item {
          font-size: 12px;
        }

        > div:nth-child(1) {
          margin-right: 18px;
          text-align: center;

          img {
            width: 66px;
            margin-bottom: 10px;
          }
        }

        > div:nth-child(2) {
          p:not(:last-child) {
            margin-bottom: 8px;
          }
        }

        i {
          margin-left: 12px;
        }

        .alarm-level1,
        .icon1 {
          color: #ff5568;
        }

        .alarm-level2,
        .icon2 {
          color: #ff922b;
        }

        .alarm-level3,
        .icon3 {
          color: #ffbf00;
        }

        .alarm-level4,
        .icon4 {
          color: #7397fb;
        }
      }

      .name {
        font-size: 12px;
      }

      .value {
        margin: 0 8px;
        font-size: 12px;
      }

      .knowledge-con {
        // height: calc(100% - 100px);
        height: calc(100% - 30px);
        margin: 10px 0;
        overflow: auto;
      }

      .rule-block {
        height: 48px;
        margin-bottom: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.8;

        > p {
          display: -webkit-box;
          height: 48px;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      }

      .data-con {
        height: calc(100% - 130px);
        .right-header {
          .wpg-form-item {
            display: flex;
            margin: 0;
            padding: 0 12px 0 0;
          }
          .wpg-form-item-label {
            margin-right: 8px;
          }
          height: unset;
        }
        .chart-con {
          height: unset;
        }
      }
    }
  }
  .file-item {
    width: 60px;
    height: 60px;
    cursor: pointer;
  }
  .foot-block {
    text-align: right;

    .wpg-btn {
      margin: 10px 0 10px 10px;
    }
  }
  .form-body {
    margin-top: 20px;
  }
}
</style>
