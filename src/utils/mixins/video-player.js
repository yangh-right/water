/**
 * 实时视频监控统一生命周期管理
 */

export default {
  beforeDestroy() {
    if (this.player) {
      this.player.dispose(); // 销毁
    }
  },
  deactivated() {
    if (this.player) {
      this.player.dispose(); // 销毁
    }
  },
  activated() {
    // 重新初始化播放器进行播放
  },
  mounted() {
    // 初始化播放器进行播放
  }
};
