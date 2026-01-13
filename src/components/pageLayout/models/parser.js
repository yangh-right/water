export default {
  functional: true,
  render(h, c) {
    return c.props.scopedSlot(c.props.data);
  },
};
