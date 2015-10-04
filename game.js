/*global rll, document*/
var game = game || {};

game.keyEvent = new rll.KeyEvent();

game.DIRECITON_KEY = {};
game.DIRECITON_KEY[rll.key.H] = rll.Direction.W;
game.DIRECITON_KEY[rll.key.L] = rll.Direction.E;
game.DIRECITON_KEY[rll.key.K] = rll.Direction.N;
game.DIRECITON_KEY[rll.key.J] = rll.Direction.S;
game.DIRECITON_KEY[rll.key.Y] = rll.Direction.NW;
game.DIRECITON_KEY[rll.key.U] = rll.Direction.NE;
game.DIRECITON_KEY[rll.key.B] = rll.Direction.SW;
game.DIRECITON_KEY[rll.key.N] = rll.Direction.SE;
game.DIRECITON_KEY[rll.key.PERIOD] = rll.Direction.HERE;

game.DIRECITON_KEY[rll.key.NUMPAD4] = rll.Direction.W;
game.DIRECITON_KEY[rll.key.NUMPAD6] = rll.Direction.E;
game.DIRECITON_KEY[rll.key.NUMPAD8] = rll.Direction.N;
game.DIRECITON_KEY[rll.key.NUMPAD2] = rll.Direction.S;
game.DIRECITON_KEY[rll.key.NUMPAD7] = rll.Direction.NW;
game.DIRECITON_KEY[rll.key.NUMPAD9] = rll.Direction.NE;
game.DIRECITON_KEY[rll.key.NUMPAD1] = rll.Direction.SW;
game.DIRECITON_KEY[rll.key.NUMPAD3] = rll.Direction.SE;
game.DIRECITON_KEY[rll.key.NUMPAD5] = rll.Direction.HERE;

game.DIRECITON_KEY[rll.key.LEFT] = rll.Direction.W;
game.DIRECITON_KEY[rll.key.RIGHT] = rll.Direction.E;
game.DIRECITON_KEY[rll.key.UP] = rll.Direction.N;
game.DIRECITON_KEY[rll.key.DOWN] = rll.Direction.S;

game.Game = function() {
  this._display = new rll.Display();
  this._player  = new rll.Player(new rll.Character('@', '#fff', '#000'), 'player');
  this._stage   = new rll.Stage(new rll.Size(80, 21), 0);
  this._messages = new rll.Messages();
};

game.Game.prototype.stage = function() {
  return this._stage;
};

game.Game.prototype.player = function() {
  return this._player;
};

game.Game.prototype.display = function() {
  return this._display;
};

game.Game.prototype.messages = function() {
  return this._messages;
};

game.Game.prototype.message = function(message) {
  this._messages.add(message);
};

game.Game.prototype.run = function() {
  this._display.initialize();
  document.body.appendChild(this._display.getCanvas());
  (new game.Dungeon(this)).execute();
};

game.Game.prototype.newLevel = function() {
  this._stage = (new game.LevelFactory(this)).create(this._stage.floor() + 1);
};

(function() {
  var newGame = new game.Game();
  newGame.run();
})();
