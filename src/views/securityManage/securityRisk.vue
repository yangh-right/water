<template>
  <div class="risk">
    <img class="risk__img" src="@/assets/images/modules/securityRisk/securityRisk1.png" />
    <img class="risk__img" src="@/assets/images/modules/securityRisk/securityRisk2.png" />
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {};
  },
};
</script>
<style lang="less" scoped>
.risk {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-radius: 4px;
  background-color: var(--supply-color-bg-card-DEFAULT);
  .risk__img {
    width: 40%;
  }
}
</style>
