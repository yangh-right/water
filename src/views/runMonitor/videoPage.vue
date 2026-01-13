<template>
  <div class="videoLive">
    <!-- <search-tree
      ref="searchTree"
      :tree-type="'video'"
      :isReturnObj="true"
      :page-name="'videoPage'"
      :page-site-id="pageSiteId"
      sessionKey="videoPage"
      @onSelect="onSelect"
    ></search-tree> -->
    <div class="left-tree wbgc-card">
      <device-tree
        :isReturnObj="true"
        :tree-type="'video'"
        @onTreeChecked="onSelect"
        ref="device-tree"
      ></device-tree>
    </div>
    <div class="right-content">
      <div class="right-head supply-bg-bg-card-DEFAULT">
        <w-form-model layout="inline">
          <w-form-model-item class="supply-text-xs" label="播放类型">
            <w-radio-group ref="typeRadio" v-model="setting.playType" @change="playTypeSelect">
              <w-radio-button value="1">
                实时监控
              </w-radio-button>
              <w-radio-button value="2">
                视频回放
              </w-radio-button>
            </w-radio-group>
          </w-form-model-item>

          <w-form-model-item class="supply-text-xs" label="播放模式">
            <w-radio-group v-model="setting.playMode" name="radioGroup">
              <w-radio v-for="item in playModeList" :key="item.value" :value="item.value">
                {{ item.name }}
              </w-radio>
            </w-radio-group>
          </w-form-model-item>

          <w-form-model-item
            v-show="extColumn != '7' && setting.playType === '1'"
            class="supply-text-xs"
            label="播放设置"
          >
            <w-radio-group v-model="setting.playSite" name="radioGroup">
              <w-radio v-for="item in playSiteList" :key="item.value" :value="item.value">
                {{ item.name }}
              </w-radio>
            </w-radio-group>
          </w-form-model-item>

          <w-form-model-item
            v-show="setting.playType === '2'"
            class="supply-text-xs"
            label="查询时间"
          >
            <w-range-picker
              v-model="queryTime"
              :show-time="extColumn === '7' ? { format: 'HH:mm:ss' } : false"
              style="width: auto"
              :disabled-date="disabledDate"
              :placeholder="['开始时间', '结束时间']"
              :allowClear="false"
              :format="extColumn === '7' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'"
              @openChange="openChange"
              @calendarChange="handleCalendarChange"
            />
          </w-form-model-item>
          <w-form-item>
            <a class="down" :href="url" download="VideoWebPlugin.exe">下载视频插件</a>
          </w-form-item>
          <w-form-model-item class="supply-float-right">
            <return-control :is-drill-down="true"></return-control>
          </w-form-model-item>
          <w-form-model-item class="supply-text-sm play-type" label="当前播放模式">
            {{ pluginName[extColumn - 1] }}{{ playModeName }}
          </w-form-model-item>
        </w-form-model>
      </div>
      <div id="videoCon" :style="`flex:1;width:auto`">
        <div
          class="video-box"
          :style="[
            { height: videoBoxH ? videoBoxH + 'px' : `100%` },
            { width: videoBoxW ? videoBoxW : 'auto' }
          ]"
        >
          <template v-if="setting.playMode === '1'">
            <!-- isc -->
            <template v-if="extColumn === '3'">
              <videoisc-live
                v-if="currentVideoCode && setting.playType === '1'"
                ref="iscVideoLive"
                :videoCode="currentVideoCode"
                :playSite="setting.playSite"
                :extColumn="extColumn"
              ></videoisc-live>
              <videoisc-back
                v-if="currentVideoCode && setting.playType === '2'"
                ref="iscVideoBack"
                :videoCode="currentVideoCode"
                :extColumn="extColumn"
                :queryTime="queryTime"
              ></videoisc-back>
            </template>
            <!-- 8700 -->
            <template v-if="extColumn === '2'">
              <video8700-live
                v-if="currentVideoCode && setting.playType === '1'"
                ref="video8700Live"
                :videoCode="currentVideoCode"
                :playSite="setting.playSite"
              ></video8700-live>
              <video8700-back
                v-if="currentVideoCode && setting.playType === '2'"
                ref="video8700Back"
                :videoCode="currentVideoCode"
                :queryTime="queryTime"
              ></video8700-back>
            </template>
            <!-- 9800 -->
            <template v-if="extColumn === '1'">
              <video9800-live
                v-if="currentVideoCode && setting.playType === '1'"
                ref="video9800Live"
                :videoCode="currentVideoCode"
                :playSite="setting.playSite"
              ></video9800-live>
              <video9800-back
                v-if="currentVideoCode && setting.playType === '2'"
                ref="video8700Back"
                :videoCode="currentVideoCode"
                :queryTime="queryTime"
              ></video9800-back>
            </template>
          </template>
          <template v-else>
            <!-- 大华-->
            <template v-if="extColumn === '7'">
              <imou-player
                :videoId="currentVideoCode"
                :queryTime="queryTime"
                :playType="setting.playType"
              />
            </template>
            <!-- 流播放 -->
            <video-flow
              v-else
              :videoCode="currentVideoCode"
              :videType="extColumn"
              :playSite="setting.playSite"
            ></video-flow>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { getUserSetting } from '@/api/manage';
