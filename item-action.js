/*global rll*/
var game = game || {};

game.ItemActionList = function() {
  rll.ChooseList.call(this, 8);
};
game.ItemActionList.inherit(rll.ChooseList);

game.ItemActionList.prototype.execute = function() {
  this._items[this._cursor].execute();
};

game.UseItem = function(name, thisGame) {
  this._game = thisGame;
  this._player = thisGame.player();
  this._name = name;
};

game.UseItem.prototype.name = function() { return this._name; };

game.UseItem.prototype.execute = function() {
  this._player.useItem(this._game);
  this._game.nextTurn();
};

game.Drop = function(name, thisGame) {
  this._game = thisGame;
  this._player = thisGame.player();
  this._stage = thisGame.stage();
  this._name = name;
};

game.Drop.prototype.name = function() { return this._name; };

game.Drop.prototype.execute = function() {
  var point = this._dropPoint(),
      item;
  if (point === null) {
    this._game.message('捨てる場所が無い。');
    return;
  }
  item = this._player.removeSelectedItem();
  this._stage.putItem(item, point);
  this._game.message(item.name() + 'を捨てた。');
  this._game.nextTurn();
};

game.Drop.prototype._dropPoint = function() {
  var here = this._player.point();
  if (this._stage.item(here) === undefined) return here;
  var points = this._player.aroundPoints();
  points = points.filter(function(p) {
    if (this.walkableAt(p) === false) return false;
    if (this.item(p)) return false;
    return true;
  }, this._stage);
  if (points.isEmpty()) return null;
  return points[0];
};

game.ChangeScene = function(name, newScene) {
  this._newScene = newScene;
  this._name = name;
};

game.ChangeScene.prototype.name = function() { return this._name;};
game.ChangeScene.prototype.execute = function() {
  this._newScene.execute();
};


