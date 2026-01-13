<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-06-15 16:36:28
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-06-15 16:43:07
 * @Description: 
-->
<template>
  <div>
    <div class="list">

      <div :style="{backgroundColor:getColor(index)}" class="item" v-for="(item, index) in 20" :key="index"></div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
    };
  },

  components: {},

  computed: {},

  mounted(){
    
  },

  methods: {
    getColor(i) {
      let color = 'hsl('+ i+','+i+'%,'+i+'%)'
    }}
}

</script>
<style lang='less' scoped>
  .list{
    width: 100%;
    .item{
      height: 2px;
      width: 80%;

    }
  }
</style>