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
    <object classid="clsid:9ECD2A40-1222-432E-A4D4-154C7CAB9DE3" id="spv" ref="spv" class="spv" v-resize="handleResize"/>
  </div>
</template>

<script>
    import { getResouseByCode, getAllVideoUrl} from '@/api/runMonitor';
    import {mapGetters, mapMutations, mapState} from 'vuex';
    export default {
        name: 'video8700Live',
        data() {
            return {
                spvDom: null,
                xml: null,
                message:'',
                showMessage:false,
                downloadFlag:false,
                oWebControl:true,
                wndNum:'', // 视频播放个数
                allVideoList:[],
                setInterval:null,
                initCount:1,
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
                default: '9',
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
            playSite(val){
                if(val == '2'){
                    this.setLoopPlay()
                }else{
                    clearInterval(this.setInterval)
                }
            },
        },
        computed: {
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
            ...mapGetters('tree', ['getAllVideoCode']),
            ...mapMutations('tree', ['setWndNum']),
            init() {
                this.$nextTick(() => {
                    this.spvDom = document.getElementById("spv");
                    this.OnInit()
                })

            },
            getVideoXml(_code) {
                let sendData = {
                    id:_code ? _code : this.videoCode
                }
                getResouseByCode(sendData).then(res => {
                    let {status, resultData} = res;
                    if(status === 'complete'){
                      this.videoPlay(resultData);
                    }
                })
            },
            //初始化控件
            OnInit() {
                let that = this;
                try {
                    var ocxObj = this.spvDom;
                    var languageType = 1;
                    ocxObj.MPV_Init(languageType);
                    that.SetWnd(that.layout);
                    ocxObj.MPV_SetMainToolBar('');
                    ocxObj.MPV_ShowMainToolBar(1);
                    that.SetToolBar();
                    that.SetLocalParam();
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
            SetLocalParam() {
                var devPxRa = screen.deviceXDPI / screen.logicalXDPI;
                var height = this.spvDom.clientHeight * devPxRa;
                var width = this.spvDom.clientWidth * devPxRa;
                this.xml = '<?xml version="1.0" encoding="UTF-8"?> ' +
                    '<localParam> ' +
                    '<width>' + width + '</width> ' +
                    '<height>' + height + '</height> ' +
                    '<picType>0</picType> ' +
                    '<capturePath>C:\\Hikvision</capturePath> ' +
                    '<recordSize>2</recordSize> ' +
                    '<recordPath>C:\\Hikvision</recordPath> ' +
                    '<limitPreviewTime>0</limitPreviewTime> ' +
                    '<showMsgTip>1</showMsgTip> ' +
                    '</localParam>';
                var ret = this.spvDom.MPV_SetLocalParam(this.xml);
            },
            // 停止所有设备
            stopAllPreview() {

            },
            // 获取窗口数
            getWnd() {
                this.wndNum = this.spvDom.MPV_GetPlayWndCount();
                this.setWndNum(this.wndNum);
            },
            // 设置窗口数
            SetWnd(opt) {
                this.spvDom.MPV_SetPlayWndCount(parseInt(opt, 10));
            },
            //自定义播放工具条按钮
            SetToolBar() {
                this.spvDom.MPV_SetToolBar('0,1,2,3,4,5,6,7,8,9,10,11,12,13,14');
            },
            //自定义主工具栏按钮
            SetMainToolBar() {
                this.spvDom.MPV_SetMainToolBar('0,1,2,3,4,5,6');
            },
            //设置全屏
            SetFullScreen() {
                this.spvDom.MPV_SetFullScreen();
            },
            // 添加下方工几条切换宫格
            ShowMainToolBar() {
                var ret = this.spvDom.MPV_ShowMainToolBar(1);
                if (ret != 0) {
                    console.log('显示主工具栏失败');
                }
            },
            handleResize(){

            },
            // 播放视频
            videoPlay(_xml) {
                let that = this
                if (_xml) {
                    try {
                        that.spvDom.MPV_StartPreview(_xml);
                    } catch (e) {
                        that.showMessage = true;
                        that.downloadFlag = true;
                        that.message = "插件启动失败，请检查插件是否安装！";
                    }
                } else {
                    this.$message.warning('该视频暂无数据')
                }
            },
            setLoopPlay() {
                let that = this
                this.getWnd()
                this.allVideoList = this.getAllVideoCode()
                let steep = 1
                this._setIntervalPlaly(steep)
                this.setInterval = setInterval(() => {
                    if(steep>= that.allVideoList.length) steep = 0;
                    that._setIntervalPlaly(steep)
                    steep++
                }, 60*1000)
            },
            _setIntervalPlaly(steep){
                this.stopAllPreview();
                if(typeof this.allVideoList[steep] == 'string'){
                    this.getVideoXml(this.allVideoList[steep])
                }else{
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

<style scoped lang="less" >
  .video-wrapper{
    width: 100%;
    height: 100%;
    overflow: hidden;
    .spv {
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
