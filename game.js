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
  if (this.lookable(actor, playerPoint)) {
    this._lastDest = playerPoint;
    this.chase(actor, playerPoint);
  } else if (this._lastDest) {
    this.chase(actor, this._lastDest);
  } else {
    this.randomMove(actor);
  }
};

game.AI.prototype.attackToPlayer = function(actor, player) {
  var attack = new game.MeleeAttack(actor, player);
  if (attack.isHit() === false) {
    this._game.message(actor.name() + 'の攻撃をかわした!');
    return;
  }
  var damage = attack.damage();
  this._game.message(actor.name() + 'の攻撃が命中' + damage + 'のダメージ!!');
  if (player.isDead() === false) return;
  this._game.message('あなたは死んだ…');
};

game.AI.prototype.lookable = function(actor, point) {
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
    if (stage.closedDoorAt(to) && actor.openableDoor()) {
      stage.openDoorAt(to);
    } else if (stage.walkableAt(to)) {
      actor.move(dir);
      return;
    }
  }
};

game.AI.prototype.randomMove = function(actor) {
  var stage = this._game.stage(),
      directions = [], i, dir, to;
  for (i=0; i<rll.Direction.AROUND.length; i++) {
    dir = rll.Direction.AROUND[i];
    to = actor.movedPoint(dir);
    if (stage.walkableAt(to) || stage.closedDoorAt(to)) {
      directions.push(dir);
    }
  }
  if (directions.isEmpty()) return;
  dir = directions.choiceAtRandom();
  to = actor.movedPoint(dir);
  if (stage.closedDoorAt(to) && actor.openableDoor()) {
    stage.openDoorAt(to);
  } else if (stage.walkableAt(to)) {
    actor.move(dir);
  }
};

game.Game = function() {
  this._display = new rll.Display();
  this._player  = new rll.Player(new rll.Character('@', '#fff', '#000'), 'player');
  this._sight   = new rll.Sight(this._player, new rll.Size(80, 21));
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
  var i;
  this._stage = new rll.Stage(mapSize, newFloor);
  var generator = new rll.Generator(mapSize);
  generator.generate();
  generator.forEachInsideRoom(function(point) {
    this.setTerrain(rll.Terrain.FLOOR, point);
  }, this._stage);
  generator.forEachDoor(function(point) {
    var doorTerrain;
    switch(rll.random(1, 6)) {
      case 1:
        doorTerrain = rll.Terrain.FLOOR;
        break;
      case 2:
        doorTerrain = rll.Terrain.OPENED_DOOR;
        break;
      default:
        doorTerrain = rll.Terrain.CLOSED_DOOR;
        break;
    }
    this.setTerrain(doorTerrain, point);
  }, this._stage);
  generator.forEachCorridor(function(point) {
    this.setTerrain(rll.Terrain.FLOOR, point);
  }, this._stage);
  this._stage.setTerrain(rll.Terrain.DOWN_STAIRS,
      generator.roomInsidePointAtRandom());
  this._player.setPoint(generator.roomInsidePointAtRandom());
  var potion = new rll.Potion('軽傷治癒の水薬', game.CureLightWounds, '#66f');
  this._player.getItem(potion);
  this._player.getItem(potion);
  generator.forEachRoom(function(room) {
    if (rll.cointoss()) return;
    var diceNum = (Math.floor(this.floor() / 5) + 1) * 6;
    this.putItem(room.insidePointAtRandom(),
      new rll.Money(Math.floor((new rll.Dice('1d'+diceNum)).roll() * 100 / 2)));
    this.putItem(room.insidePointAtRandom(), potion);
  }, this._stage);
  this._stage.addActor(this._player);
  var monsterNum = 2 + parseInt(this._stage.floor() / 3);
  var monsterList = new game.MonsterList(1+Math.floor(this._stage.floor() / 6));
  for (i=0; i<monsterNum; i++) {
    var m = monsterList.getAtRandom();
    m.setPoint(this._stage.randomWalkablePoint());
    m.setAction(new game.AI(this));
    this._stage.addActor(m);
  }
};

