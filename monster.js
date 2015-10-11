/*global rll*/
var game = game || {};

game.Monster = function(data) {
  this._data = data;
};

game.Monster.prototype.level = function() {
  return this._data.level;
};

game.Monster.prototype.create = function() {
  return new this._data.type(this._data);
};

game.Monster.table = new rll.Table();
game.Monster.table.setTable(0, [
    new game.Monster({
      type      : rll.Monster,
      name      :'大ねずみ',
      glyph     :'r',   color     :'#820',
      hitDice   :'1d4', damage    :'1d3',
      armorClass:7
    })
  ]);
game.Monster.table.setTable(1, [
    new game.Monster({
      type      : rll.Humanoid,
      name      :'コボルト',
      glyph     :'k',   color     :'#0a0',
      hitDice   :'1d4', damage    :'1d5',
      armorClass:7
    })
  ]);
game.Monster.table.setTable(2, [
    new game.Monster({
      type      : rll.Monster,
      name      :'スケルトン',
      glyph     :'s',   color     :'#ccc',
      hitDice   :'1d8', damage    :'1d6',
      armorClass:7
    }),
  ]);
game.Monster.table.setTable(3, [
    new game.Monster({
      type      : rll.Humanoid,
      name      :'オーク',
      glyph     :'o',   color     :'#0f0',
      hitDice   :'1d8', damage    :'1d6',
      armorClass:6
    }),
    new game.Monster({
      type      : rll.Humanoid,
      name      :'ゴブリン',
      glyph     :'g',   color     :'#66f',
      hitDice   :'1d8', damage    :'1d6',
      armorClass:6
    })
  ]);
game.Monster.table.setTable(4, [
    new game.Monster({
      type      : rll.Monster,
      name      :'オオカミ',
      glyph     :'d',     color:'#aaa',
      hitDice   :'2d8', damage:'1d6',
      armorClass:5
    })
  ]);
game.Monster.table.setTable(5, [
    new game.Monster({
      type      : rll.Humanoid,
      name      :'ノール',
      glyph     :'h',   color:'#c80',
      hitDice   :'2d8', damage:'1d7+1',
      armorClass:5
    }),
    new game.Monster({
      type      : rll.Humanoid,
      name      :'リザードマン',
      glyph     :'l',     color:'#0c0',
      hitDice   :'2d8+1', damage:'1d6+1',
      armorClass:5
    })
  ]);
game.Monster.table.setTable(7, [
    new game.Monster({
      type      : rll.Humanoid,
      name      :'ミノタウロス',
      glyph     :'M',   color:'#f80',
      hitDice   :'6d8', damage:'2d6+2',
      armorClass:5
    })
  ]);