// import searchTree from '@/components/Tree/searchTree';
import DeviceTree from '@/components/Tree/deviceTree';
import videoiscLive from '@/components/VideoModels/videoiscLive.vue';
import videoiscBack from '@/components/VideoModels/videoiscBack.vue';
import video8700Live from '@/components/VideoModels/video8700Live';
import video8700Back from '@/components/VideoModels/video8700Back';
import video9800Live from '@/components/VideoModels/video9800Live';
import video9800Back from '@/components/VideoModels/video9800Back';
import ImouPlayer from '@/components/VideoModels/ImouPlayer';
import videoFlow from '@/components/VideoModels/videoFlow';
import { mapState, mapMutations, mapActions } from 'vuex';
import { GetPumpDeviceVideoId } from '@/api/baseInfo';
export default {
  name: 'VideoPage',
  components: {
    DeviceTree,
    videoiscLive,
    videoiscBack,
    video8700Live,
    video9800Live,
    video8700Back,
    video9800Back,
    ImouPlayer,
    videoFlow
  },
  inject: ['state'],
  data() {
    return {
      pageSiteId: '',
      perSiteId: '',
      moment,
      queryTime: [moment().day(-1), moment()],
      videoBoxH: '',
      videoBoxW: '',
      playModeList: [
        {
          name: '流媒体播放',
          value: '2'
        }
      ],
      playSiteList: [
        {
          name: '手动播放',
          value: '1'
        },
        {
          name: '循环播放',
          value: '2'
        }
      ],
      setting: {
        playMode: '1', // 播放模式
        playSite: '1', // 播放设置
        playType: '1' // 播放类型
      },
      currentVideoCode: '',
      extColumn: '', // 1 9800    2 8700    3 isc视频  7大华imou
      pluginName: ['9800', '8700', 'ISC', '', '', '', 'imou']
    };
  },
  computed: {
    ...mapState('pub', [
      'abloutStatus',
      'autoCompleteStatus',
      'videoBoxStatus',
      'waitTodoStatus',
      'alarmStatus',
      'allVideoUrl'
    ]),
    ...mapState('configure', ['showIosPopup']),
    ...mapState('setting', ['searchKey']),
    url() {
      if (this.allVideoUrl && this.allVideoUrl.VISC) {
        return this.allVideoUrl.VISC.value;
      } else {
        return 'http://web2.cloud4water.com/video/VideoWebPlugin.exe';
      }
    },
    playModeName() {
      return this.playModeList.find(item => item.value === this.setting.playMode)?.name || '';
    }
  },
  watch: {
    '$route.query.siteId': {
      handler(val) {
        if (this.$route.path?.includes('/runMonitor/videoPage')) {
          this.pageSiteId = val;
        }
      },
      immediate: true
    },
    'state.overlayVisible': {
      immediate: true,
      handler(val) {
        this.setHideVideo(val);
      }
    },
    // 用户信息下拉菜单是否可见
    'state.actionDropdownVisible': {
      immediate: true,
      handler(val) {
        // 用户信息下拉菜单悬停打开再移开时，其它弹窗没有关闭，导致隐藏视频出错
        if (val === false && (this.abloutStatus || this.autoCompleteStatus || this.showIosPopup)) {
          this.setHideVideo(true);
        }
      }
    },
    extColumn(val) {
      this.setPlayMode(val);
    },
    abloutStatus(val) {
      // 关于弹窗操作视频窗口变化
      // this.setVideoWidth();
      // 打开或关闭顶部通知弹窗时隐藏或显示视频插件内容
      this.setHideVideo(val);
    },
    autoCompleteStatus(val) {
      // 打开或关闭顶部快捷搜索弹窗时隐藏或显示视频插件内容
      this.setHideVideo(val);
    },
    videoBoxStatus(val) {
      // 关于弹窗操作视频窗口变化
      // this.setVideoWidth();
      // 打开或关闭顶部通知弹窗时隐藏或显示视频插件内容
      this.setHideVideo(val);
    },
    waitTodoStatus(n) {
      // 待办操作视频窗口变化
      // this.setVideoWidth();
    },
    alarmStatus(n) {
      // 待办操作视频窗口变化
      // this.setVideoWidth();
    },
    searchKey: {
      handler(val) {
        if (
          val &&
          this.$route.query.code === 'search' &&
          this.$route.path?.includes('/runMonitor/videoPage')
        ) {
          this.$refs.searchTree.onSearchTree(this.searchKey);
        }
      },
      immediate: true
    }
  },
  async created() {
    // 初始化播放类型，默认插件播放 (流媒体：1，插件：2)
    let { status, resultData } = await getUserSetting('videoPlayType');
    if (status === 'complete') {
      this.setting.playMode = resultData && resultData.value === '1' ? '2' : '1';
    }
  },
  mounted() {
    this.setVideoUrl();
    // this.setVideoOuter();
  },
  activated() {
    // this.setAbloutStatus(false);
    if (this.$route.query.code === 'search') {
      this.$nextTick(() => {
        this.$refs.searchTree.onSearchTree(this.searchKey);
      });
    }
    if (this.$route.query.backPath?.includes('/runMonitor/pumpDetail')) {
      this.$nextTick(() => {
        this.$refs.searchTree.onSearchTree(this.$route.query.videoName);
        this.$set(this.setting, 'playType', '2');
      });
    }
    // const target = document.querySelector(".videoLive");
    // target.addEventListener("mouseleave", this.handleMouseLeave);
    // target.addEventListener("mouseenter", this.handleMouseEnter);
  },
  deactivated() {
    // this.setAbloutStatus(true);
    // const target = document.querySelector(".videoLive");
    // if(target){
    //   target.removeEventListener("mouseleave", this.handleMouseLeave);
    //   target.removeEventListener("mouseenter", this.handleMouseEnter);
    // }
  },
  methods: {
    // cancel(){
    //   this.$refs.searchTree.cancelSelect();
    // },
    ...mapMutations('video', ['setHideVideo']),
    ...mapMutations('tree', ['setExtColumn']),
    ...mapActions('pub', ['setVideoUrl']),
    ...mapMutations('pub', ['setAbloutStatus', 'setVideoBoxStatus']),
    handleMouseLeave(e) {
      if (window.top === window.self) {
        if (e.toElement) {
          this.setHideVideo(true);
        }
      } else {
        if (e.x < 200 || e.y < 86) {
          this.setHideVideo(true);
        }
      }
    },
    setPlayMode(extColumn) {
      if (['2', '7'].includes(extColumn)) {
        this.setting.playMode = '2';
        this.playModeList = [
          {
            name: '流媒体播放',
            value: '2'
          }
        ];
      } else {
        this.playModeList = [
          {
            name: '插件播放',
            value: '1'
          },
          {
            name: '流媒体播放',
            value: '2'
          }
        ];
      }
    },
    handleMouseEnter() {
      this.setHideVideo(false);
    },
    setVideoOuter() {
      this.videoBoxH = this.abloutStatus || this.videoBoxStatus ? 1 : '';
      this.videoBoxW = this.waitTodoStatus ? 'calc(100% - 352px)' : '';
      this.videoBoxW = this.alarmStatus ? 'calc(100% - 420px)' : this.videoBoxW;
    },
    setVideoWidth() {
      const videoCon = document.getElementById('videoCon');
      const id = this.setting.playType === '1' ? 'playWnd' : 'playWndBack';
      const img = document.getElementById(id) ? document.getElementById(id).children[0] : '';
      if (img) {
        videoCon.style.background = `url(${img.src}) no-repeat`;
      }
      let { abloutStatus, videoBoxStatus, waitTodoStatus, alarmStatus } = this;
      if (abloutStatus || videoBoxStatus) {
        this.videoBoxH = abloutStatus || videoBoxStatus ? 1 : '';
        this.videoBoxW = abloutStatus || videoBoxStatus ? '1px' : '';
      } else if (alarmStatus) {
        this.videoBoxW = 'calc(100% - 420px)';
        this.videoBoxH = '';
      } else if (waitTodoStatus) {
        this.videoBoxW = 'calc(100% - 352px)';
        this.videoBoxH = '';
      } else {
        this.videoBoxW = '';
        this.videoBoxH = '';
      }
    },
    onSelect(e) {
      let type =
        e.itemData && e.itemData.data && e.itemData.data.videoType ? e.itemData.data.videoType : '';

      if (!['1', '2', '3', '7'].includes(type)) {
        this.$message.warning('该视频类型暂时不支持播放！');
        return;
      }
      if (this.extColumn !== '' && type !== this.extColumn) {
        this.setVideoBoxStatus(true);
        if (this.setting.playMode !== '2') {
          // 当前不是流插放时，要考虑插件会遮挡住提示，让插件隐藏--因为顶部弹窗延迟隐藏了100毫秒，这里等待200毫秒执行，防止
          setTimeout(() => {
            this.setHideVideo(true);
          }, 200);
        }
        this.$confirm({
          title: '提示',
          content: '将切换视频源，当前视频不在播放，您确认要播放新选中的视频？',
          onOk: () => {
            this.currentVideoCode = e.selectedKeys[0];
            this.setVideoBoxStatus(false);
            this.extColumn = type;
            this.setExtColumn(this.extColumn);
            if (!e.selectedKeys[0]) {
              this.$message.info('所选配置下无视频');
            }
            this.perSiteId = e.selectedKeys[0];
            // 大华视频播放模式仅为流媒体播放，回放时间只能是当天，不能跨天
            this.extColumn === '7' &&
              (this.setting.playMode = '2') &&
              (this.queryTime = [moment().startOf('day'), moment().endOf('day')]);
            this.setHideVideo(false);
          },
          onCancel: () => {
            this.$refs.searchTree.setCurrentNodeKey(this.perSiteId);
            this.setVideoBoxStatus(false);
            this.setHideVideo(false);
            return false;
          }
        });
      } else {
        this.currentVideoCode = e.selectedKeys[0];
        this.extColumn = type;
        this.setExtColumn(this.extColumn);
        if (!e.selectedKeys[0]) {
          this.$message.info('所选配置下无视频');
        }
        this.perSiteId = e.selectedKeys[0];
        // 大华视频播放模式仅为流媒体播放，回放时间只能是当天，不能跨天
        this.extColumn === '7' &&
          (this.setting.playMode = '2') &&
          (this.queryTime = [moment().startOf('day'), moment().endOf('day')]);
      }
    },
    playTypeSelect(e) {
      const key = e.target.value;
      if (key == 2) {
        this.setting.playMode = '1';
      }
      if (this.extColumn === '7') {
        // 除7大华视频外，其它视频回放采用插件
        this.setting.playMode = '2';
      }
      if (this.extColumn === '3') {
        if (key == 2) {
          this.$refs.iscVideoLive?.hiedWnd();
        } else {
          this.$refs.iscVideoLive?.showWnd();
          this.setting.playSite = '1';
        }
      }
    },
    /* 禁止选择日期 */
    disabledDate(current) {
      // 当前视频为类型7即大华乐橙视频时，回放时间只能是当天，不能跨天
      if (this.extColumn === '7') {
        if (!this.disabledCurrent) return current > moment();
        return (
          (current &&
            current <
              moment(this.disabledCurrent)
                .subtract(0, 'day')
                .startOf('day')) ||
          current >
            moment(this.disabledCurrent)
              .add(0, 'day')
              .endOf('day') ||
          current > moment()
        );
      } else return current && current > this.$moment().endOf('day');
    },
    /**
     * 获取手动选择的时间段起始值
     */
    handleCalendarChange(dates) {
      // 获取手动选择的时间段起始值
      this.disabledCurrent = dates[0];
    },
    /* 时间选择下拉弹窗打开或关闭时显示或隐藏视频插件 */
    openChange(e) {
      // 清空禁用时间段的设置
      this.disabledCurrent = null;
      this.setHideVideo(e);
    }
  }
};
</script>

<style scoped lang="less">
.videoLive {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;

  .left-tree {
    width: 220px;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 4px;
  }
  .right-content {
    display: flex;
    flex-direction: column;
    position: relative;
    margin-left: 10px;
    flex: 1;
    background-color: var(--supply-color-bg-DEFAULT);
  }
  .right-head {
    padding: 10px 20px;
    border-radius: 4px;
    /*margin-bottom: 12px;*/
  }
}
.play-type {
  float: right;
}
</style>
