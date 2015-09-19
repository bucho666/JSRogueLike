/*global rll, document*/
var game = game || {};

game.keyEvent = new rll.KeyEvent();

game.AI = function(game) {
  this._game = game;
  this._lastDest = null;
};

game.AI.prototype.compute = function(actor) {
  var player = this._game.player();
  var playerPoint = player.point();
  if (this._lastDest && actor.on(this._lastDest)) {
    this._lastDest = null;
  }
  if (actor.isNextTo(playerPoint) && player.isAlive()) {
    this.attackToPlayer(actor, player);
    return;
  }
  if (this.canSee(actor, playerPoint)) {
    this._lastDest = playerPoint;
    this.chase(actor, playerPoint);
  } else if (this._lastDest) {
    this.chase(actor, this._lastDest);
  } else {
    this.randomMove(actor);
  }
};

game.AI.prototype.attackToPlayer = function(actor, player) {
  var attack = new game.MeleeAttack(actor, player); // TODO game
  if (attack.isHit() === false) {
    this._game.message(actor.name() + 'の攻撃をかわした!');
    return;
  }
  var damage = attack.damage();
  this._game.message(actor.name() + 'の攻撃が命中' + damage + 'のダメージ!!');
  if (player.isDead() === false) return;
  this._game.message('あなたは死んだ…');
};

game.AI.prototype.canSee = function(actor, point) {
  var stage = this._game.stage();
  var line = actor.lineTo(point);
  for (var i=0; i<line.length; i++) {
    if (stage.passLight(line[i]) === false) {
      return false;
    }
  }
  return true;
};

game.AI.prototype.chase = function(actor, point) {
  var stage = this._game.stage();
  var directions = actor.directionsTo(point);
  for (var i=0; i<directions.length; i++) {
    var dir = directions[i];
    var to = actor.movedPoint(dir);
    if (stage.walkableAt(to)) {
      actor.move(dir);
      return;
    }
  }
};

game.AI.prototype.randomMove = function(actor) {
  var stage = this._game.stage();
  var directions = [];
  for (var i=0; i<rll.Direction.AROUND.length; i++) {
    var dir = rll.Direction.AROUND[i];
    if (stage.walkableAt(actor.movedPoint(dir))) {
      directions.push(dir);
    }
  }
  actor.move(directions.randomChoice());
};

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

game.Game.prototype._dirKey[rll.key.LEFT] = rll.Direction.W;
game.Game.prototype._dirKey[rll.key.RIGHT] = rll.Direction.E;
game.Game.prototype._dirKey[rll.key.UP] = rll.Direction.N;
game.Game.prototype._dirKey[rll.key.DOWN] = rll.Direction.S;

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
  var mapSize = new rll.Size(80, 21);
  this._stage = new rll.Stage(mapSize, newFloor);
  var generator = new rll.Generator(mapSize);
  generator.generate();
  generator.forEachInsideRoom(function(point) {
    this.setTerrain(rll.Terrain.FLOOR, point);
  }, this._stage);
  generator.forEachDoor(function(point) {
    this.setTerrain(rll.Terrain.OPEN_DOOR, point);
  }, this._stage);
  generator.forEachCorridor(function(point) {
    this.setTerrain(rll.Terrain.FLOOR, point);
  }, this._stage);
  // TODO 部屋の中
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
    m.setAction(new game.AI(this));
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
