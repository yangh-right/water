export default {
  prepend(h, conf, key) {
    return <template slot="addonBefore">{conf.__slot__[key]}</template>;
  },
  append(h, conf, key) {
    return <template slot="addonAfter">{conf.__slot__[key]}</template>;
  },
  suffix(h, conf, key) {
    return <template slot="suffix">{conf.__slot__[key]}</template>;
  },
};
