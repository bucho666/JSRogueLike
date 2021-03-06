/* global rll*/
rll.State = function(max, value) {
  value = value === undefined ? max : value;
  this._current = value;
  this._max = max;
};

rll.State.prototype.isFull = function() {
  return this._current >= this._max;
};

rll.State.prototype.current = function() {
  return this._current;
};

rll.State.prototype.max = function() {
  return this._max;
};

rll.State.prototype.add = function(value) {
  this._current += value;
  if (this._current > this._max) {
    this._current = this._max;
  }
};

rll.State.prototype.overAdd = function(value) {
  this._current += value;
};

rll.State.prototype.addMax = function(value) {
  this._max += value;
};

rll.State.prototype.toString = function() {
  return this._current + '(' + this._max + ')';
};

rll.PercenteageState = function(max, value) {
  rll.State.call(this, max, value);
};
rll.PercenteageState.inherit(rll.State);

rll.PercenteageState.prototype.toString = function() {
  var p = Math.floor((this._current / this._max * 100));
  return p + '%';
};

rll.Actor = function(character, name) {
  rll.Entity.call(this, character, name);
  this._point = new rll.Point(0, 0);
  this._action = { compute: function(){} };
  this._hp = new rll.State(8);
  this._armorClass = 8;
};
rll.Actor.inherit(rll.Entity);

rll.Actor.prototype.damage = function(damage) {
  this._hp.add(-damage);
};

rll.Actor.prototype.attackDamage = function() {
  return rll.random(1, 8);
};

rll.Actor.prototype.heal = function(hp) {
  this._hp.add(hp);
};

rll.Actor.prototype.isAlive = function() {
  return this._hp.current() > 0;
};

rll.Actor.prototype.isDead = function() {
  return this._hp.current() < 1;
};

rll.Actor.prototype.lineTo = function(from) {
  return from.lineTo(this._point);
};

rll.Actor.prototype.point = function() {
  return this._point;
};

rll.Actor.prototype.aroundPoints = function() {
  return rll.Direction.AROUND.map(function(direction) {
    return this.add(direction);
  }, this._point);
};

rll.Actor.prototype.directionsTo = function(point) {
  return this._point.directionsTo(point);
};

rll.Actor.prototype.setAction = function(newAction) {
  this._action = newAction;
};

rll.Actor.prototype.action = function() {
  this._action.compute(this);
};

rll.Actor.prototype.draw = function(display, point) {
  if (point === undefined) point = new rll.Point(0, 0);
  display.writeCharacter(this._point.add(point), this._character);
};

rll.Actor.prototype.move = function(direction) {
  this._point = this._point.add(direction);
};

rll.Actor.prototype.movedPoint = function(direction) {
  return this._point.add(direction);
};

rll.Actor.prototype.setPoint = function(point) {
  this._point = point;
};

rll.Actor.prototype.on = function(point) {
  return this._point.equal(point);
};

rll.Actor.prototype.isNextTo = function(point) {
  return this._point.isNextTo(point);
};

rll.Actor.prototype.toHit = function() {
  return 1;
};

rll.Actor.prototype.armorClass = function() {
  return this._armorClass;
};

rll.Monster = function(config) {
  var ch = new rll.Character(config.glyph, config.color);
  rll.Actor.call(this, ch, config.name);
  this._hitDice = new rll.Dice(config.hitDice);
  this._hp = new rll.State(this._hitDice.roll());
  this._armorClass = config.armorClass;
  this._damage = new rll.Dice(config.damage);
};
rll.Monster.inherit(rll.Actor);

rll.Monster.prototype.attackDamage = function() {
  return this._damage.roll();
};

rll.Monster.prototype.toHit = function() {
  return this._hitDice.number();
};

rll.Monster.prototype.level = rll.Monster.prototype.toHit;

rll.Monster.prototype.expBaseTable = [5, 10, 20, 25, 75, 175, 275];
rll.Monster.prototype.expAdjustTable = [0, 5, 5, 25, 50, 50];
rll.Monster.prototype.exp = function() {
  var diceNum = Math.floor(this._hitDice.number() * this._hitDice.sided() / 8),
      exp = this.expBaseTable[diceNum];
  if (this._hitDice.adjust() > 0) {
    exp += this.expAdjustTable[diceNum];
  }
  return exp;
};

rll.Monster.prototype.openableDoor = function() {
  return false;
};

rll.Humanoid = function(config) {
  rll.Monster.call(this, config);
};
rll.Humanoid.inherit(rll.Monster);

rll.Humanoid.prototype.openableDoor = function() {
  return true;
};

