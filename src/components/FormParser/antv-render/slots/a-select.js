export default {
  options(h, conf, key) {
    const list = [];
    const { dataLabel = 'label', dataValue = 'value' } = conf.__config__;
    conf.__slot__.options.forEach((item) => {
      list.push(
        <w-select-option value={item[dataValue]} disabled={item.disabled}>
          {item[dataLabel]}
        </w-select-option>
      );
    });
    return list;
  }
};
