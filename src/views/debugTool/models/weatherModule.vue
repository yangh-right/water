<!--
 * @Author: your name
 * @Date: 2022-01-12 11:17:58
 * @LastEditTime: 2024-05-17 11:51:02
 * @LastEditors: yuan wenyu
 * @Description: 天气组件
-->
<template>
  <div class="weatherModule" ref="container">
    <div class="temperature">温度：{{ weather.now }}</div>
    <div class="split"></div>
    <div class="type">天气：{{ weather.type }}</div>
  </div>
</template>

<script>
import { getWeather } from '@/api/public';
export default {
  name: 'WeatherModule',
  data() {
    return {
      address: '',
      weather: {
        type: '',
        temperature: ``,
        now: ''
      }
    };
  },
  mounted() {
    this.getBaiduWeather();
  },
  methods: {
    // 天气接口
    async getBaiduWeather() {
      let { resultData, status } = await getWeather();
      if (status === 'complete') {
        let { result } = resultData;
        this.address = result.location.city;
        this.weather = {
          type: result.now.text,
          temperature: `${result.forecasts[0].low}℃~${result.forecasts[0].high}℃`,
          now: `${result.now.temp}℃`
        };
      }
    }
  }
};
</script>

<style lang="less" scoped>
.weatherModule {
  display: flex;
  align-items: center;
  .type,
  .temperature {
    font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
    font-weight: 400;
    font-size: 18px;
    color: #f2f9ff;
    letter-spacing: 0;
    text-align: right;
  }
  .split {
    margin: 0 10px;
    width: 1px;
    height: 20px;
    background: #0069c4;
  }
}
</style>
