<template>
  <div ref="videoWrapper" class="video-wrapper">
    <div v-show="showMessage" class="massage">
      <img
        v-if="downloadFlag"
        class="img"
        src="@/assets/images/default/runMonitor/empty_video.png"
        alt=""
      />
      <w-spin v-if="!downloadFlag" class="loading" size="large" />
      <h1 class="supply-text-third">{{ message }}</h1>
      <h2 v-if="downloadFlag">
        <a class="down" :href="url" download="VideoWebPlugin.exe">下载插件</a>
      </h2>
    </div>
    <div :id="videoBoxId" ref="playWnd" v-resize="handleResize" class="playWnd"></div>
  </div>
</template>

<script>
import { getISCConf } from '@/api/runMonitor';
import { mapState } from 'vuex';
export default {
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
    extColumn: {
      required: true,
      default: '',
      type: String
    },
    layout: {
      default: '3x3',
      type: String
    },
    videoBoxId: {
      default: 'playWnd',
      type: String
    },
    showToolbar: {
      type: Number,
      default: 1
    },
    full: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      name: 'hikVideo',
      oWebControl: null,
      innerCameraCode: '',
      hadInit: false,
      videoW: 0,
      videoH: 0,
      initCount: 0,
      message: '',
      downloadFlag: false,
      showMessage: false,
      streamMode: 1,
      pubKey: '',
      iscConfig: {
        appkey: '', // API网关提供的appkey
        ip: '', // API网关IP地址
        port: 443, // 端口
        secret: 'mxG7P12FnOZa76Js0mXZ'
      },
      wndNum: '', // 视频播放个数
      allVideoList: [],
      setInterval: null
    };
  },
  computed: {
    ...mapState('tree', ['treeDataObjCurrent']),
    ...mapState('pub', ['allVideoUrl']),
    ...mapState('video', ['hideVideo']),
    url() {
      if (this.allVideoUrl.VISC) {
        return this.allVideoUrl.VISC.value;
      } else {
        return 'http://web2.cloud4water.com/video/VideoWebPlugin.exe';
      }
    }
  },
  watch: {
    videoCode: {
      handler(val) {
        if (this.playSite == 2) {
          this.$message.warning('当前为循环播放请切换为手动播放！');
          return false;
        }
        if (!this.oWebControl) {
          this.getIscConfig();
        } else {
          this.showData(val);
        }
      },
      immediate: true
    },
    playSite(val) {
      if (val == '2') {
        this.setLoopPlay();
      } else {
        clearInterval(this.setInterval);
      }
    },
    hideVideo: {
      handler(val) {
        if (!this.$route.path.includes('runMonitor/videoPage')) return;
        if (val) {
          this.oWebControl && this.oWebControl.JS_HideWnd();
        } else {
          this.oWebControl && this.oWebControl.JS_ShowWnd();
        }
      }
    }
  },
  mounted() {
    // this.getIscConfig(); // todo 测试 需要删除
    window.addEventListener('resize', this.handleResize);
  },
  activated() {
    if (this.oWebControl && this.hadInit) {
      this.oWebControl.JS_ShowWnd();
    }
  },
  deactivated() {
    if (this.oWebControl && this.hadInit) {
      this.oWebControl.JS_HideWnd();
      window.removeEventListener('resize', this.handleResize);
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.destoryVideo();
    clearInterval(this.setInterval);
  },
  methods: {
    /**
     * 获取 isc 配置
     */
    getIscConfig() {
      getISCConf(this.videoCode).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.iscConfig.appkey = resultData[0].isc_key;
          this.iscConfig.ip = resultData[0].isc_url;
          this.iscConfig.port = Number(resultData[0].isc_port);
          this.iscConfig.secret = resultData[0].isc_sec;
          if (!this.oWebControl) {
            this.initPlugin();
          } else {
            this.showData(this.videoCode);
          }
        }
      });
    },
    // 创建播放实例
    initPlugin() {
      let that = this;
      that.videoW = that.$refs.videoWrapper.clientWidth;
      that.videoH = that.$refs.videoWrapper.clientHeight;
      if (!this.oWebControl) {
        // eslint-disable-next-line no-undef
        that.oWebControl = new WebControl({
          szPluginContainer: that.videoBoxId, // 指定容器id
          iServicePortStart: 15900, // 指定起止端口号，建议使用该值
          iServicePortEnd: 15909,
          szClassId: '23BF3B0A-2C56-4D97-9C03-0CB103AA8F11', // 用于IE10使用ActiveX的clsid
          cbConnectSuccess: function() {
            // if (!this.oWebControl) {
            // 创建WebControl实例成功
            that.oWebControl
              .JS_StartService('window', {
                // WebControl实例创建成功后需要启动服务
                dllPath: './VideoPluginConnect.dll' // 值"./VideoPluginConnect.dll"写死
              })
              .then(function() {
                // 启动插件服务成功
                that.oWebControl
                  .JS_CreateWnd(that.videoBoxId, that.videoW, that.videoH)
                  .then(function() {
                    //     //JS_CreateWnd创建视频播放窗口，宽高可设定
                    if (window.top !== window) {
                      let asideWidth = that.full
                        ? 0
                        : window.top.document.querySelector('.wf-app-layout-sider')?.offsetWidth ??
                          0;
                      let top = that.full ? 0 : 86;
                      that.oWebControl.JS_SetDocOffset({ left: asideWidth, top });
                    }
                    that.playerInit(); // 创建播放实例成功后初始化
                    that.hadInit = true;
                    that.showMessage = false;
                    that.downloadFlag = false;
                    that.oWebControl.JS_SetWindowControlCallback({
                      // 设置消息回调
                      cbIntegrationCallBack: that.cbIntegrationCallBack
                    });
                  });
              });
            // }
          },
          cbConnectError: function() {
            // 创建WebControl实例失败
            that.oWebControl = null;
            that.message = '插件未启动，正在尝试启动，请稍候...';
            that.showMessage = true;
            // eslint-disable-next-line no-undef
            WebControl.JS_WakeUp('VideoWebPlugin://'); // 程序未启动时执行error函数，采用wakeup来启动程序
            that.initCount++;
            if (that.initCount < 3) {
              setTimeout(function() {
                that.initPlugin();
              }, 3000);
            } else {
              that.message = '插件启动失败，请检查插件是否安装！';
              that.downloadFlag = true;
            }
          },
          cbConnectClose: function(bNormalClose) {
            // 异常断开：bNormalClose = false
            // JS_Disconnect正常断开：bNormalClose = true
            console.log('cbConnectClose');
            that.oWebControl = null;
          }
        });
        // this.oWebControl.JS_SetWindowControlCallback({
        //   // 设置消息回调
        //   cbIntegrationCallBack: this.cbIntegrationCallBack
        // });
      }
    },

    destoryVideo() {
      this.hiedWnd();
    },
    hiedWnd() {
      if (this.oWebControl) {
        this.oWebControl.JS_HideWnd();
        this.oWebControl.JS_Disconnect();
        this.oWebControl.JS_DestroyWnd();
      }
    },
    showWnd() {
      this.getIscConfig();
    },
    // 获取公钥
    getPubKey(callback) {
      let that = this;
      this.oWebControl
        .JS_RequestInterface({
          funcName: 'getRSAPubKey',
          argument: JSON.stringify({
            keyLength: 1024
          })
        })
        .then(function(oData) {
          if (oData.responseMsg.data) {
            that.pubKey = oData.responseMsg.data;
            callback();
          }
        });
    },
    // RSA加密
    setEncrypt(value) {
      // eslint-disable-next-line no-undef
      let encrypt = new JSEncrypt();
      encrypt.setPublicKey(this.pubKey);
      return encrypt.encrypt(value);
    },
    // 初始化
    playerInit() {
      let that = this;
      this.getPubKey(function() {
        that.oWebControl
          .JS_RequestInterface({
            funcName: 'init',
            argument: JSON.stringify({
              appkey: that.iscConfig.appkey, // API网关提供的appkey
              ip: that.iscConfig.ip, // API网关IP地址
              port: that.iscConfig.port, // 端口
              secret: that.iscConfig.secret, // "setEncrypt("mxG7P12FnOZa76Js0mXZ") API网关提供的secret
              enableHTTPS: 1, // 是否启用HTTPS协议
              language: 'zh_CN',
              layout: that.layout, // 布局
              playMode: 0, // 播放模式（决定显示预览还是回放界面）
              reconnectDuration: 5,
              reconnectTimes: 5,
              showSmart: 1, // 是否显示智能信息
              showToolbar: that.showToolbar, // 是否显示工具栏
              SnapDir: 'D:\\SmartPlantSnap', // 抓图存储路径
              videoDir: 'D:\\SmartPlantVideo', // 紧急录像或录像剪辑存储路径
              // encryptedFields: "secret", //加密字段
              buttonIDs: '0,16,256,257,258,259,260,512,513,514,515,516,517,768,769' // 自定义工具条按钮
            })
          })
          .then(function(oData) {
            that.oWebControl.JS_Resize(that.videoW, that.videoH); // 初始化后resize一次，规避firefox下首次显示窗口后插件窗口未与DIV窗口重合问题
            that.showData(that.videoCode);
          });
      });
    },
    // 消息回调
    cbIntegrationCallBack(oData) {
      /* type===3 抓图结果消息 */
      let {
        msg: { picData, expand, result },
        type
      } = oData.responseMsg;
      if (type === 3) {
        if (picData && result === 0) {
          // let arr = expand.split('/');
          // let name = `${arr[arr.length - 1].split('_')[0]}.jpg`;
          this.$emit('getImg', `data:image/jpeg;base64,${picData}`);
        } else {
          this.$emit('getImg', false);
        }
      } else {
        return false;
      }
    },

    /**
     * 关闭所有视频
     */
    stopAllPreview() {
      this.oWebControl.JS_RequestInterface({
        funcName: 'stopAllPreview'
      });
    },
    showData(cameraCode, _wndId) {
      this.getVideoLayout();
      let cameraIndexCode = cameraCode; // 获取输入的监控点编号值，必填
      let streamMode = 0; // 主子码流标识：0-主码流，1-子码流
      let transMode = 1; // 传输协议：0-UDP，1-TCP
      let gpuMode = 0; // 是否启用GPU硬解，0-不启用，1-启用
      let wndId = _wndId ? _wndId : -1; // 播放窗口序号（在2x2以上布局下可指定播放窗口）
      cameraIndexCode = cameraIndexCode.replace(/(^\s*)/g, '');
      cameraIndexCode = cameraIndexCode.replace(/(\s*$)/g, '');
      this.oWebControl.JS_RequestInterface({
        funcName: 'startPreview',
        argument: JSON.stringify({
          cameraIndexCode: cameraIndexCode, // 监控点编号
          streamMode: streamMode, // 主子码流标识
          transMode: transMode, // 传输协议
          gpuMode: gpuMode, // 是否开启GPU硬解
          wndId: wndId // 可指定播放窗口
        })
      });
    },
    requestInterface(JsonParam) {
      this.oWebControl.JS_RequestInterface(JsonParam).then(function(oData) {
        console.log(oData);
      });
    },
    // 自适应窗口大小
    handleResize() {
      this.$nextTick(() => {
        let { full } = this;
        if (this.oWebControl && this.hadInit) {
          this.videoW = this.$refs.videoWrapper.clientWidth;
          this.videoH = this.$refs.videoWrapper.clientHeight;
          this.oWebControl.JS_Resize(this.videoW, this.videoH);
          if (window.top !== window) {
            let asideWidth = full
              ? 0
              : window.top.document.querySelector('.wf-app-layout-sider')?.offsetWidth ?? 0;
            let top = full ? 0 : 86;
            this.oWebControl.JS_SetDocOffset({ left: asideWidth, top });
          }
          this.setWndCover();
        }
      });
    },
    // 设置窗口裁剪，当因滚动条滚动导致窗口需要被遮住的情况下需要JS_CuttingPartWindow部分窗口
    setWndCover() {
      if (this.oWebControl && this.hadInit) {
        let iWidth = window.innerWidth;
        let iHeight = window.innerHeight;
        let oDivRect = this.$refs.playWnd.getBoundingClientRect();
        let iCoverLeft = oDivRect.left < 0 ? Math.abs(oDivRect.left) : 0;
        let iCoverTop = oDivRect.top < 0 ? Math.abs(oDivRect.top) : 0;
        let iCoverRight = oDivRect.right - iWidth > 0 ? Math.round(oDivRect.right - iWidth) : 0;
        let iCoverBottom =
          oDivRect.bottom - iHeight > 0 ? Math.round(oDivRect.bottom - iHeight) : 0;

        iCoverLeft = iCoverLeft > 1000 ? 1000 : iCoverLeft;
        iCoverTop = iCoverTop > 600 ? 600 : iCoverTop;
        iCoverRight = iCoverRight > 1000 ? 1000 : iCoverRight;
        iCoverBottom = iCoverBottom > 600 ? 600 : iCoverBottom;

        this.oWebControl.JS_RepairPartWindow(0, 0, 1001, 600); // 多1个像素点防止还原后边界缺失一个像素条
        if (iCoverLeft !== 0) {
          this.oWebControl.JS_CuttingPartWindow(0, 0, iCoverLeft, 600);
        }
        if (iCoverTop !== 0) {
          this.oWebControl.JS_CuttingPartWindow(0, 0, 1001, iCoverTop); // 多剪掉一个像素条，防止出现剪掉一部分窗口后出现一个像素条
        }
        if (iCoverRight !== 0) {
          this.oWebControl.JS_CuttingPartWindow(1000 - iCoverRight, 0, iCoverRight, 600);
        }
        if (iCoverBottom !== 0) {
          this.oWebControl.JS_CuttingPartWindow(0, 600 - iCoverBottom, 1000, iCoverBottom);
        }
      }
    },
    async getVideoLayout() {
      await this.oWebControl
        .JS_RequestInterface({
          funcName: 'getLayout'
        })
        .then(res => {
          let { responseMsg } = res;
          this.wndNum = JSON.parse(responseMsg.data).wndNum;
        });
    },
    /* 截图 */
    getCurrentView() {
      this.oWebControl
        .JS_RequestInterface({
          funcName: 'snapShot',
          argument: JSON.stringify({ name: 'D:\test.jpg' })
        })
        .then(res => {
          let { responseMsg } = res;
          // console.log('responseMsg', responseMsg);
          if (responseMsg.code !== 0 || responseMsg.msg !== 'success') {
            this.$emit('getImg', false);
          }
        });
    },
    getAllVideo() {
      this.allVideoList = [];
      let arr = [];
      let num = 1;
      for (let key in this.treeDataObjCurrent) {
        if (this.extColumn && this.treeDataObjCurrent[key].data && this.treeDataObjCurrent[key].data.deviceModel == this.extColumn) {
          if (this.wndNum == 1) {
            this.allVideoList.push(key);
          } else {
            num++;
            if (arr.length < Number(this.wndNum)) {
              arr.push(key);
            } else {
              arr.push(key);
              this.allVideoList.push(arr);
              arr = [];
            }
          }
        }
      }
      if (num % this.wndNum > 0) this.allVideoList.push(arr);
    },
    async setLoopPlay() {
      let that = this;
      await this.getVideoLayout();
      await this.getAllVideo();
      let steep = 0;
      this._setIntervalPlaly(steep);
      this.setInterval = setInterval(() => {
        if (steep >= that.allVideoList.length) steep = 0;
        that._setIntervalPlaly(steep);
        steep++;
      }, 60 * 1000);
    },
    _setIntervalPlaly(steep) {
      this.stopAllPreview();
      if (typeof this.allVideoList[steep] === 'string') {
        this.showData(this.allVideoList[steep]);
      } else {
        this.allVideoList[steep].forEach((item, i) => {
          this.showData(item, i + 1);
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.video-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .playWnd {
    width: 100%;
    height: 100%;
  }
}
.massage {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  .loading {
    margin-bottom: 20px;
  }
  h2 {
    margin-top: 20px;
  }
  .down {
    border: 1px solid var(--supply-color-primary-DEFAULT);
    color: var(--supply-color-primary-DEFAULT);
    border-radius: 4px;
    font-size: 14px;
    padding: 10px 14px;
  }
}
</style>
