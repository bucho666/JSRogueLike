/*global rll, document, inherit*/
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

game.LevelFactory = function(thisGame) {
  this._game = thisGame;
  this._stage = null;
  this._player = thisGame.player();
};

game.LevelFactory.prototype.create = function(floor) {
  var mapSize = new rll.Size(80, 21),
      generator = new rll.Generator(mapSize),
      doorTerrain;
  this._stage = new rll.Stage(mapSize, floor);
  generator.generate();
  generator.forEachInsideRoom(function(point) {
    this.setTerrain(rll.Terrain.FLOOR, point);
  }, this._stage);
  generator.forEachDoor(function(point) {
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
  this._stage.addActor(this._player);
  generator.forEachRoom(function(room) {
    this.makeRoom(room);
  }, this);
  return this._stage;
};

game.LevelFactory.prototype.makeRoom = function(room) {
  var dice = new rll.Dice('1d6');
  var roll = dice.roll();
  if (roll === 3) {
    dice = new rll.Dice('1d3');
  } else if (roll >= 4) {
    this.putMonster(room);
    dice = new rll.Dice('1d2');
  }
  if (dice.roll() === 1) {
    this.putTreasure(room);
  }
};

game.LevelFactory.prototype.putMonster = function(room) { // TODO class化
  var max = 1 + parseInt(this._stage.floor() / 3);
  var monsterNum = rll.random(1, max);
  var monsterList = new game.MonsterList(1+Math.floor(this._stage.floor() / 6));
  for (var i=0; i<monsterNum; i++) {
    var m = monsterList.getAtRandom();
    m.setPoint(room.insidePointAtRandom());
    m.setAction(new game.AI(this._game));
    this._stage.addActor(m);
  }
};

game.LevelFactory.prototype.putTreasure = function(room) { // TODO class化
  if (rll.random(1, 6) === 1) {
    var potion = game.potion.CureLightWounds;
    this._stage.putItem(potion, room.insidePointAtRandom());
  } else {
    var diceNum = (Math.floor(this._stage.floor() / 5) + 1) * 6;
    this._stage.putItem(new rll.Money(Math.floor((new rll.Dice('1d'+diceNum)).roll() * 100)),
    room.insidePointAtRandom());
  }
};

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

game.Scene = function() {
  this._beforeScene = game.keyEvent.current();
};

game.Scene.prototype.execute = function() {
  this.initialize();
  game.keyEvent.set(this);
};

game.Scene.prototype.initialize = function() {
  this.draw();
};

game.Scene.prototype.draw = function() {};

game.Scene.prototype.end = function() {
  game.keyEvent.set(this._beforeScene);
  this._beforeScene.draw();
};

game.Scene.prototype.handleEvent = function(e) {
  if (e.keyCode === rll.key.ESCAPE) {
    this.end();
  }
};

game.Dungeon = function(thisGame) {
  game.Scene.call(this);
  this._game = thisGame;
  this._sight = new rll.Sight(new rll.Size(80, 21));
  this._player = thisGame.player();
  this._stage = thisGame.stage();
  this._display = thisGame.display();
  this._messages = thisGame.messages();
};
inherit(game.Dungeon, game.Scene);

game.Dungeon.prototype.initialize = function() {
  this.newLevel();
  this._player.getItem(game.potion.CureLightWounds);
  this._player.getItem(game.potion.CureLightWounds);
  this.draw();
};

game.Dungeon.prototype.newLevel = function() {
  this._sight.clear();
  this._game.newLevel();
  this._stage = this._game.stage();
};

game.Dungeon.prototype.draw = function() {
  this._sight.scan(this._player.point(), this._stage);
  this._sight.draw(this._display, this._stage);
  this._player.drawStatusLine(this._display, new rll.Point(0, 21));
  this._display.write(new rll.Point(71, 21), 'floor:'+this._stage.floor());
  this._messages.draw(this._display);
  if (this._messages.isEmpty() === false) {
    (new game.More(this._messages, this._display)).execute();
  }
};

game.Dungeon.prototype.message = function(message) {
  this._messages.add(message);
};

game.Dungeon.prototype.handleEvent = function(e) {
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
      this._stage.actorsAction();
    }
  } else if (key === rll.key.I) {
    if (this._player.hasItem()) {
      (new game.ChooseItem(this._game)).execute();
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
          this._stage.actorsAction();
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

game.Dungeon.prototype.movePlayer = function(direction) {
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

game.Dungeon.prototype._autoPickup = function() {
  var item = this._stage.pickupItem(this._player.point());
  if (item === undefined) return false;
  if (item.isMoney()) {
    return this._pickupMoney(item);
  }
  if (this._player.itemIsFull()) {
    this.message('これ以上持てない!');
    this._stage.putItem(item, this._player.point());
    return true;
  }
  // TODO アイテムを捨てる機能を実装
  this.message(item.name()+'を手に入れた。');
  this._player.getItem(item);
  return true;
};

game.Dungeon.prototype._pickupMoney = function(money) {
  this._player.getMoney(money);
  this.message('銀貨を'+money.value()+'枚手に入れた。');
  if ( this._player.expIsFull()) {
    this._player.levelUp();
    this.message('レベル' + this._player.level() + 'へようこそ!!');
  }
  return true;
};

game.Dungeon.prototype.runPlayer = function(direction) {
  if (direction.equal(rll.Direction.HERE)) return true;
  var runner = new rll.Runner(this._player, direction, this._stage);
  while (true) {
    if (runner.inFrontDoor()) break;
    if (this._sight.inMonster(this._stage, this._player)) break;
    if (this.movePlayer(direction) === false) break;
    this._stage.actorsAction();
    this._sight.scan(this._player.point(), this._stage);
    if (this._autoPickup()) break;
    if (this._stage.downableAt(this._player.point())) break;
    if (runner.mustStop()) break;
    direction = runner.direction();
  }
};

game.Dungeon.prototype.attackToMonster = function(monster) {
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
  game.Scene.call(this);
  this._action = action;
};
inherit(game.chooseDirection, game.Scene);

game.chooseDirection.prototype.handleEvent = function(e) {
  var key = e.keyCode, direction;
  direction = game.DIRECITON_KEY[key];
  if (direction === undefined) return;
  this._action(direction);
  this.end();
};

game.More = function(messages, display) {
  game.Scene.call(this);
  this._messages = messages;
  this._display = display;
};
inherit(game.More, game.Scene);

game.More.prototype.handleEvent = function(e) {
  if (e.keyCode != rll.key.SPACE) return;
  this._messages.draw(this._display);
  if (this._messages.isEmpty()) {
    this.end();
  }
};

game.More.prototype.end = function() {
  game.keyEvent.set(this._beforeScene);
};

game.ChooseItem = function(thisGame) {
  game.Scene.call(this);
  this._game = thisGame;
  this._player = thisGame.player();
  this._stage = thisGame.stage();
};
inherit(game.ChooseItem, game.Scene);

game.ChooseItem.prototype.draw = function() {
  this._player.drawItemList(this._game.display());
};

game.ChooseItem.prototype.handleEvent = function(e) {
  var key = e.keyCode;
  if (key == rll.key.ESCAPE) {
    this.end();
    return;
  } else if (key == rll.key.RETURN) {
    this._player.useItem(this._game);
    this._stage.actorsAction();
    this.end();
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
