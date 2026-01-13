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
    <div data-index="1" id="video98Live" style="width: 100%; height: 100%;" name="ocx_1" v-resize="handleResize"></div>
  </div>
</template>

<script>
    import { get98ResouseByCode, getAppKeyByCode} from '@/api/runMonitor';
    import { mapGetters, mapMutations, mapState } from 'vuex';

    export default {
        name: 'video9800Live',
        data() {
            return {
                ocx: null,
                xml: null,
                videAuthMsg:"",
                message:'',
                showMessage:false,
                downloadFlag:false,
                initCount:1,
                oWebControl: true,
                wndNum: '', // 视频播放个数
                allVideoList: [],
                setInterval: null,
            };
        },
        props: {
            videoCode: {
                required: true,
                default: '',
                type: String
            },
            playSite: {
                default: '1',
                type: String
            },
            layout: {
                default: '3',
                type: String
            }
        },
        watch: {
            videoCode: {
                handler(val) {
                    if (this.plraySite == 2) {
                        this.$message.warning('当前为循环播放请切换为手动播放！');
                        return false;
                    }
                    if (this.oWebControl) {
                        this.init();
                    } else {
                        this.getVideoXml()
                    }

                },
                immediate: true
            },
            playSite(val) {
                if (val == '2') {
                    this.setLoopPlay()
                } else {
                    clearInterval(this.setInterval)
                }
            },
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
            ...mapGetters('tree', ['getAllVideoCode']),
            ...mapMutations('tree', ['setWndNum']),
            init() {
                this.$nextTick(() => {
                    this.OnInit()
                })

            },
            getVideoXml(_code) {
                let sendData = {
                    id: _code ? _code : this.videoCode
                }
                get98ResouseByCode(sendData).then(res => {
                    let { status, resultData } = res;
                    if (status === 'complete') {
                        this.videoPlay(resultData);

                    }
                })
            },
            getAppKey(reqId) {
                let sendData = {
                    id: this.videoCode
                }
                getAppKeyByCode(sendData)
                    .then(res => {
                        let { status, resultData } = res;
                        if (status === 'complete') {
                            this.ocx.setToken(reqId, resultData);
                        }
                    })
            },
            //初始化控件
            OnInit() {
                let that = this;
                var optionsLive = {
                    divId : "video98Live",
                    theme : 'Blue'
                }
                try {
                    that.ocx = new PreviewOCX(optionsLive);
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
                // 设置全局参数----------------------start-------------------
                var previewGlobalXml = '<?xml version="1.0" encoding="utf-8"?>';
                previewGlobalXml += '<clip packSize="256" save="c:/cut"/>';
                previewGlobalXml += '<global>';
                previewGlobalXml += '<snap picture="jpeg" save="c:/snap"/>';
                previewGlobalXml += '<performance decode="5"/>';
                previewGlobalXml += '</global>';
                try {
                    if (that.ocx != undefined && that.ocx != null) {
                        that.ocx.setGlobalParam(previewGlobalXml);
                    }
                } catch (ex) {

                }

                // 设置操作权限----------------------start-------------------
                /*
                 * Tool_type_INFO = 0, //监控点信息 Tool_type_CONFIG = 1, //设置 没有使用
                 * Tool_type_ALARM = 2, //报警 没有使用 Tool_type_LABEL = 3, //标签 Tool_type_TALK =
                 * 4, //设备对讲 Tool_type_SOUND = 5, //打开声音 Tool_type_STREAM = 6, //主子码流切换
                 * Tool_type_ZOOM = 7, //电子放大 Tool_type_PLAYBACK = 8, //即时回放 Tool_type_PTZ =
                 * 9, //云镜控制 Tool_type_RECORD = 10 , //紧急录像 Tool_type_SAVE = 11, //即时回放保存
                 * Tool_type_SNAPSHOT = 12, //抓图 Tool_type_Close = 13, //关闭
                 * Tool_type_3D_ZOOM = 22 //3D放大
                 *
                 */

                var previewOperAuthXml = '<?xml version="1.0" encoding="utf-8"?>';
                previewOperAuthXml += '<Privileges>';
                previewOperAuthXml += '< Privilege type="0" />'; // <!--type是按钮类型只填入需要显示的按钮，顺序按照XML解析顺序-->
                previewOperAuthXml += '< Privilege type="1" />';
                previewOperAuthXml += '< Privilege type="2" />';
                previewOperAuthXml += '< Privilege type="3" />';
                previewOperAuthXml += '< Privilege type="4" />';
                previewOperAuthXml += '< Privilege type="5" />';
                previewOperAuthXml += '< Privilege type="6" />';
                previewOperAuthXml += '< Privilege type="7" />';
                previewOperAuthXml += '< Privilege type="8" />';
                previewOperAuthXml += '< Privilege type="9" />';
                previewOperAuthXml += '< Privilege type="10" />';
                previewOperAuthXml += '< Privilege type="11" />';
                previewOperAuthXml += '< Privilege type="12" />';
                previewOperAuthXml += '< Privilege type="13" />';
                previewOperAuthXml += '< Privilege type="22" />';
                previewOperAuthXml += '</ Privileges >';

                that.videAuthMsg = '<?xml version="1.0" encoding="utf-8"?><Privileges><Privilege type="0" /><Privilege type="4" /><Privilege type="5" /><Privilege type="6" /><Privilege type="9" /><Privilege type="10" /><Privilege type="12" /><Privilege type="13" /></Privileges>';


                // 设置操作权限----------------------end-------------------
                try {
                    that.ocx.registerCallback(0x0200000E, that.getAppKey)
                } catch (ex) {

                }

                window.setTimeout(()=> {
                    that.ocx.setWindowsLayout(that.layout);
                    var operAuth = this.ocx.setOperAuth(this.videAuthMsg);
                    if(operAuth == 1){
                        // $("#videTiele").html("初始化视频播放插件失败！请确认使用IE浏览器并安装最新视频插件。最新视频插件点击右上角【下载视频控件-9800】")
                    }else{
                        that.getVideoXml()
                    }
                }, 200);

            },

            // 停止所有设备
            stopAllPreview() {

            },
            // 获取窗口数
            getWnd() {
                this.wndNum = 9;
                this.setWndNum(this.wndNum);
            },
            // 设置窗口数
            SetWnd(opt) {
                this.ocx.MPV_SetPlayWndCount(parseInt(opt, 10));
            },
            //自定义播放工具条按钮
            SetToolBar() {
                this.ocx.MPV_SetToolBar('0,1,2,3,4,5,6,7,8,9,10,11,12,13,14');
            },
            //自定义主工具栏按钮
            SetMainToolBar() {
                this.ocx.MPV_SetMainToolBar('0,1,2,3,4,5,6');
            },
            //设置全屏
            SetFullScreen() {
                this.ocx.MPV_SetFullScreen();
            },
            // 添加下方工几条切换宫格
            ShowMainToolBar() {
                var ret = this.ocx.MPV_ShowMainToolBar(1);
                if (ret != 0) {
                    console.log('显示主工具栏失败');
                }
            },
            handleResize() {

            },
            // 播放视频
            videoPlay(_xml) {
                window.setTimeout(() => {
                    var wndIdx = this.ocx.getSelectWindow();
                    if (wndIdx < 9) {
                        this.ocx.setSelectWindow(wndIdx + 1);
                    }else if(this.playSite == '2'){
                        this.ocx.setSelectWindow(0);
                        wndIdx = 0
                    }
                    this.ocx.startPreview(wndIdx, _xml);
                }, 200);
            },
            setLoopPlay() {
                let that = this
                this.getWnd()
                this.allVideoList = this.getAllVideoCode()
                let steep = 1
                this._setIntervalPlaly(steep)
                this.setInterval = setInterval(() => {
                    if (steep >= that.allVideoList.length) steep = 0;
                    that._setIntervalPlaly(steep)
                    steep++
                }, 60 * 1000)
            },
            _setIntervalPlaly(steep) {
                this.stopAllPreview();
                if (typeof this.allVideoList[steep] == 'string') {
                    this.getVideoXml(this.allVideoList[steep])
                } else {
                    this.allVideoList[steep].forEach((item, i) => {
                        this.getVideoXml(item)
                    })
                }
            },
            destoryVideo() {
                this.stopAllPreview();
            }
        },
        beforeDestroy() {
            this.destoryVideo();
            clearInterval(this.setInterval)
        }
    };
</script>

<style scoped lang="less">
  .video-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
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
