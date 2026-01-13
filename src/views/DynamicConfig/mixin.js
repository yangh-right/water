import { mapGetters } from 'vuex';

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters('user', {
      currentUser: 'info'
    })
  },
  watch: {
    id: {
      handler(val) {
        if (val) {
          this.getConfigInfo(val);
        }
      },
      immediate: true
    }
  }
};
