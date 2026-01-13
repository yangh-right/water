import ColorPicker from './ColorPicker.vue';

ColorPicker.install = function(app) {
  app.component(ColorPicker.name, ColorPicker);
};

export default ColorPicker;
