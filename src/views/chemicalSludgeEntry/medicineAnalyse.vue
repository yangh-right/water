<!--
 * @Description: 
 * @Author: JianYue
 * @Date: 2024-04-09 15:57:15
 * @LastEditTime: 2024-04-15 08:52:02
 * @LastEditors:  Do not edit
-->
<template>
      <form-model :type="type"></form-model>
  </template>
  
  <script>
  import formModel from './formModel.vue';
  export default {
    name: 'medicineAnalyse',
    components: { formModel },
    data() {
      return {
        type: '1'
      };
    },
    computed: {},
    mounted() {
    }
  };
  </script>
  
  <style lang="less" scoped>
  </style>
  