/*global rll*/
var game = game || {};

game.CureLightWounds = function(thisGame) {
  this._game = thisGame;
};
game.CureLightWounds.prototype.dice = new rll.Dice('1d6+1');
game.CureLightWounds.prototype.apply = function(target) {
  var point = this.dice.roll();
  target.heal(point);
  this._game.message(point+'ポイント回復した!');
};

game.CureSeriousWounds = function(thisGame) {
  game.CureLightWounds.call(this, thisGame);
};
game.CureSeriousWounds.inherit(game.CureLightWounds);
game.CureSeriousWounds.prototype.dice = new rll.Dice('2d8+1');

game.MagicMissile = function(thisGame) {
  this._game = thisGame;
  this._player = thisGame.player();
  this._stage = thisGame.stage();
};
game.MagicMissile.prototype.dice = new rll.Dice('1d6+1');
game.MagicMissile.prototype.apply = function(target) {
  this._game.damageToMonster(target, this.dice.roll());
};
