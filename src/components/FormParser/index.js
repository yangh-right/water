import render from './antv-render/render';
import Parser from './antv-parser/Parser';

Parser.install = function(app) {
  app.component(Parser.name, Parser);
};

export { render };

export default Parser;
