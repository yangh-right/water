import storage from '@/utils/storage';
import { accessToken } from '@wpg/framework-vue';
import { isFunction, isNil } from 'lodash-es';
import { sysDictListByCode } from '@/api/manage';

export default {
  props: {
    emergencyAllData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      iframeUrl: '',
      iframeLoading: true,
      appid: '',
      loading: false,
      taskId: undefined,
      bimCompleteFlag: false,
      modelComponentId: []
    };
  },
  watch: {
    svgName: {
      handler(val) {
        this.appid = val;
        if (val) {
          this.getBimGraph();
        }
      }
    },
    emergencyAllData: {
      async handler(val) {
        // this.sendMessToZt(val);
      },
      immediate: true,
      deep: true
    },
    bimCompleteFlag: {
      async handler(val) {
        if (val) {
          // this.sendMessToZt(this.emergencyAllData);
        }
      }
    }
  },
  async created() {},
  async mounted() {
    this.loading = true;
    // this.appid = this.svgName;
    window.removeEventListener('message', this.receiveMessage, false);

    window.addEventListener('message', this.receiveMessage, false);
  },

  activated() {
    this.loading = true;
    this.bimCompleteFlag = false;
    this.getBimId();
    // this.getBimGraph();
    window.removeEventListener('message', this.receiveMessage, false);
    window.addEventListener('message', this.receiveMessage, false);
  },

  deactivated() {
    window.removeEventListener('message', this.receiveMessage, false);
  },

  destroyed() {
    window.removeEventListener('message', this.receiveMessage, false);
  },

  methods: {
    async getBimId() {
      try {
        const res = await sysDictListByCode('bim_code');
        if (res.status === 'complete' && res.resultData.length > 0) {
          this.appid = res.resultData[0].dictValue;
          this.getBimGraph();
        }
      } catch (e) {
        console.log('jjjj', e);
      }
    },
    receiveMessage(e) {
      const { data } = e;
      if (data.info === 'bim平台') {
        this.handleMessage(data.data || {});
      }
    },
    handleMessage(data) {
      console.log('eee', data);
      switch (data.id) {
        case 'init10001':
          this.taskId = data.data.taskId;
          storage.set('bim_taskid', this.taskId);
          break;
        case 'init10002':
          console.log('平台初始化进度:' + data.data.progress);
          break;
        case 'init10003':
          if (data.data.progress === 1) {
            console.log('平台渲染完成');
            this.bimCompleteFlag = true;
            this.bimRenderCompleted();
          }
          break;
        case '9':
          if (data.alarmStatus) {
            // 跳转报警列表
            // const stationId = data.alertData?.[0]?.stationId;
            // this.goto('/AlarmModule/AlarmIndex?waterPlantId=' + (stationId || ''));
          }
          break;
      }
      // 触发点击事件
      if (isFunction(this.componentClick)) {
        this.componentClick(data);
      }
    },
    // 获取组态实例的图纸
    async getBimGraph() {
      // let res = await getSysDictListByCode('bim_preview_url');
      // if (res.resultData && res.resultData.length) {
      //   let url = res.resultData[0].dictValue;
      const token = accessToken.get();
      const publicPath =
        process.env.NODE_ENV === 'production' ? window.location.origin : 'http://10.10.15.219';
      this.iframeUrl = `${publicPath}/water-work-bim/#/ModelManage/preview?projectNo=${this.appid}&token=${token}`;
      // }
    }
  }
};
