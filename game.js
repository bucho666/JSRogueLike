/*global rll, document, ROT*/
var game = game || {};

game.keyEvent = new rll.KeyEvent();

game.Game = function() {
  this._display = new rll.Display();
  this._player  = new rll.Player(new rll.Character('@', '#fff'), 'player');
  this._sight   = new rll.Sight(this._player, new rll.Size(80, 21));
  this._stage   = new rll.Stage(new rll.Size(80, 21), 0);
  this._messages = new rll.Messages();
};

game.Game.prototype._dirKey = {};
game.Game.prototype._dirKey[rll.key.H] = rll.Direction.W;
game.Game.prototype._dirKey[rll.key.L] = rll.Direction.E;
game.Game.prototype._dirKey[rll.key.K] = rll.Direction.N;
game.Game.prototype._dirKey[rll.key.J] = rll.Direction.S;
game.Game.prototype._dirKey[rll.key.Y] = rll.Direction.NW;
game.Game.prototype._dirKey[rll.key.U] = rll.Direction.NE;
game.Game.prototype._dirKey[rll.key.B] = rll.Direction.SW;
game.Game.prototype._dirKey[rll.key.N] = rll.Direction.SE;
game.Game.prototype._dirKey[rll.key.PERIOD] = rll.Direction.HERE;

game.Game.prototype._dirKey[rll.key.NUMPAD4] = rll.Direction.W;
game.Game.prototype._dirKey[rll.key.NUMPAD6] = rll.Direction.E;
game.Game.prototype._dirKey[rll.key.NUMPAD8] = rll.Direction.N;
game.Game.prototype._dirKey[rll.key.NUMPAD2] = rll.Direction.S;
game.Game.prototype._dirKey[rll.key.NUMPAD7] = rll.Direction.NW;
game.Game.prototype._dirKey[rll.key.NUMPAD9] = rll.Direction.NE;
game.Game.prototype._dirKey[rll.key.NUMPAD1] = rll.Direction.SW;
game.Game.prototype._dirKey[rll.key.NUMPAD3] = rll.Direction.SE;
game.Game.prototype._dirKey[rll.key.NUMPAD5] = rll.Direction.HERE;

game.Game.prototype.stage = function() {
  return this._stage;
};

game.Game.prototype.player = function() {
  return this._player;
};

game.Game.prototype.run = function() {
  this._display.initialize();
  document.body.appendChild(this._display.getCanvas());
  game.keyEvent.set(this);
  this.newLevel();
  this.draw();
};

game.Game.prototype.newLevel = function() {
  this._sight.clear();
  var newFloor = this._stage.floor() + 1;
  this._stage = new rll.Stage(new rll.Size(80, 21), newFloor);
  var digger = new ROT.Map.Digger(79, 20);
  var callBack = function(x, y, value) {
    if (value) { return; }
    this._stage.setTerrain(rll.Terrain.FLOOR, new rll.Point(x, y));
  };
  digger.create(callBack.bind(this));
  this._stage.setTerrain(rll.Terrain.DOWN_STAIRS,
      this._stage.randomWalkablePoint());
  this._player.setPoint(this._stage.randomWalkablePoint());
  this._stage.addActor(this._player);
  var monsterNum = 2 + parseInt(this._stage.floor() / 3);
  for (var i=0; i<monsterNum; i++) {
    var m;
    switch(rll.random(0, 5)) {
    case 0:
      m = new rll.Monster({
        name      :'オーク',
        glyph     :'o',
        color     :'#0f0',
        hitDice   :'1d8',
        damage    :'1d6',
        armorClass:6,
      });
      break;
    case 1:
      m = new rll.Monster({
        name      :'ゴブリン',
        glyph     :'g',
        color     :'#66f',
        hitDice   :'1d8',
        damage    :'1d6',
        armorClass:6,
      });
      break;
    case 2:
      m = new rll.Monster({
        name      :'スケルトン',
        glyph     :'s',
        color     :'#ccc',
        hitDice   :'1d8',
        damage    :'1d6',
        armorClass:7,
      });
      break;
    default:
      m = new rll.Monster({
        name      :'大ねずみ',
        glyph     :'r',
        color     :'#820',
        hitDice   :'1d4',
        damage    :'1d3',
        armorClass:7,
      });
    }
    m.setPoint(this._stage.randomWalkablePoint());
    m.setAction(new rll.AI(this));
    this._stage.addActor(m);
  }
};

game.Game.prototype.draw = function() {
  this._sight.draw(this._player.point(), this._stage, this._display);
  this._player.drawStatusLine(this._display, new rll.Point(0, 21));
  this._display.write(new rll.Point(71, 21), 'floor:'+this._stage.floor());
  this._messages.draw(this._display);
  if (this._messages.isEmpty() === false) {
    (new game.More(this._messages, this._display)).execute();
  }
};

game.Game.prototype.message = function(message) {
  this._messages.add(message);
};

game.Game.prototype.handleEvent = function(e) {
  if (this._player.isDead()) return;
  var key = e.keyCode,
      onShift = e.shiftKey;
  if (onShift && key === rll.key.PERIOD) {
    if (this._stage.downableAt(this._player.point())) {
      this.newLevel();
    }
  } else if (key in this._dirKey) {
    if (this.movePlayer(this._player, this._dirKey[key])) {
      this.actorsAction();
    }
  } else {
    return;
  }
  this.draw();
};

game.Game.prototype.actorsAction = function() {
  this._stage.forEachActor(function(actor){
    actor.action();
  });
};

game.Game.prototype.movePlayer = function(actor, direction) {
  if (direction.equal(rll.Direction.HERE)) return true;
  var to = actor.movedPoint(direction);
  var monster = this._stage.findActor(to);
  if (monster) {
    this.attackToMonster(monster);
    return true;
  }
  if (this._stage.walkableAt(actor.movedPoint(direction)) === false) {
    return false;
  }
  actor.move(direction);
  return true;
};

game.Game.prototype.attackToMonster = function(monster) {
  var attack = new game.MeleeAttack(this._player, monster);
  if (attack.isHit() === false) {
    this.message(monster.name() + 'にかわされた!');
    return;
  }
  var damage = attack.damage();
  this.message(monster.name() + 'に命中' + damage + 'のダメージ!');
  if (monster.isDead() === false) return;
  this.message(monster.name() + 'をたおした!!');
  this._stage.removeActor(monster);
};

game.MeleeAttack = function(attaker, defender) {
  this._attaker = attaker;
  this._defender = defender;
};

game.MeleeAttack.prototype.isHit = function() {
  var rolls = rll.random(1, 20);
  if (rolls === 20) return true;
  if (rolls === 1 ) return false;
  return rolls < (this._defender.armorClass() + this._attaker.toHit());
};

game.MeleeAttack.prototype.damage = function() {
  var damagePoint = this._attaker.attackDamage();
  this._defender.damage(damagePoint);
  return damagePoint;
};

game.More = function(messages, display) {
  this._messages = messages;
  this._display = display;
  this._beforeEvent = game.keyEvent.current();
};

game.More.prototype.execute = function() {
  game.keyEvent.set(this);
};

game.More.prototype.handleEvent = function(e) {
  if (e.keyCode != rll.key.SPACE) return;
  this._messages.draw(this._display);
  if (this._messages.isEmpty()) {
    game.keyEvent.set(this._beforeEvent);
  }
};

(function() {
  var newGame = new game.Game();
  newGame.run();
})();
