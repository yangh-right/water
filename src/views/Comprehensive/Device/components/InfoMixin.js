import dayjs from 'dayjs';
export default {
  data() {
    return {
      loading: false,
      layout: {
        span: 12,
        labelCol: { span: 4 },
        wrapperCol: { span: 18 }
      }
    };
  },
  computed: {},
  watch: {},
  methods: {
    disabledStartDate(startValue) {
      return this.$moment()
        .subtract(0, 'days')
        .isBefore(startValue);
    },
    getPopupContainer(trigger) {
      return trigger.parentNode;
    }
  }
};
