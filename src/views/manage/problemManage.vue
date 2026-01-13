<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-07-13 16:52:03
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-07-29 09:48:53
 * @Description: 问题上报
-->
<template>
  <problem-report :role-type="1"></problem-report>
</template>

<script>
import ProblemReport from './components/problem/index';
export default {
  name: 'ProblemManage',
  components: {
    ProblemReport
  },
  data() {
    return {};
  }
};
</script>
