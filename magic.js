/*global rll*/
var game = game || {};
game.CureLightWounds = function(thisGame) {
  this._game = thisGame;
  this._player = thisGame.player();
};

game.CureLightWounds.prototype.dice = new rll.Dice('1d6+1');

game.CureLightWounds.prototype.apply = function() {
  var point = this.dice.roll();
  this._player.heal(point);
  this._game.message(point+'ポイント回復した!');
};

game.potion = {};
game.potion.CureLightWounds = new rll.Potion('軽傷治癒の水薬', game.CureLightWounds, '#66f');
