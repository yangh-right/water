import returnControl from './returnControl';

returnControl.install = function(app) {
  app.component(returnControl.name, returnControl);
};

export default returnControl;
