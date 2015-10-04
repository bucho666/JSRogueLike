/*global rll*/
var game = game || {};

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
game.Dungeon.inherit(game.Scene);

game.Dungeon.prototype.initialize = function() {
  this.newLevel();
  var weapon = game.weapon.dagger;
  this._player.getItem(weapon);
  this._player.getItem(game.potion.CureLightWounds);
  this._player.getItem(game.potion.CureLightWounds);
  this._player.equip(weapon);
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
  this.end();
};

game.More = function(messages, display) {
  game.Scene.call(this);
  this._messages = messages;
  this._display = display;
};
game.More.inherit(game.Scene);

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
game.ChooseItem.inherit(game.Scene);

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
