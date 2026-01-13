<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-07-13 16:52:03
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-07-29 09:48:26
 * @Description: 我的上报
-->
<template>
  <problem-report :role-type="2"></problem-report>
</template>

<script>
import ProblemReport from './components/problem/index';
export default {
  name: 'ProblemInspect',
  components: {
    ProblemReport
  },
  data() {
    return {};
  }
};
</script>
