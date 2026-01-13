<template>
  <div class="point">
    <div class="card">
      <div class="point__list">
        <template v-for="(item, index) in data1">
          <div v-if="index !== 0" class="split"></div>
          <div class="point__item">
            <div class="item__con">
              <div class="point__title" :title="item.name">{{ item.name }}</div>
              <div class="point__val">
                <div class="point__pv">{{ item.val }}</div>
                <div class="point__unit">{{ item.unit }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="card__title">投加策略</div>
    </div>
    <div class="card">
      <div class="point__list">
        <template v-for="(item, index) in data2">
          <div v-if="index !== 0" class="split"></div>
          <div class="point__item">
            <div class="item__con">
              <div class="point__title" :title="item.name">{{ item.name }}</div>
              <div class="point__val">
                <div class="point__pv">{{ item.val }}</div>
                <div class="point__unit">{{ item.unit }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="card__title">AAO生物池除磷剂建议投加</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data1: [
        { name: '生化池出水总磷设定值', val: 1.3, unit: 'Hz' },
        { name: '生化池出水总磷设定值', val: 1.3, unit: 'Hz' },
        { name: '生化', val: 1.3, unit: 'Hz' },
        { name: '增益系数', val: 1.3, unit: 'Hz' }
      ],
      data2: [
        { name: '生化池出水总磷设定值', val: 1.3, unit: 'Hz' },
        { name: '生化池出水总磷设定值', val: 1.3, unit: 'Hz' },
        { name: '臭氧接触池', val: 1.3, unit: 'Hz' }
      ]
    };
  },

  components: {},

  computed: {},

  mounted() {},

  methods: {}
};
</script>
<style lang="less" scoped>
.point {
  padding: 20px;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .card {
    background: url('~@/assets/images/modules/discharge/card1_bg.png') no-repeat;
    background-size: 100% 100%;
    height: 194px;
    width: calc(50% - 12px);
    &__title {
      height: 32px;
      line-height: 32px;
      font-size: 14px;
      color: #d9ecff;
      letter-spacing: 0;
      text-align: center;
    }
  }
  &__list {
    height: calc(100% - 32px);
    padding: 17px 13%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .split {
      width: 100%;
      height: 2px;
      background-image: linear-gradient(270deg, #2576c7 0%, #05254c00 100%);
    }
    .point__item {
      .item__con {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .point__title {
          font-weight: 400;
          font-size: 14px;
          color: #7cc5ff;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          letter-spacing: 0;
        }
        .point__val {
          padding-right: 12%;
          display: flex;
          align-items: center;

          .point__pv {
            width: 60px;
            height: 25px;
            font-family: AlibabaPuHuiTi_2_85_Bold, sans-serif;
            font-weight: 700;
            font-size: 16px;
            color: #d8ecff;
            letter-spacing: 0;
            background: url('~@/assets/images/modules/discharge/data_bg.png') no-repeat;
            background-size: 100% 100%;
            text-align: center;
          }
          .point__unit {
            margin-left: 10px;
            font-weight: 400;
            font-size: 14px;
            color: #7cc5ff;
            letter-spacing: 0;
          }
        }
      }
    }
  }
}
</style>
