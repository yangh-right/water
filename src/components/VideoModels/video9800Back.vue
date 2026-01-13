<template>
  <div class="video-wrapper" ref="videoWrapper">
    <div v-show="showMessage" class="massage">
      <img v-if="downloadFlag" class="img" src="@/assets/images/default/runMonitor/empty_video.png" alt="">
      <w-spin v-if="!downloadFlag" class="loading" size="large" />
      <h1 class="supply-text-third">{{ message }}</h1>
      <h2 v-if="downloadFlag">
        <a class="down" :href="url" download="WebCtrl_V4.0.exe">下载插件</a>
      </h2>
    </div>
    <div class="win_container" data-index="1" id="video98Live" style="width: 100%; height: 100%;" name="video98Live"></div>
  </div>
</template>
<script>
    import moment from 'moment'
    import { mapState } from 'vuex'
    import { getHikBackResouseXML, getAppKeyByCode} from '@/api/runMonitor';
    export default {
        name: 'video9800Back',
        data() {
            return {
                moment,
                ocxBackDom: null,
                message:'',
                showMessage:false,
                downloadFlag:false,
                initCount:1,
                xml: null,
                oWebControl: true,
                startTime: moment(this.queryTime[0].format('YYYY-MM-DD') + ' 00:00:00'),
                endTime: moment(this.queryTime[1].format('YYYY-MM-DD') + ' 23:59:59'),
                PLAYBACK_EVENT_TOKEN: 33554438,       // Token请求通知
                PLAYBACK_EVENT_WINDOW: 33554449,      // 窗口选中改变通知
                PLAYBACK_EVENT_START: 33554464,       // 回放开始通知
                PLAYBACK_EVENT_STOP: 33554465,        // 下载进度事件
                EVENT_DOWNLOAD: 0x08000001,           // 记录控件对象
                callbackOcxObj,                      // 记录控件对象
            }
        },
        props: {
            videoCode: {
                required: true,
                default: '',
                type: String
            },
            queryTime: {
                type: Array,
                required: true,
                default: () => []
            }
        },
        watch: {
            videoCode: {
                handler(val) {
                    if (this.oWebControl) {
                        this.init();
                    } else {
                        this.getVideoXml()
                    }

                },
                immediate: true
            }
        },
        computed: {
            ...mapState('pub', ['allVideoUrl']),
            url() {
                if(this.allVideoUrl.V9800){
                    return this.allVideoUrl.V9800.value;
                } else {
                    return "http://web2.cloud4water.com/video/WebCtrl_V4.0.exe"
                }
            }
        },
        mounted() {
        },
        methods: {
            init() {
                this.$nextTick(() => {
                    this.spvBackDom = document.getElementById("video98Live");
                    this.OnInit()
                })

            },
            getVideoXml(_code) {
                let sendData = {
                    id: _code ? _code : this.videoCode
                }
                getHikBackResouseXML(sendData)
                    .then(res => {
                        let { status, resultData } = res;
                        if (status === 'complete') {
                            this.videoPlay(resultData);
                        }
                    })
            },
            //初始化控件
            OnInit() {
                let that = this;
                var options = {
                    divId: "video98Live",
                    theme: "Red"
                };
                try {
                    that.ocxBackDom = new PlaybackOCX(options)
                    that.ocxBackDom .registerCallback(0x02000006, that.getAppKey);
                } catch (e) {
                    that.message = "插件未启动，正在尝试启动，请稍候...";
                    that.showMessage = true;
                    that.initCount++;
                    if (that.initCount < 3) {
                        setTimeout(function () {
                            that.OnInit();
                        }, 3000);
                    } else {
                        that.message = "插件启动失败，请检查插件是否安装！";
                        that.downloadFlag = true;
                    }
                    return false
                }

                this.getVideoXml()
            },

            getAppKey(reqId) {
                console.log('32222')

                let sendData = {
                    id: this.videoCode
                }
                getAppKeyByCode(sendData)
                    .then(res => {
                        let { status, resultData } = res;
                        if (status === 'complete') {
                            console.log(resultData)
                            this.ocxBackDom.setToken(reqId, resultData);
                        }
                    })
            },
            // 停止所有设备
            stopAllPreview() {

            },
            handleResize() {

            },
            // 播放视频
            videoPlay(_xml) {
                let that = this
                if (_xml) {
                    try {
                        that.spvBackDom.MPB_StartPlayBack(that.startTime, that.endTime, _xml)
                    } catch (e) {
                        that.showMessage = true;
                        that.downloadFlag = true;
                        that.message = "插件启动失败，请检查插件是否安装！";
                    }
                } else {
                    this.$message.warning('该视频暂无数据')
                }
            },
            destoryVideo(){
                this.stopAllPreview();
            }
        },
        beforeDestroy() {
            this.destoryVideo();
        }
    };
</script>

<style scoped lang="less">
  .video-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
    .win_container {
      width: 100%;
      height: 100%;
    }
  }
  .massage{
    position: absolute;
    left: 50%;
    top: 50%;
    transform:translate(-50%, -50%);
    text-align: center;
    .loading{
      margin-bottom: 20px;
    }
    h2{
      margin-top: 20px;
    }
    .down{
      border: 1px solid var(--supply-color-primary-DEFAULT);
      color: var(--supply-color-primary-DEFAULT);
      border-radius: 4px;
      font-size: 14px;
      padding: 10px 14px;
    }
  }

</style>
