/*global rll*/
var game = game || {};

game.Scene = function() {
  this._beforeScene = game.keyEvent.current();
  this._rootScene = this.rootScene();
};

game.Scene.prototype.start = function() {
  game.keyEvent.set(this);
  this.initialize();
};

game.Scene.prototype.initialize = function() {
  this.draw();
};

game.Scene.prototype.draw = function() {};

game.Scene.prototype.drawBeforeScene = function() {
  this._beforeScene.draw(this._game.display());
};

game.Scene.prototype.back = function() {
  game.keyEvent.set(this._beforeScene);
  this._beforeScene.draw();
};

game.Scene.prototype.backToRoot = function() {
  game.keyEvent.set(this._rootScene);
  this._rootScene.draw();
};

game.Scene.prototype.rootScene = function() {
  var rootScene = this;
  while (rootScene._beforeScene) {
    rootScene = rootScene._beforeScene;
  }
  return rootScene;
};

game.Scene.prototype.handleEvent = function(e) {
  if (e.keyCode === rll.key.ESCAPE) {
    this.back();
  }
};

game.Dungeon = function(thisGame) {
  game.Scene.call(this);
  this._game = thisGame;
  this._player = thisGame.player();
  this._stage = thisGame.stage();
  this._display = thisGame.display();
  this._messages = thisGame.messages();
};
game.Dungeon.inherit(game.Scene);

game.Dungeon.prototype.initialize = function() {
  this.newLevel();
  var weapon = game.Weapon.table.choiceAtRandom(0);
  var armor = game.Armor.table.choiceAtRandom(0);
  var potion = game.Potion.table.choiceAtRandom(0);
  this._player.getItem(weapon);
  this._player.getItem(armor);
  this._player.getItem(game.Rod.table.choiceAtRandom(3).copy());
  this._player.getItem(potion);
  this._player.getItem(potion);
  this._player.equip(weapon);
  this._player.equip(armor);
  this.draw();
};

game.Dungeon.prototype.newLevel = function() {
  this._player.clearSight();
  this._game.newLevel();
  this._stage = this._game.stage();
};

game.Dungeon.prototype.draw = function() {
  this._player.scanSight(this._stage);
  this._player.drawSight(this._display, this._stage);
  this._player.drawStatusLine(this._display, new rll.Point(0, 21));
  this._display.write(new rll.Point(71, 21), 'floor:'+this._stage.floor());
  this._messages.draw(this._display);
  if (this._messages.isEmpty() === false) {
    (new game.More(this._messages, this._display)).start();
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
      this._game.nextTurn();
    }
  } else if (key === rll.key.G) {
    this.pickupItem();
  } else if (key === rll.key.I) {
    if (this._player.hasItem()) {
      (new game.ChooseItem(this._game)).start();
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
          this._game.nextTurn();
        } else {
          this.message('その方向に閉められるドアは無い。');
        }
        this.draw();
      }.bind(this))).start();
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
  this.message(item.name() + 'がある。');
  this._stage.putItem(item, this._player.point());
  return true;
};

game.Dungeon.prototype.pickupItem = function() {
  var item = this._stage.pickupItem(this._player.point());
  if (item === undefined) return false;
  if (this._player.itemIsFull()) {
    this.message(item.name() + 'これ以上持てない。');
    this._stage.putItem(item, this._player.point());
    return false;
  }
  this.message(item.name()+'を手に入れた。');
  this._player.getItem(item);
  return true;
};

game.Dungeon.prototype._pickupMoney = function(money) {
  this.message('銀貨を'+money.value()+'枚手に入れた。');
  this._game.getExp(money.value());
  return true;
};

