<template>
  <div class="video-wrapper" ref="videoWrapper">
    <div v-show="showMessage" class="massage">
      <img v-if="downloadFlag" class="img" src="@/assets/images/default/runMonitor/empty_video.png" alt="">
      <w-spin v-if="!downloadFlag" class="loading" size="large" />
      <h1 class="supply-text-third">{{ message }}</h1>
      <h2 v-if="downloadFlag">
        <a class="down" :href="url" download="hk8700ocx.exe">下载插件</a>
      </h2>
    </div>
    <object classid="clsid:863E7B58-A280-40A5-8394-CE33F4E7B654" id="spvBack" ref="spvBack" className="spvBack"
            style="width: 100%; height: 100%;"
            v-resize="handleResize"/>
  </div>
</template>
<script>
    import moment from 'moment';
    import { mapState } from 'vuex';
    import { getBackResouseByCode } from '@/api/runMonitor';
    export default {
        name: 'video8700Back',
        data() {
            return {
                moment,
                spvBackDom: null,
                message:'',
                showMessage:false,
                downloadFlag:false,
                initCount:1,
                xml: null,
                oWebControl: true,
                startTime: moment(this.queryTime[0].format('YYYY-MM-DD') + ' 00:00:00'),
                endTime: moment(this.queryTime[1].format('YYYY-MM-DD') + ' 23:59:59')
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
        computed:{
            ...mapState('pub', ['allVideoUrl']),
            url() {
                if(this.allVideoUrl.V8700){
                    return this.allVideoUrl.V8700.value;
                } else {
                    return "http://web2.cloud4water.com/video/hk8700ocx.exe"
                }
            }
        },
        mounted() {
        },
        methods: {
            init() {
                this.$nextTick(() => {
                    this.spvBackDom = document.getElementById("spvBack");
                    this.OnInit()
                })

            },
            getVideoXml(_code) {
                let sendData = {
                    id: _code ? _code : this.videoCode
                }
                getBackResouseByCode(sendData)
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
                try {
                    var languageType = 1;
                    var ocxObj = that.spvBackDom;
                    var ret = ocxObj.MPB_Init(languageType);
                    that.setLocalParam();
                    this.oWebControl = false;
                    that.showMessage = false;
                    that.downloadFlag = false;
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
            // 本地化设置
            setLocalParam() {
                let that = this;
                try{
                    var ocxObj = this.spvBackDom;
                    var xml = '<?xml version="1.0" encoding="UTF-8"?> ' +
                        '<localParam> ' +
                        '<picType>1</picType> ' +
                        '<capturePath>C:\\Hikvision</capturePath> ' +
                        '<recordSize>2</recordSize> ' +
                        '<recordPath>C:\\Hikvision</recordPath> ' +
                        '<showMsgTip>1</showMsgTip> ' +
                        '</localParam>';
                    var ret = ocxObj.MPB_SetLocalParam(xml);
                    ocxObj.MPB_SetPlayWndCount(parseInt(1, 10));
                }catch(e){
                   console.log('初始化视频播放插件失败！请确认使用IE浏览器并安装最新视频插件。最新视频插件点击右上角【下载视频控件-8700】');
                }
            },
            // 停止所有设备
            stopAllPreview() {

            },
            // 获取窗口数
            getWnd() {
                this.wndNum = this.spvBackDom.MPB_GetPlayWndCount();
                this.setWndNum(this.wndNum);
            },
            // 设置窗口数
            SetWnd(opt) {
                this.spvBackDom.MPB_SetPlayWndCount(parseInt(opt, 10));
            },
            //设置全屏
            SetFullScreen() {
                this.spvBackDom.MPB_SetFullScreen();
            },
            // 添加下方工几条切换宫格
            ShowMainToolBar() {
                var ret = this.spvBackDom.MPB_ShowMainToolBar(1);
                if (ret != 0) {
                    console.log('显示主工具栏失败');
                }
            },
            handleResize() {

            },
            // 播放视频
            videoPlay(_xml) {
                let that = this
                if (_xml) {
                    try {
                        that.spvBackDom.MPB_StartPlayBack(_xml, that.startTime, that.endTime)
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
    .spvBack {
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
