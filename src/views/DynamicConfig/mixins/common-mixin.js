export default {
  props: {
    waterPlantId: {
      type: String
    },
    form: {
      type: Object
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      stationTree: []
    };
  },
  methods: {
    // 获取水厂下的构筑物和设施
    async getStationTree() {
      if (!this.waterPlantId) {
        return;
      }
      try {
        const { resultData } = await this.$axios.get('/waterwork-device-api/deviceInfogetOrganizeTree', {
          params: {
            waterPlantId: this.waterPlantId
          }
        });
        const list = resultData?.[0].children ?? [];
        this.stationTree = Object.freeze(
          list.map((i) => {
            return {
              title: i.label,
              value: i.id,
              key: i.id,
              selectable: false,
              children: i.children.map((ii) => {
                return {
                  title: ii.name,
                  value: ii.id,
                  key: ii.id,
                  selectable: true,
                  pId: i.id
                };
              })
            };
          })
        );
      } catch (error) {
        this.stationTree = [];
      }
    },
    handleRemoveField(idx) {
      this.form.domains.splice(idx, 1);
    }
  }
};
