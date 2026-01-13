<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-11-04 15:20:30
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-02-13 11:28:32
 * @Description: 
-->
<template>
  <div class="content">
    <w-input v-model="curIcon" style="width: 120px;" ></w-input>
    
    <div class="icon">

      <span :class="{'supply-flex':true,'icon_item':true, 'cur-icon':item.includes(curIcon) && curIcon}" v-for="(item, index) in list" :key="index">
        <w-icon class="supply-cursor-pointer" :title="item" style="font-size: 32px;"  :type="item" />
        <!-- <span>{{item}}</span> -->
      </span>
    </div>
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api';

var requireModule = require.context('@wpg/icons-svg/inline-svg/', false, /\.svg$/);
var arr = [];
for (var i = 0; i < requireModule.keys().length; i++) {
  arr.push(requireModule.keys()[i].substr(2, requireModule.keys()[i].length - 6));
}

export default {
  name: 'icon',
  components: {},

  data() {
    return {
      list: arr,
      curIcon: '',
    };
  },
};
</script>
<style lang="less" scoped>
  .content {
    height: 100vh;
    overflow: auto;
  }
  .cur-icon {
    color: #4285f4;
  }
  .icon {
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
  }
.icon__item {
  display: flex;
    flex-direction: column;
    /* border: 1px dashed; */
    /* margin: 5px; */
    align-items: center;
}
</style>
