export default {
  options(h, conf, key) {
    const list = [];
    conf.__slot__.options.forEach(item => {
      if (conf.__config__.optionType === "button") {
        list.push(
          <w-radio-button value={item.value}>{item.label}</w-radio-button>
        );
      } else {
        list.push(<w-radio value={item.value}>{item.label}</w-radio>);
      }
    });
    return list;
  }
};
