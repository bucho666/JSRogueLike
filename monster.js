/*global rll*/
var game = game || {};

game.MonsterList = function(level) {
  this._level = level;
};

game.MonsterList.prototype.table = [{
  type      : rll.Humanoid,
  name      :'オーク',
  glyph     :'o',   color     :'#0f0',
  hitDice   :'1d8', damage    :'1d6',
  armorClass:6
}, {
  type      : rll.Humanoid,
  name      :'ゴブリン',
  glyph     :'g',   color     :'#66f',
  hitDice   :'1d8', damage    :'1d6',
  armorClass:6
}, {
  type      : rll.Monster,
  name      :'スケルトン',
  glyph     :'s',   color     :'#ccc',
  hitDice   :'1d8', damage    :'1d6',
  armorClass:7
}, {
  type      : rll.Monster,
  name      :'大ねずみ',
  glyph     :'r',   color     :'#820',
  hitDice   :'1d4', damage    :'1d3',
  armorClass:7
}, {
  type      : rll.Humanoid,
  name      :'ノール',
  glyph     :'h',   color:'#c80',
  hitDice   :'2d8', damage:'1d7+1',
  armorClass:5
}, {
  type      : rll.Humanoid,
  name      :'リザードマン',
  glyph     :'l',     color:'#0c0',
  hitDice   :'2d8+1', damage:'1d6+1',
  armorClass:5
}, {
  type      : rll.Monster,
  name      :'オオカミ',
  glyph     :'d',     color:'#aaa',
  hitDice   :'2d8', damage:'1d6',
  armorClass:5
}
];

game.MonsterList.prototype.getAtRandom = function() {
  var list = this.table.filter(function(monster) {
    var hitDice = new rll.Dice(monster.hitDice);
    return this._level >= hitDice.number();
  }, this);
  var m = list.choiceAtRandom();
  return new m.type(m);
};