game.Dungeon.prototype.runPlayer = function(direction) {
  if (direction.equal(rll.Direction.HERE)) return true;
  var runner = new rll.Runner(this._player, direction, this._stage);
  if (runner.inFrontDoor()) {
    this.movePlayer(direction);
    this._game.nextTurn();
    return true;
  }
  while (true) {
    if (runner.inFrontDoor()) break;
    if (this._player.isVisibleMonster(this._stage)) break;
    if (this.movePlayer(direction) === false) break;
    this._game.nextTurn();
    this._player.scanSight(this._stage);
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
  this._game.damageToMonster(monster, attack.damage());
};

game.chooseDirection = function(action) {
  game.Scene.call(this);
  this._action = action;
};
game.chooseDirection.inherit(game.Scene);

game.chooseDirection.prototype.handleEvent = function(e) {
  var key = e.keyCode, direction;
  direction = game.DIRECITON_KEY[key];
  if (direction === undefined) return;
  this._action(direction);
  this.back();
};

game.More = function(messages, display) {
  game.Scene.call(this);
  this._messages = messages;
  this._display = display;
};
game.More.inherit(game.Scene);

game.More.prototype.handleEvent = function() {
  this._messages.draw(this._display);
  if (this._messages.isEmpty()) {
    this.back();
  }
};

game.More.prototype.back = function() {
  game.keyEvent.set(this._beforeScene);
};

game.ChooseItem = function(thisGame) {
  game.Scene.call(this);
  this._game = thisGame;
  this._player = thisGame.player();
  this._stage = thisGame.stage();
};
game.ChooseItem.inherit(game.Scene);

game.ChooseItem.prototype.draw = function() {
  this._beforeScene.draw();
  this._player.drawItemList(this._game.display());
};

game.ChooseItem.prototype.handleEvent = function(e) {
  var key = e.keyCode;
  if (key == rll.key.ESCAPE) {
    this.back();
    return;
  } else if (key == rll.key.RETURN) {
    this.drawBeforeScene();
    (new game.ChooseItemAction(this._game)).start();
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

game.ChooseItemAction = function(thisGame) {
  game.Scene.call(this);
  this._game = thisGame;
  this._player = thisGame.player();
  this._actionList = new game.ItemActionList();
};
game.ChooseItemAction.inherit(game.Scene);

game.ChooseItemAction.prototype.initialize = function() {
  var item = this._player.selectedItem();
  if (item.isPotion()) {
    this._actionList.add(new game.UseItem('飲む', this._game));
  }
  if (item.isRod()) {
    this._actionList.add(new game.ChangeScene('振る', new game.ChooseTargetAction(this._game, item)));
  }
  if (item.isWeapon() || item.isArmor()) {
    this._actionList.add(new game.UseItem('装備', this._game));
  }
  this._actionList.add(new game.Drop('捨てる', this._game));
  this.draw();
};

game.ChooseItemAction.prototype.draw = function() {
  this._rootScene.draw();
  this._actionList.draw(this._game.display());
};

game.ChooseItemAction.prototype.handleEvent = function(e) {
  var key = e.keyCode;
  if (key == rll.key.ESCAPE) {
    this.back();
    return;
  } else if (key == rll.key.RETURN) {
    this._actionList.execute();
    if (game.keyEvent.current() !== this) return;
    this.backToRoot();
    return;
  } else if (key in game.DIRECITON_KEY === false) {
    return;
  } else if (game.DIRECITON_KEY[key] === rll.Direction.S) {
    this._actionList.nextCursor();
  } else if (game.DIRECITON_KEY[key] === rll.Direction.N) {
    this._actionList.prevCursor();
  } else {
    return;
  }
  this.draw();
};

game.ChooseTargetAction = function(thisGame, effect) {
  game.Scene.call(this);
  this._game = thisGame;
  this._player = thisGame.player();
  this._display = thisGame.display();
  this._stage = thisGame.stage();
  this._messages = thisGame.messages();
  this._monsterPoints = [];
  this._targetPoint = null;
  this._effect = effect;
};
game.ChooseTargetAction.inherit(game.Scene);

game.ChooseTargetAction.prototype.initialize = function() {
  this._monsterPoints = this._player.visibleMonsterPoints(this._stage);
  if (this._monsterPoints.isEmpty()) {
    this._messages.add('相手がいない。');
    this.backToRoot();
    return;
  }
  this._monsterPoints.sort(function(a, b) {
    var abs = Math.abs;
    a = this.distance(a);
    b = this.distance(b);
    return (abs(a.x()) + abs(a.y())) - (abs(b.x()) + abs(b.y()));
  }.bind(this._player.point()));
  this._targetPoint = this._monsterPoints[0];
  this.draw();
};

game.ChooseTargetAction.prototype.draw = function() {
  this._rootScene.draw();
  var actor = this._stage.findActor(this._targetPoint);
  this._display.changeBackColor(this._targetPoint, '#800');
  if (actor) this._messages.add(actor.name());
  this._messages.draw(this._display);
};

game.ChooseTargetAction.prototype.handleEvent = function(e) {
  var key = e.keyCode, sortFunction;
  if (key == rll.key.ESCAPE) {
    this.back();
    return;
  }
  if (key === rll.key.RETURN) {
    this._effect.use(this._game, this._stage.findActor(this._targetPoint), this._player);
    this._game.nextTurn();
    this.backToRoot();
    return;
  }
  if (key in game.DIRECITON_KEY === false) return;
  switch(game.DIRECITON_KEY[key]) {
    case rll.Direction.E:
      sortFunction = function(a, b) { return a.x() - b.x(); };
      break;
    case rll.Direction.W:
      sortFunction = function(a, b) { return b.x() - a.x(); };
      break;
    case rll.Direction.S:
      sortFunction = function(a, b) { return a.y() - b.y(); };
      break;
    case rll.Direction.N:
      sortFunction = function(a, b) { return b.y() - a.y(); };
      break;
  }
  this._monsterPoints.sort(sortFunction);
  this._targetPoint = this._monsterPoints.next(this._targetPoint);
  this.draw();
};
