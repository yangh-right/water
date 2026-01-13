import CustomTooltip from './CustomTooltip';

CustomTooltip.install = function(app) {
  app.component(CustomTooltip.name, CustomTooltip);
};

export default CustomTooltip;
