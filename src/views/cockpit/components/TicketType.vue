<template>
  <div class="card-box">
    <w-spin :spinning="RealTicketTypeRatioPre.spinning">
      <card v-bind="RealTicketTypeRatioPre" @open="handleOpenModal" />
    </w-spin>
  </div>
</template>

<script>
import { RealTicketTypeRatioPre } from '@/enum/ticket-chart';
import { getTicketTypeRatio } from '@/api/index';
import { changeTree, toMap } from '@/utils/util';
import { mapState } from 'vuex';
import Card from '@/components/Card';
export default {
  name: 'TicketType',
  data() {
    return {
      isLoading: false,
      RealTicketTypeRatioPre,
      scoreNum: '',
      ponitsArr: []
    };
  },
  components: {
    // DateFilter,

    Card
  },
  inject: ['state'],
  computed: {
    ...mapState('dict', {
      typeJsonTree: state => toMap(state.dictory1.all_type_tree)
    }),
    themeColor() {
      if (this.state.theme !== 'dark') {
        return true;
      } else {
        return false;
      }
    }
  },
  watch: {
    factoryId: {}
  },
  methods: {
    /* 处理中工单类型占比饼图 */
    async TicketTypeRatio() {
      try {
        this.RealTicketTypeRatioPre.spinning = true;
        const { status, resultData } = await getTicketTypeRatio();
        if (status === 'complete') {
          let Items = [];
          let counts = 0;
          let data = changeTree(resultData, this.typeJsonTree);

          data.forEach(v => {
            counts += v.value;
          });
          data.forEach(v => {
            let obj = {
              name: v.name,
              value: v.value,
              rate: parseFloat((v.value / counts) * 100.0).toFixed(2)
            };
            Items.push(obj);
          });
          this.RealTicketTypeRatioPre.echart.title.subtext = counts;
          let result = Items.map(item => {
            let obj = { ...item };
            obj.rate = `${item.rate}%`;
            return obj;
          });
          this.RealTicketTypeRatioPre.records = result;
        }
      } catch (error) {
        this.RealTicketTypeRatioPre.records = [];
      } finally {
        this.RealTicketTypeRatioPre.chartsKey = Math.random();
        this.RealTicketTypeRatioPre.spinning = false;
      }
    },
    async handleOpenModal() {
      try {
        this.RealTicketTypeRatioPre.spinning = true;
        const { status, resultData } = await getTicketTypeRatio();
        if (status === 'complete') {
          let data = changeTree(resultData, this.typeJsonTree);
          this.RealTicketTypeRatio.records = data;
          this.modalCard = this.RealTicketTypeRatio;
          this.$refs.cardDialog && (this.$refs.cardDialog.visible = true);
        }
      } catch (error) {
        this.RealTicketTypeRatio.records = [];
      } finally {
        this.RealTicketTypeRatio.chartsKey = Math.random();
        this.RealTicketTypeRatioPre.spinning = false;
      }
    }
  },
  mounted() {
    this.timer = setTimeout(() => {
      this.TicketTypeRatio();
    }, 200);
  },
  beforeDestroy() {
    if(this.timer) clearTimeout(this.timer);
  }
};
</script>

<style lang="less" scoped></style>