game.Game.prototype.draw = function() {
  this._sight.scan(this._player.point(), this._stage);
  this._sight.draw(this._display, this._stage);
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
  } else if (key in game.DIRECITON_KEY) {
    if (onShift) {
      this.runPlayer(game.DIRECITON_KEY[key]);
    } else if (this.movePlayer(game.DIRECITON_KEY[key])) {
      this._autoPickup();
      this.actorsAction();
    }
  } else if (key === rll.key.I) {
    if (this._player.hasItem()) {
      (new game.ChooseItem(this)).execute();
      return;
    }
    this.message('何も持っていない。');
  } else if (key === rll.key.C) {
      this.message('ドアを閉める: 方向?');
      (new game.chooseDirection(function(direction){
        var to = this._player.movedPoint(direction),
            actor = this._stage.findActor(to);
        if (actor) {
          this.message(actor.name() + 'がいる!');
        } else if (this._stage.openedDoorAt(to)) {
          this._stage.closeDoorAt(to);
          this.actorsAction();
        } else {
          this.message('その方向に閉められるドアは無い。');
        }
        this.draw();
      }.bind(this))).execute();
  } else if (key === rll.key.A && onShift) {
    this._player.levelUp();
  } else if (key === rll.key.Z && onShift) {
    this.newLevel();
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

game.Game.prototype.movePlayer = function(direction) {
  if (direction.equal(rll.Direction.HERE)) return true;
  var to = this._player.movedPoint(direction),
      monster = this._stage.findActor(to);
  if (this._stage.closedDoorAt(to)) {
    this._stage.openDoorAt(to);
    return true;
  }
  if (monster) {
    this.attackToMonster(monster);
    return true;
  }
  if (this._stage.walkableAt(this._player.movedPoint(direction)) === false) {
    return false;
  }
  this._player.move(direction);
  return true;
};

game.Game.prototype._autoPickup = function() {
  var item = this._stage.pickupItem(this._player.point());
  if (item === undefined) return false;
  if (item.isMoney()) {
    return this._pickupMoney(item);
  }
  this.message(item.name()+'を手に入れた。');
  this._player.getItem(item);
  return true;
};

game.Game.prototype._pickupMoney = function(money) {
  this._player.getMoney(money);
  this.message('銀貨を'+money.value()+'枚手に入れた。');
  if ( this._player.expIsFull()) {
    this._player.levelUp();
    this.message('レベル' + this._player.level() + 'へようこそ!!');
  }
  return true;
};

game.Runner = function(actor, direction, stage) {
  this._actor = actor;
  this._stage = stage;
  this._direction = direction;
  var leftPoint = this._actor.leftPoint(this._direction),
      rightPoint = this._actor.rightPoint(this._direction);
  this._leftWalkable = this.walkableAt(direction.add(leftPoint));
  this._rightWalkable = this.walkableAt(direction.add(rightPoint));
};

game.Runner.prototype.inFrontDoor = function() {
  var forward = this._direction.add(this._actor.point());
  return this._stage.closedDoorAt(forward);
};

game.Runner.prototype.direction = function() {
  return this._direction;
};

game.Runner.prototype.inCorrier = function() {
  return (this._leftWalkable === false && this._rightWalkable === false);
};

game.Runner.prototype.runnableStraight = function() {
  var forward = this._direction.add(this._actor.point());
  return this.walkableAt(forward);
};

game.Runner.prototype.onBranch = function() {
  var leftPoint = this._actor.leftPoint(this._direction),
      rightPoint = this._actor.rightPoint(this._direction);
  if (this.walkableAt(leftPoint) !== this._leftWalkable) return true;
  if (this.walkableAt(rightPoint) !== this._rightWalkable) return true;
  return false;
};

game.Runner.prototype.walkableAt = function(point) {
  if (this._stage.closedDoorAt(point)) return true;
  return this._stage.walkableAt(point);
};

game.Runner.prototype.mustStop = function() {
  if (this.inCorrier() === false) return this.onBranch();
  if (this.runnableStraight()) return this.onBranch();
  return this._turn();
};

game.Runner.prototype._turn = function() {
  var forward = this._direction.add(this._actor.point()),
      cross = rll.Direction.CROSS,
      side;
  if (this._stage.walkableAt(forward) === false) {
    side = [cross.next(this._direction, 1), cross.prev(this._direction, 1),];
    side = side.filter(function(direction) {
      return this._stage.walkableAt(direction.add(this._actor.point()));
    }, this);
    if (side.length !== 1) return true;
    this._direction = side[0];
  }
  return false;
};

game.Game.prototype.runPlayer = function(direction) {
  if (direction.equal(rll.Direction.HERE)) return true;
  var runner = new game.Runner(this._player, direction, this._stage);
  while (true) {
    if (runner.inFrontDoor()) break;
    if (this._sight.inMonster(this._stage, this._player)) break;
    if (this.movePlayer(direction) === false) break;
    this.actorsAction();
    this._sight.scan(this._player.point(), this._stage);
    if (this._autoPickup()) break;
    if (this._stage.downableAt(this._player.point())) break;
    if (runner.mustStop()) break;
    direction = runner.direction();
  }
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
  this._player.getExp(monster.exp());
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
  return rolls <= (this._defender.armorClass() + this._attaker.toHit());
};

game.MeleeAttack.prototype.damage = function() {
  var damagePoint = this._attaker.attackDamage();
  this._defender.damage(damagePoint);
  return damagePoint;
};

game.chooseDirection = function(action) {
  this._action = action;
  this._beforeEvent = game.keyEvent.current();
};

game.chooseDirection.prototype.execute = function() {
  game.keyEvent.set(this);
};

game.chooseDirection.prototype.handleEvent = function(e) {
  var key = e.keyCode, direction;
  direction = game.DIRECITON_KEY[key];
  if (direction === undefined) return;
  this._action(direction);
  game.keyEvent.set(this._beforeEvent);
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
  this._messages.draw(this._display); if (this._messages.isEmpty()) {
    game.keyEvent.set(this._beforeEvent);
  }
};

// TODO Sceneクラス検討

game.ChooseItem = function(thisGame) {
  this._game = thisGame;
  this._player = thisGame.player();
  this._beforeEvent = game.keyEvent.current();
};

game.ChooseItem.prototype.execute = function() {
  this.draw();
  game.keyEvent.set(this);
};

game.ChooseItem.prototype.handleEvent = function(e) {
  var key = e.keyCode;
  if (key == rll.key.ESCAPE) {
    this.cancel();
    return;
  } else if (key == rll.key.RETURN) {
    this._player.useItem(this._game);
    this._game.actorsAction();
    this.cancel();
    return;
  } else if (key in game.DIRECITON_KEY === false) {
    return;
  } else if (game.DIRECITON_KEY[key] === rll.Direction.S) {
    this._player.selectNextItem();
  } else if (game.DIRECITON_KEY[key] === rll.Direction.N) {
    this._player.selectPrevItem();
  } else {
    return;
  }
  this.draw();
};

game.ChooseItem.prototype.cancel = function() {
  this._beforeEvent.draw();
  game.keyEvent.set(this._beforeEvent);
};

game.ChooseItem.prototype.draw = function() {
  this._player.drawItemList(this._game.display());
};

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

(function() {
  var newGame = new game.Game();
  newGame.run();
})();
