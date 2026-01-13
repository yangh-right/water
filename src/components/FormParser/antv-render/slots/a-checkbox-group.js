export default {
  options(h, conf, key) {
    const list = [];
    conf.__slot__.options.forEach(item => {
      list.push(
        <w-checkbox value={item.value} border={conf.border}>
          {item.label}
        </w-checkbox>
      );
    });
    return list;
  }
};
