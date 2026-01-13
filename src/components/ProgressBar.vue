<template>
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: percentage + '%', background: progressBarColor }">
        <div class="progress-text">{{ Math.round(percentage) }}%</div>
        <div class="light-effect"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    allowInstantCompletion: {
      type: Boolean,
      default: false
    }
  },
  inject: ['state'],
  data() {
    return {
      percentage: 0,
      animationId: null,
      totalTime: 180000, // 3分钟 = 180000毫秒
      startTime: null,
      lastPercentage: 0
    };
  },
  computed: {
    progressBarColor() {
      console.log('www', this.state.theme);
      if (this.state.theme === 'green') {
        return 'linear-gradient(90deg, #66cc99 0%, #2b7a57 100%)';
      } else if (this.state.theme === 'red') {
        return 'linear-gradient(90deg, #F08080, #FA8072)';
      } else {
        return 'linear-gradient(90deg, #00BCD4, #2196F3)';
      }
    }
  },
  mounted() {
    this.startProgress();
  },
  methods: {
    updateProgress() {
      const now = Date.now();
      const elapsed = now - this.startTime;

      // 计算理论进度百分比
      const targetPercentage = Math.min((elapsed / this.totalTime) * 100, 100);

      // 如果allowInstantCompletion为false，最大只能到99%
      if (!this.allowInstantCompletion && targetPercentage >= 99) {
        targetPercentage = 99;
      }

      // 平滑过渡到目标百分比
      const diff = targetPercentage - this.percentage;
      this.percentage += diff * 0.1; // 使用缓动效果，系数可调整

      if (elapsed >= this.totalTime) {
        this.percentage = 100;
        cancelAnimationFrame(this.animationId);
        this.$emit('completed');
        return;
      }

      this.animationId = requestAnimationFrame(this.updateProgress);
    },
    startProgress() {
      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.percentage = 0;
      this.startTime = Date.now();
      this.animationId = requestAnimationFrame(this.updateProgress);
    },
    resetProgress() {
      cancelAnimationFrame(this.animationId);
      this.percentage = 0;
    },
    skipToEnd() {
      if (this.allowInstantCompletion) {
        this.percentage = 100;
        cancelAnimationFrame(this.animationId);
        this.$emit('completed');
      } else {
        console.warn('立即完成功能已被禁用');
      }
    }
  },
  beforeDestroy() {
    cancelAnimationFrame(this.animationId);
  }
};
</script>

<style scoped>
.progress-container {
  width: 100%;
  margin: 0 auto;
  padding: 0px 3px 0 0px;
  position: absolute;
  left: 0;
  top: 0px;
}
.progress-text {
  font-size: 12px;
  font-weight: 300;
  color: #ffffff;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: absolute;
  right: 10px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
.progress-bar {
  width: 100%;
  height: 10px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  display: flex;
}

.progress-fill {
  height: 100%;
  /* background: linear-gradient(90deg, #66cc99 0%, #2b7a57 100%); */
  border-radius: 10px;
  transition: width 0.1s linear;
  position: relative;
  overflow: visible;
  display: flex;
  align-items: center;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.3) 100%
  );
  border-radius: 10px;
}
.light-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-20deg);
  animation: lightMove 1.5s infinite ease-in-out;
  filter: blur(2px);
}

@keyframes lightMove {
  0% {
    left: -40px;
    opacity: 0.9;
  }
  70% {
    opacity: 0.7;
  }
  100% {
    left: calc(100% + 40px);
    opacity: 0;
  }
}
</style>
