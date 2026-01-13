export default {
  methods: {
    // 根据水厂ID获取水厂名
    factoryName(text) {
      if (typeof text === 'object') return text;
      let factoryList = text ? text.split(',') : [];
      let resText = '';
      factoryList.forEach((item, index) => (resText += this.$store.state.factoryList.filter(v => v.id === item)[0]?.stationName + (index === factoryList.length - 1 ? '' : ',')));
      return resText;
    }
  }
};
