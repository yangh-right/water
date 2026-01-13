<!--
 * @Description:头部报警弹窗
-->
<template>
  <div class="header-alarm">
    <w-popover
      v-model="visible"
      class="test"
      placement="bottom"
      trigger="click"
      overlayClassName="alarm-popover"
    >
      <template slot="content">
        <div class="alarm-con">
          <div class="alarm-header supply-shadow">
            <span
              class="more-btn supply-text-secondary hover:supply-text-primary-hover"
              @click="gotoPage('/alarmCenter')"
            >
              更多报警
            </span>
            <span class="supply-text-main supply-text-sm">待处理报警</span>
          </div>
          <div class="alarm-body">
            <div
              v-for="(item, i) in unConfirmAlarmList"
              :key="i"
              class="alarm-item supply-bg-bg-card-DEFAULT"
              @click="
                showAlarmDetail(
                  item.alarmHandlerDataId,
                  item.typeCode,
                  item.ticketId,
                  item.deviceId,
                  item
                )
              "
            >
              <p class="alarm-title supply-text-sm supply-text-main">
                <span :class="`alarm-leve alarm-leve${item.alarmLevel}`"
                  >{{ item.alarmLevel }}级</span
                >
                <span class="title">{{ item.pumpName }}</span>
              </p>
              <div class="alarm-icon">
                <img :src="`${getImgSrc(item.alarmType) || alarmIcon}`" alt="" />
              </div>
              <p
                v-if="item.alarmType != 'water_purification_smoke'"
                class="alarm-content supply-text-main supply-text-xs"
              >
                {{ item.deviceName }}({{ item.deviceId }})
                <!-- <span class="supply-float-right supply-text-third">{{ item.alarmTypeName }}</span> -->
              </p>
              <p class="alarm-name">{{ item.alarmName }}</p>
              <p class="alarm-time">
                <span>{{ item.startTime }}</span>
                <span>
                  <!-- confirmStatus: -1延迟处理 0未确认 1已确认 -->
                  <span v-if="buttonCodes['alarm_ticketConfirm_show']">
                    <a v-if="item.confirmStatus === 1" class="supply-text-invalid supply-mx-2">
                      已确认
                    </a>
                    <a
                      v-else
                      class="supply-mx-2"
                      @click.stop="confirmAlarm(item.alarmHandlerDataId)"
                    >
                      确认
                    </a>
                  </span>
                  <!-- <a @click.stop="delayDeal(item.alarmHandlerDataId)">延迟处理</a> -->
                  <a
                    v-if="item.ticketId && buttonCodes['alarm_ticketDetail_show']"
                    class="supply-mx-2"
                    @click.stop="toTicketDetail(item.ticketId, item.pumpName)"
                  >
                    工单详情
                  </a>
                  <a
                    v-if="!item.ticketId && buttonCodes['alarm_ticketCreate_show']"
                    class="supply-mx-2"
                    @click.stop="handleAdd(item)"
                  >
                    派单
                  </a>
                </span>
              </p>
            </div>
          </div>
          <div class="pagination">
            <w-pagination
              v-show="current === 0 && unconfirm > unConfirmParams.pageSize"
              v-model="unConfirmParams.currentPage"
              class="supply-float-right"
              :page-size="unConfirmParams.pageSize"
              :total="unconfirm"
              @change="changePageNum"
            />
            <w-pagination
              v-show="current === 1 && confirmNum > confirmParams.pageSize"
              v-model="confirmParams.currentPage"
              class="supply-float-right"
              :page-size="confirmParams.pageSize"
              :total="confirmNum"
              @change="changePageNum"
            />
          </div>
        </div>
      </template>
      <div class="supply-px-2 supply-cursor-pointer" @click="handleMenuClick">
        <w-icon type="ic_add_alert" />
        <span class="supply-px-2">报警</span>
        <span>{{ alarmTotal }}</span>
      </div>
    </w-popover>
    <ticket-dialog
      ref="ticketDialog"
      :templateType="'zhjs-xjgd'"
      :templateData="templateData"
      @update="handleUpdate"
    />
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
        <!-- <span>{{ videoItem.videoName }}</span> -->
        <w-select
          v-model="curVideoId"
          placeholder="请选择视频"
          @change="handleChangeAlarmVideo"
          @dropdownVisibleChange="handlerDropdownVisibleChange"
        >
          <w-select-option v-for="video in videoList" :key="video.videoId" :value="video.videoId">
            {{ video.videoName }}
          </w-select-option>
        </w-select>
      </template>
      <video-iframe
        ref="videoIframe"
        :videoId="videoItem.videoId"
        :videoType="videoItem.videoType"
        :outerSize="[600, 560]"
      ></video-iframe>
    </w-modal>

    <!-- 报警详情 -->
    <drag-modal ref="alarmDetail" :mask="true" :width="1150" title="报警详情">
      <alarm-detail
        :detailData="detailData"
        @close="$refs.alarmDetail.visible = false"
      ></alarm-detail>
    </drag-modal>
    <!-- 报警确认 -->
    <drag-modal
      @close="confirmClose"
      class="alarm-sure"
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
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import {
  alarmHandlerData,
  alarmConfirm,
  AlarmCount,
  getWsUrl,
  getVideoByPumpId,
  GetVideoInfoByAlarmId,
  GetAlarmTypeList,
  doConfirm
} from '@/api/diagnosis';
import Bus from './Bus.js';
import TicketDialog from '@/components/TicketDialog/index';
import videoIframe from '@/components/VideoModels/videoIframe';
import NotiBtn from './components/NotiBtn';
import MessageBox from './components/MessageBox.vue';
import alarmDetail from '@/components/common/alarmDetail.vue';
import serverConfig from '@/config/server.config';
import { accessToken } from '@wpg/framework-vue';
import store from '@/store';
import { outWork } from '@/core/external';
import { Base64 } from 'js-base64';
import storage from '@/utils/storage';
import { USER_INFO } from '@/store/mutation-types';
import DragModal from '@/components/DragModal';
export default {
  components: {
    TicketDialog,
    videoIframe,
    NotiBtn,
    MessageBox,
    alarmDetail,
    DragModal
  },
  inject: ['linkToOther'],
  data() {
    return {
      alarmId: '',
      remarks: '',
      confirmId: '',
      formItem: {
        labelCol: { span: 2 },
        wrapperCol: { span: 22 }
      },
      confirmLoading: false,
      serverConfig,
      unconfirm: 0,
      confirmNum: 0,
      visible: false,
      current: 0,
      tabs: ['未确认', '已确认'],
      wrapStyle: {
        width: '380px',
        position: 'absolute',
        top: '58px',
        bottom: '60px',
        left: 'calc(100% - 480px)'
      },
      unConfirmAlarmList: [],
      confirmAlarmList: [],
      unConfirmParams: {
        // confirmStatus: '0', //确认状态 0未确认 1已确认
        status: '1', // 报警中
        currentPage: 1,
        pageSize: 10
      },
      confirmParams: {
        confirmStatus: '1', // 确认状态 0未确认 1已确认
        status: '1', // 报警中
        currentPage: 1,
        pageSize: 10
      },
      total: 0,
      popVisible: false,
      templateData: null,
      templateType: '',
      timer: null,
      alarmTotal: 0,
      lastAlarmTimer: null,
      audio: null,
      videoVisible: false,
      curVideoId: '',
      videoList: [], // 报警视频下拉列表数据
      videoItem: {}, // 当前播放报警视频
      type: 1,
      alarmAudioStr: [],
      webSocketUrl: '',
      webSocket: null,
      timeoutObj: null,
      timeout: 58 * 1000,
      lockReconnect: false, // 避免重复连接
      heartCheck: null,
      wsTimer: null,
      notiArr: [], // 报警+通告+工单弹框数据
      maxNum: 5,
      oldNoti: [],
      detailData: {},
      alarmTypeList: [],
      alarmIcon: require('@/assets/images/default/alarm_icon.png')
    };
  },
  computed: {
    /* 实时时间转换指令，大于3天则返回具体的年月日 */
    getFormatTime() {
      return timeStamp => {
        let dateTime = new Date(timeStamp.replace(/-/g, '/'));
        let no1new = dateTime.valueOf();
        let year = dateTime.getFullYear();
        let month = dateTime.getMonth() + 1;
        let day = dateTime.getDate();
        let hour = dateTime.getHours();
        let minute = dateTime.getMinutes();
        let second = dateTime.getSeconds();
        let _time = `${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}:${
          second > 9 ? second : '0' + second
        }`;
        let now = new Date();
        let now_new = now.valueOf();
        let milliseconds = 0;
        let timeSpanStr;
        milliseconds = now_new - no1new;
        if (milliseconds < 1000 * 60 * 1) {
          timeSpanStr = '刚刚';
        } else if (1000 * 60 * 1 <= milliseconds && milliseconds < 1000 * 60 * 60) {
          timeSpanStr = Math.round(milliseconds / (1000 * 60)) + '分钟前';
        } else if (1000 * 60 * 60 * 1 <= milliseconds && milliseconds < 1000 * 60 * 60 * 24) {
          timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60)) + '小时前';
        } else if (1000 * 60 * 60 * 24 <= milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 3) {
          timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + '天前' + ' ' + _time;
        } else {
          timeSpanStr =
            year +
            '-' +
            `${month > 9 ? month : '0' + month}` +
            '-' +
            `${day > 9 ? day : '0' + day}` +
            ' ' +
            _time;
        }

        return timeSpanStr;
      };
    },
    ...mapState('page', ['isPlayAudio']),
    ...mapState('setting', ['productCode', 'buttonCodes']),
    getImgSrc() {
      return type => {
        let src = this.alarmTypeList.find(t => t.code === type)?.icon || '';
        return src;
      };
    },
    canPlayAudio() {
      if (this.isPlayAudio && !this.isplaying && this.alarmAudioStr.length > 0) {
        return true;
      }
      return false;
    }
  },
  watch: {
    videoItem(val) {
      this.curVideoId = val.videoId;
    },
    isPlayAudio(val) {
      this.changeAudio(val);
    },
    visible(val) {
      this.getAlarmCount();
      this.setAbloutStatus(val);
      if (!val) {
        this.timer = setInterval(() => {
          this.getAlarmCount();
        }, 20 * 1000);
      }
    },
    videoVisible(val) {
      this.setVideoBoxStatus(val);
    },
    notiArr(val) {
      this.dealData(val.slice(0, this.maxNum));
    }
  },
  methods: {
    ...mapMutations('pub', ['setAlarmStatus', 'setAbloutStatus', 'setVideoBoxStatus']),

    /** 报警类型 */
    async getAlarmTypes() {
      let { status, resultData } = await GetAlarmTypeList();
      this.alarmTypeList = status === 'complete' ? resultData : [];
    },
    /* 建立websocket连接 */
    initSocket() {
      if (this.webSocket) return false;
      this.webSocket = new WebSocket(this.webSocketUrl);
      this.webSocket.onopen = this.webSocketOnOpen;
      this.webSocket.onclose = this.webSocketOnClose;
      this.webSocket.onmessage = this.webSocketOnMessage;
      this.webSocket.onerror = this.webSocketOnError;
      let that = this;
      // 心跳检测
      this.heartCheck = {
        timeout: 3000, // 每隔三秒发送心跳
        severTimeout: 5000, // 服务端超时时间
        timeoutObj: null,
        serverTimeoutObj: null,
        reset: function() {
          clearTimeout(this.timeoutObj);
          clearTimeout(this.serverTimeoutObj);
          this.start();
        },
        start: function() {
          let self = this;
          self.timeoutObj = setInterval(() => {
            try {
              that.webSocket.send('4217881208479382851');
            } catch (e) {
              that.webSocket && that.webSocket.close();
            }
          }, self.timeout);
        }
      };
    },

    // 建立连接成功后的状态
    webSocketOnOpen() {
      // 心跳检测重置
      this.heartCheck.start();
      // console.log('onopen连接成功');
    },
    isJSON(data) {
      try {
        return typeof JSON.parse(data) === 'object';
      } catch (e) {
        return false;
      }
    },
    // 获取到后台消息的事件，操作数据的代码在onmessage中书写
    webSocketOnMessage(res) {
      // console.log(res);
      // 心跳检测重置
      this.heartCheck.reset();
      if (res.data) {
        let _data = JSON.parse(res.data);
        if (_data.news) {
          console.log('有新的ws推送');
          let dataInform;
          let dataAlarm;
          let dataOrder;
          _data.count.forEach(item => {
            if (item.clientKey === '2') {
              dataInform = item.info.records;
            }
            if (item.clientKey === '3') {
              dataAlarm = item.info.records;
            }
            if (item.clientKey === '4') {
              dataOrder = item.info.records;
            }
          });
          if (dataAlarm.length) {
            dataAlarm.forEach(item => {
              // 判断推送的报警消息来自于二供平台
              let originalJson;
              try {
                originalJson = JSON.parse(item.originalJson);
              } catch (error) {
                // keep
              }
              if (item.isNew && originalJson && originalJson.productCode === this.productCode) {
                item.title = originalJson.alarmName;
                this.getAlarmCount();
                console.log('有新的报警消息');
                this.notiArr.push(item);
                this.alarmAudioStr.push({
                  id: item.id,
                  str: item.content
                    .replace(/#[a-z0-9]{6}/g, '')
                    .match(/[0-9\u4e00-\u9fa5]/g)
                    .join('')
                });
                // 语音播报
                if (this.canPlayAudio) {
                  this.playNextVoice();
                }
              }
            });
          }
          if (dataOrder.length) {
            dataOrder.forEach(item => {
              // 判断推送的报警消息来自于净水平台
              let originalJson;
              try {
                originalJson = JSON.parse(item.originalJson);
              } catch (error) {
                // keep
              }
              if (item.isNew && item.clientId.indexOf('water_purification') > -1) {
                item.title = originalJson?.title;
                Bus.$emit('orderWs');
                console.log('有新的工单消息');
                this.notiArr.push(item);
                this.alarmAudioStr.push({
                  id: item.id,
                  str: item.content.match(/[0-9\u4e00-\u9fa5]/g).join('')
                });
                // 语音播报
                if (this.canPlayAudio) {
                  this.playNextVoice();
                }
              }
            });
          }
          if (dataInform.length) {
            // let info = dataInform[0];
            dataInform.forEach(item => {
              if (item.isNew && item.clientId === 'water_purification') {
                item.title = '';
                Bus.$emit('noticeWs');
                console.log('有新的通知消息');
                this.notiArr.push(item);
                this.alarmAudioStr.push({
                  id: item.id,
                  str: item.content.match(/[0-9\u4e00-\u9fa5]/g).join('')
                });
                // 语音播报
                if (this.canPlayAudio) {
                  this.playNextVoice();
                }
              }
            });
          }
        }
      }
    },
    // 关闭连接
    webSocketOnClose() {
      this.reconnect();
      // console.log('websocket连接已关闭');
    },
    // 连接失败的事件
    webSocketOnError(res) {
      // console.log('websocket连接失败');
      this.reconnect();
    },
    /* 创建连接 */
    createWebSocket() {
      try {
        // ws = new WebSocket(this.webSocketUrl);
        this.initSocket();
      } catch (e) {
        this.reconnect();
      }
    },
    /* 重连 */
    reconnect() {
      if (this.lockReconnect) {
        return;
      }
      this.lockReconnect = true;
      // console.log('进行重连.....');
      // 没连接上会一直重连，设置延迟避免请求过多
      this.wsTimer && clearTimeout(this.wsTimer);
      this.wsTimer = setTimeout(() => {
        this.createWebSocket();
        this.lockReconnect = false;
      }, 4000);
    },

    handleMenuClick() {
      this.visible = !this.visible;
      if (this.visible) {
        clearInterval(this.timer);
        this.getUnAlarmData();
      }
    },
    /* 工单 */
    handleAdd(obj) {
      this.templateData = {
        id: obj.alarmHandlerDataId,
        orgIds: obj.orgId,
        pumpId: obj.pumpId,
        deviceIds: obj.deviceId,
        solutionId: obj.solutionId,
        knowledgeCode: obj.knowledgeId || '',
        type: 0,
        title: obj.alarmName,
        content: `${obj.startTime}${obj.pumpName}污水厂,发生${obj.alarmName}报警,请及时了解情况并采取响应措施。`,
        ticketAddress: {
          address: obj.addr || '',
          point: {}
        },
        workSource: 'homeCall'
      };
      this.visible = false;
      this.$refs.ticketDialog && (this.$refs.ticketDialog.visible = true);
    },

    /* 报警详情弹框 */
    showAlarmDetail(_id, typeCode, ticketId, deviceId, data) {
      console.log('1111', data);
      this.visible = false;
      this.detailData = {
        alarmId: _id,
        typeCode: typeCode,
        ticketId: ticketId,
        deviceId: deviceId,
        startTime: data.startTime,
        record: JSON.stringify(data)
      };
      this.$refs.alarmDetail.visible = true;
    },
    toOrderDetail(_id) {
      this.goto({
        path: '/work-manage/detail',
        query: {
          id: _id
        }
      });
    },
    toNoticeDetail(_id) {
      this.goto({
        path: '/baseInfo/checkNotice',
        query: {
          id: _id
        }
      });
    },
    handleUpdate() {},
    changeTab(i) {
      this.current = i;
    },
    /* 获取未确认报警列表 */
    getUnAlarmData() {
      this.unConfirmParams.endTime = this.$moment().format('YYYY-MM-DD HH:mm:ss');
      alarmHandlerData(this.unConfirmParams).then(res => {
        let {
          status,
          resultData: { total, records }
        } = res;
        if (status === 'complete') {
          this.unConfirmAlarmList = records;
          this.unconfirm = total;
        }
      });
    },
    onChange(type, val, val1) {
      this[type](val, val1);
    },
    confirmClose() {
      this.remarks = '';
    },
    /* 延迟处理 */
    delayDeal(_id) {},
    /* 确认报警 */
    confirmAlarm(id) {
      this.alarmId = id;
      this.$refs.alarmConfirm.visible = true;
    },
    /* 跳转页面 */
    gotoPage(_path, obj) {
      this.drillDown({
        path: _path,
        query: obj
      });
    },
    /* 报警数 */
    getAlarmCount() {
      AlarmCount({ status: '1', endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss') }).then(
        res => {
          let { status, resultData } = res;
          if (status === 'complete') {
            this.alarmTotal = resultData;
          }
        }
      );
    },
    handleConfirm() {
      const userInfo = JSON.parse(Base64.decode(storage.get(USER_INFO)));
      let params = {
        alarmId: this.alarmId,
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
            this.getUnAlarmData();
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
    /* 关闭全部已显示的弹框 */
    closeAll() {
      let num = this.notiArr.length > this.maxNum ? this.maxNum : this.notiArr.length;
      let arr = this.notiArr.slice(0, num);
      this.notiArr.splice(0, num);
      this.alarmAudioStr = [];
      arr.forEach(a => {
        this.$notification.close(a.id);
      });
    },
    dealData(notis) {
      notis.forEach((n, i) => {
        let idx = this.oldNoti.findIndex(o => o.id === n.id);
        if (idx < 0) {
          setTimeout(() => {
            this.openMessage(n);
          }, i * 100);
        }
      });
      this.oldNoti = notis;
    },
    /* 报警弹框 */
    openNotification(_data) {
      let {
        alertLevel,
        alarmInfo,
        startDate,
        phName,
        phId,
        deviceName,
        isPlatformVoice,
        useVideo
      } = _data;
      if (useVideo === '1') {
        this.showVideo(phId);
      }
      let _str = `${this.getFormatTime(startDate)} ${phName}${deviceName}发生了${alarmInfo}`;
      _str.replace('#', '井');
      if (isPlatformVoice === '1') this.alarmAudioStr.push({ id: _data.id, str: _str });
      if (this.canPlayAudio) this.playNextVoice();
      let props = { item: { ..._data } };
      let that = this;
      this.$notification.open({
        duration: 30000,
        class: 'lastAlarmNoti',
        key: _data.id,
        message: () => {
          let cls = 'noti-mark noti-mark' + alertLevel;
          return (
            <div class="noti-title">
              <span class={cls}>{alertLevel}级</span>
              <span class="noti-type">{alarmInfo}</span>
              <span
                class="close-all supply-float-right supply-text-third hover:supply-text-primary-hover"
                on-click={that.closeAll}
              >
                全部关闭
              </span>
            </div>
          );
        },
        description: () => {
          return <div class="noti-massage supply-text-xs supply-text-secondary">{_str}</div>;
        },
        btn: <noti-btn {...{ props }} on-change={this.onChange}></noti-btn>,
        onClose: () => {
          that.notiArr.splice(
            that.notiArr.findIndex(item => item.id === _data.id),
            1
          );
          that.alarmAudioStr.splice(
            that.alarmAudioStr.findIndex(item => item.id === _data.id),
            1
          );
          if (that.notiArr.length <= 0) this.setAlarmStatus(false);
        }
      });
    },
    /* 消息弹框 */
    openMessage(_data) {
      let props = { item: _data, type: '4', showCloseAllBtn: true };
      let that = this;
      let elementType = null;
      if (_data.clientType === '2') {
        elementType = <message-box {...{ props }} on-closeAll={this.closeAll}></message-box>;
      } else if (_data.clientType === '3') {
        elementType = (
          <message-box
            {...{ props }}
            on-change={this.showAlarmDetail}
            on-closeAll={this.closeAll}
          ></message-box>
        );
        if (_data.originalJson) {
          let data = JSON.parse(_data.originalJson);
          // 弹出视频
          if (data.id && data.video) {
            GetVideoInfoByAlarmId(data.id).then(res => {
              let {
                status,
                resultData: { videoList }
              } = res;
              if (status === 'complete' && videoList.length > 0) {
                this.videoVisible = true;
                this.videoList = videoList;
                this.videoItem = videoList[0];
              }
            });
          }
        }
      } else if (_data.clientType === '4') {
        elementType = (
          <message-box
            {...{ props }}
            on-change={this.toOrderDetail}
            on-closeAll={this.closeAll}
          ></message-box>
        );
      }
      this.$notification.open({
        duration: 10000,
        class: 'lastMsgNoti',
        key: _data.id,
        description: elementType,
        onClose: () => {
          that.notiArr.splice(
            that.notiArr.findIndex(item => item.id === _data.id),
            1
          );
          if (that.notiArr.length <= 0) this.setAlarmStatus(false);
        }
      });
    },
    // 报警视频下拉框选择切换播放视频
    handleChangeAlarmVideo(value) {
      this.videoItem = this.videoList.filter(item => item.videoId === value)[0];
    },
    /* 语音播放报警 */
    playNextVoice() {
      if (!window.SpeechSynthesisUtterance) return;
      let { alarmAudioStr } = this;
      // 如果没有静音并且有语音时
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      let text = alarmAudioStr[0].str;
      let id = alarmAudioStr[0].id;
      this.isplaying = true;
      let audio = new SpeechSynthesisUtterance(text);
      // 添加一条语音播放
      window.speechSynthesis.speak(audio);
      audio.addEventListener(
        'end',
        () => {
          // that.alarmAudioStr = alarmAudioStr.slice(1);
          this.alarmAudioStr.splice(
            this.alarmAudioStr.findIndex(item => item.id === id),
            1
          );
          this.isplaying = false;

          if (this.canPlayAudio) {
            this.playNextVoice();
          }
        },
        false
      );
    },
    /* 开启 / 关闭语音报警 */
    changeAudio(flag) {
      if (flag) {
        this.$message.success('开启语音成功');
        if (this.canPlayAudio) {
          this.playNextVoice();
        }
      } else {
        this.$message.success('关闭语音成功');
        this.isplaying = false;
        this.alarmAudioStr = [];
        window.speechSynthesis.cancel();
      }
    },
    async showVideo(phId) {
      let res = await getVideoByPumpId(phId);
      let { status, resultData } = res;
      if (status === 'complete' && resultData.length > 0) {
        this.videoVisible = true;
        this.videoItem = resultData[0];
      }
    },
    closeAlarm() {
      this.visible = false;
    },
    changePageNum() {
      this.getUnAlarmData();
      this.getAlarmCount();
    },
    compareValue(value, min, max) {
      function isUndefined(value) {
        return value == undefined;
      }
      if (value == isUndefined(value)) {
        return;
      }
    },
    // 跳转工单详情页
    toTicketDetail(ticketId) {
      this.goto({
        path: '/work-manage/detail',
        query: {
          id: ticketId
        }
      });
    },
    handlerDropdownVisibleChange(status) {
      this.$refs.videoIframe && this.$refs.videoIframe.setHideVideo(status);
    }
  },
  mounted() {
    this.getAlarmCount();
    this.timer = setInterval(() => {
      this.getAlarmCount();
    }, 20 * 1000);
  },
  created() {
    this.getAlarmTypes();
    const userinfo = store.getters['account/user'];
    const token = accessToken.get();
    let ws = getWsUrl(userinfo.userId);
    this.webSocketUrl = ws + token + '/' + userinfo.userId;
    // this.initSocket();
  },
  beforeDestroy() {
    clearInterval(this.timer);
    clearInterval(this.lastAlarmTimer);
    if (this.webSocket) this.webSocket.close();
  }
};
</script>
<style lang="less">
.alarm-sure.draggable-modal {
  z-index: 23232;
  position: fixed;
  .wpg-modal {
    min-height: 220px;
  }
}
</style>
<style lang="less" scoped>
@alarm1: #ff5568;
@alarm2: #ff922b;
@alarm3: #ffbf00;
@alarm4: #9c73fb;
/deep/ .wpg-modal {
  min-height: 220px !important;
}
.hideDrawer {
  display: none;
  color: #ff6072;
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

.alarm-con {
  .alarm-header {
    display: flex;
    justify-content: space-around;
    padding: 13px;

    .more-btn {
      position: absolute;
      top: 23px;
      right: 10px;
      font-size: 12px;
      cursor: pointer;
    }
  }

  .alarm-body {
    height: calc(100vh - 240px);
    max-height: 450px;
    padding: 10px 10px 0;
    overflow: auto;

    .alarm-item {
      position: relative;
      margin-bottom: 10px;
      padding: 12px 16px;
      border-radius: 4px;
      cursor: pointer;

      .alarm-title {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .title {
          font-family: PingFangSC-Medium, sans-serif;
        }
        .alarm-leve {
          width: 40px;
          height: 20px;
          margin-right: 8px;
          color: #fff;
          font-family: PingFangSC-Regular, sans-serif;
          line-height: 20px;
          text-align: center;
          border-radius: 4px;

          &1 {
            background: @alarm1;
          }

          &2 {
            background: @alarm2;
          }

          &3 {
            background: @alarm3;
          }

          &4 {
            background: @alarm4;
          }
        }
      }

      .alarm-name {
        font-weight: 600;
      }
      /deep/ .wpg-checkbox-wrapper {
        width: 100%;

        .wpg-checkbox {
          position: absolute;
          top: 14px;
          left: 10px;
        }

        > span:last-child {
          display: block;
        }
      }

      .alarm-content {
        padding: 9px 0;
      }

      .alarm-icon {
        position: absolute;
        top: 18px;
        width: 60px;
        height: 60px;
        right: 16px;
        padding: 4px;
        overflow: hidden;
        img {
          width: 100%;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
      }

      .alarm-pv {
        .alarm-color {
          &1 {
            color: @alarm1;
          }

          &2 {
            color: @alarm2;
          }

          &3 {
            color: @alarm3;
          }

          &4 {
            color: @alarm4;
          }
        }
      }

      .alarm-order {
        margin-top: 6px;
        color: #666;
        font-size: 12px;

        > span:nth-child(2) {
          color: #999;
        }
      }

      .alarm-time {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 14px;
        color: #999;
        font-size: 12px;

        .unactive {
          color: #c0c0c0;

          &:hover {
            color: #c0c0c0;
          }
        }

        .item-more {
          display: inline-block;
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .pagination {
    height: 42px;
    padding: 10px;
  }

  .alarm-bottom {
    height: 53px;
    padding: 16px;

    .bottom-icon {
      color: #a2b0c6;
      font-size: 24px;
      cursor: pointer;
    }

    .bottom-but {
      margin-left: 12px;
    }
  }
}

.noti-mark {
  display: inline-block;
  width: 40px;
  height: 20px;
  margin-top: 3px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  vertical-align: top;
  border-radius: 4px;

  &1 {
    color: #f64357;
    background: #ffd8dc;
  }

  &2 {
    color: #fc6312;
    background: #ffe2d3;
  }

  &3 {
    color: #f59f00;
    background: #ffebc5;
  }

  &4 {
    color: #526de3;
    background: #d8dfff;
  }
}

.noti-type {
  margin-left: 12px;
  font-size: 16px;
}

.noti-title-tip {
  width: 100%;
  margin-left: 14px;
}

.noti-massage {
  margin-left: 52px;
}
</style>
<style lang="less">
.wpg-popover.alarm-popover {
  .wpg-popover-inner-content {
    width: 360px;
    padding: 0;
  }
}

.wpg-notification.wpg-notification-topRight {
  top: 76px !important;

  .lastAlarmNoti,
  .lastMsgNoti {
    margin-bottom: 12px;
  }

  .lastMsgNoti {
    .wpg-notification-notice-message {
      display: none;
    }
  }

  .lastAlarmNoti.wpg-notification-notice {
    .close-all {
      position: absolute;
      top: 15px;
      right: 41px;
      font-size: 12px;
      cursor: pointer;
    }
  }
}

.wpg-notification-notice {
  padding: 8px 12px !important;

  .wpg-notification-notice-message {
    margin-bottom: 11px;
  }

  .wpg-notification-notice-btn {
    width: 100%;
    padding-left: 52px;
  }

  .wpg-notification-notice-close {
    top: 6px !important;
    right: 12px !important;
  }
}

.new-alarm {
  position: relative;
  animation: alarm 0.3s cubic-bezier(0.66, 0.1, 1, 0.41) 20;
}
@keyframes alarm {
  0% {
    left: 0;
  }

  25% {
    left: 2px;
  }

  50% {
    left: 0;
  }

  75% {
    left: -2px;
  }

  100% {
    left: 0;
  }
}
.form-body {
  margin-top: 20px;
}
</style>
