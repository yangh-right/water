import Card from './chartsCard';

Card.install = function(app) {
  app.component(Card.name, Card);
};

export default Card;
