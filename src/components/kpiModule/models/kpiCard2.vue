<template>
  <div class="kpiCard">
    <div class="kpiCard-item">
      <p class="kpiCard-title">昨日进水总量进水总量</p>
      <p class="kpiCard-info">
        <span class="kpiCard-pv" :style="{ color }">87.3</span>
        <span class="kpiCard-unit">万m³</span>
      </p>
    </div>
    <div class="kpiCard-item">
      <p class="kpiCard-title">昨日进水总量</p>
      <p class="kpiCard-info">
        <span class="kpiCard-pv" :style="{ color }">87.3</span>
        <span class="kpiCard-unit">万m³</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KpiCard',
  props: {
    color: String,
    data: Array,
  },
};
</script>

<style lang="less" scoped>
.kpiCard {
  padding: 10px 8px;
  overflow: hidden;
  background-color: var(--bgc2);
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 var(--bsc2);

  &-item {
    &:not(:first-child) {
      margin-top: 12px;
    }
  }

  &-title {
    line-height: 18px;
    color: var(--fc1);
    .textOverflow();
  }

  &-info {
    margin-top: 4px;
    line-height: 20px;
  }

  &-pv {
    font-family: DIN-Black, sans-serif;
    font-size: 18px;
    font-weight: 900;
    color: var(--fc2);
    letter-spacing: 1.12px;
  }

  &-unit {
    margin-left: 2px;
    font-size: 12px;
    color: var(--fc3);
    opacity: 0.6;
  }
}
</style>
