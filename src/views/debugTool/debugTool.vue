<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-17 09:00:13
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-17 13:56:55
 * @Description: 
-->
<template>
  <div class="debug-tool">
    <div class="head">
      <div class="menu">
        <div
          :class="{ menu__item: true, 'menu__item--select': menu.value === menuCode }"
          v-for="(menu, index) in menuList"
          :key="menu.value"
        >
          <div class="menu__btn text-gradient" :text="menu.name" @click="checkMenu(menu)">
            <span class="text">{{ menu.name }}</span>
          </div>
          <div class="menu__split"></div>
        </div>
      </div>
      <div class="weather">
        <weather-module></weather-module>
      </div>
      <div class="time">
        <time-module></time-module>
      </div>
    </div>
    <div class="content">
      <component :is="curMenu.path"></component>
    </div>
  </div>
</template>

<script>
import timeModule from './models/timeModule';
import weatherModule from './models/weatherModule';
import carbonDosing from '@/views/debugTool/smartDosing/carbonDosing';
import delPDosing from '@/views/debugTool/smartDosing/delPDosing';
import sludgeDischarge from '@/views/debugTool/sludgeDischarge/index';
import sandDischarge from '@/views/debugTool/sandDischarge/index';
export default {
  data() {
    return {
      menuList: [
        { name: '智能加药', value: '0', path: carbonDosing },
        { name: '智能除磷', value: '1', path: delPDosing },
        { name: '智能排泥', value: '2', path: sludgeDischarge },
        { name: '智能排砂', value: '3', path: sandDischarge }
      ],
      menuCode: '0'
    };
  },
  components: {
    timeModule,
    weatherModule
  },
  computed: {
    curMenu() {
      return this.menuList.find(item => item.value === this.menuCode);
    }
  },
  methods: {
    checkMenu(menu) {
      this.menuCode = menu.value;
    }
  }
};
</script>
<style lang="less" scoped>
.debug-tool {
  background-color: #000d1f;
  width: 100%;
  height: 100%;
  .head {
    padding-left: 24%;
    background: url('~@/assets/images/modules/discharge/menu_bg.png') no-repeat;
    background-size: 100% 100%;
    width: 100%;

    height: 86px;
    position: relative;
    .menu {
      display: flex;
      position: absolute;
      bottom: 7px;
      &__item {
        margin-right: 20px;
        .text-gradient {
          line-height: 24px;
          font-family: PangMenZhengDao, sans-serif;
          position: relative;
          font-size: 24px;
          letter-spacing: 0;
          .text {
            font-size: 24px;
            letter-spacing: 0;
            background-image: linear-gradient(to bottom, #c6e0ee, #c6e0ee, #749bcf, #749bcf);
            -webkit-background-clip: text;
            color: transparent;
            z-index: 2;
            position: relative;
          }
          &::before {
            content: attr(text);
            position: absolute;
            z-index: 1;
            text-shadow: 0 3px 2px #00000080;
          }
        }
        &.menu__item--select {
          .text-gradient {
            .text {
              background-image: linear-gradient(to bottom, #ffffff, #ffffff, #81f0ff, #81f0ff);
            }
          }
        }
        .menu__btn {
          cursor: pointer;
          padding: 12px 24px;
          background: url('~@/assets/images/modules/discharge/menu.png') no-repeat;
          background-size: 100% 100%;
        }
        .menu__split {
          margin-top: 13px;
          width: 144px;
          height: 3px;
          background: #44d3ff;
          display: none;
        }
        &--select {
          .menu__btn {
            background: url('~@/assets/images/modules/discharge/menu_select.png') no-repeat;
            background-size: 100% 100%;
            color: #f2f9ff;
          }
          .menu__split {
            display: block;
          }
        }
      }
    }
    .weather {
      right: 12%;
      top: 26px;
      position: absolute;
    }
    .time {
      right: 0;
      top: 24px;
      position: absolute;
    }
  }
  .content {
    width: 100%;
    height: calc(100% - 86px);
  }
}
</style>