rll.ItemList = function(limit) {
  rll.ChooseList.call(this, limit);
  this._weapon = null;
  this._armor = null;
  this._shield = null;
};
rll.ItemList.inherit(rll.ChooseList);

rll.ItemList.prototype.equip = function(item) {
  if (item.isWeapon()) {
    this._weapon = item;
  } else if (item.isShield()) {
    this._shield = item;
  } else if (item.isArmor()) {
    this._armor = item;
  }
};

rll.ItemList.prototype.rollDamageDice = function() {
  if (this._weapon === null) {
    return (new rll.Dice('1d2')).roll();
  }
  return this._weapon.damage();
};

rll.ItemList.prototype.armorClass = function() {
  var armorClass = 9;
  if (this._armor) {
    armorClass += this._armor.armorClass();
  }
  if (this._shield) {
    armorClass += this._shield.armorClass();
  }
  return armorClass;
};

rll.ItemList.prototype.has = function(item) {
  return this._items.has(item);
};

rll.ItemList.prototype.name = function(index) {
  var item = this._items[index],
      name = item.name();
  if (item === this._weapon ||
      item === this._armor  ||
      item === this._shield) {
    name += '[装備]';
  }
  return name;
};

rll.ItemList.prototype.useSelectedItem = function(game) {
  var item = this.currentItem();
  item.use(game);
  if (item.isPotion() === false) return;
  this.removeCurrentItem();
};

rll.ItemList.prototype.removeCurrentItem = function() {
  var item = this._super.prototype.removeCurrentItem.call(this);
  if (item === this._weapon) {
    this._weapon = null;
  }
  return item;
};

rll.Player = function(character, name) {
  rll.Actor.call(this, character, name);
  this._level = 1;
  this._exp = new rll.PercenteageState(2000, 0);
  this._items = new rll.ItemList(8);
  this.setAction(new rll.Player.AutoHeal(this));
};
rll.Player.inherit(rll.Actor);

rll.Player.prototype.getItem = function(item) {
  this._items.add(item);
};

rll.Player.prototype.useItem = function(game) {
  this._items.useSelectedItem(game);
};

rll.Player.prototype.itemIsFull = function() {
  return this._items.isFull();
};

rll.Player.prototype.drawItemList = function(display) {
  this._items.draw(display);
};

rll.Player.prototype.hasItem = function() {
  return this._items.isEmpty() === false;
};

rll.Player.prototype.equip = function(item) {
  this._items.equip(item);
};

rll.Player.prototype.selectNextItem = function() {
  this._items.nextCursor();
};

rll.Player.prototype.selectPrevItem = function() {
  this._items.prevCursor();
};

rll.Player.prototype.selectedItem = function() {
  return this._items.currentItem();
};

rll.Player.prototype.removeSelectedItem = function() {
  return this._items.removeCurrentItem();
};

rll.Player.prototype.level = function() {
  return this._level;
};

rll.Player.prototype.rightPoint = function(direction) {
  var right = rll.Direction.AROUND.next(direction, 2);
  return this._point.add(right);
};

rll.Player.prototype.leftPoint = function(direction) {
  var left = rll.Direction.AROUND.prev(direction, 2);
  return this._point.add(left);
};

rll.Player.prototype.toHit = function() {
  return this._level + 3;
};

rll.Player.prototype.getMoney = function(money) {
  this.getExp(money.value());
};

rll.Player.prototype.getExp = function(value) {
  this._exp.overAdd(value);
};

rll.Player.prototype.expIsFull = function() {
  return this._exp.isFull();
};

rll.Player.prototype.levelUp = function() {
  this._level += 1;
  this._hp.addMax((new rll.Dice('1d8')).roll());
  var exp = this._exp.current() - this._exp.max();
  this._exp = new rll.PercenteageState(this._exp.max() * 2, exp);
};

rll.Player.prototype.drawStatusLine = function(display, point) {
  var line = 'hp:' + this._hp;
  line += ' LV:' + this._level;
  line += ' AC:' + this.armorClass();
  line += ' exp:' + this._exp;
  display.clearLine(point.y());
  display.write(point, line);
};

rll.Player.prototype.attackDamage = function() {
  return this._items.rollDamageDice();
};

rll.Player.prototype.armorClass = function() {
  return this._items.armorClass();
};

rll.Player.AutoHeal = function(actor) {
  this._actor = actor;
};

rll.Player.AutoHeal.prototype.compute = function() {
  if (rll.random(0, 7) == 1) {
    this._actor.heal(1);
  }
};
