/* global rll, inherit*/
rll.State = function(value) {
  this._current = value;
  this._max = value;
};

rll.State.prototype.current = function() {
  return this._current;
};

rll.State.prototype.add = function(value) {
  this._current += value;
  if (this._current > this._max) {
    this._current = this._max;
  }
};

rll.State.prototype.addMax = function(value) {
  this._max += value;
};

rll.State.prototype.toString = function() {
  return this._current + '(' + this._max + ')';
};

rll.Actor = function(character, name) {
  rll.Entity.call(this, character, name);
  this._point = new rll.Point(0, 0);
  this._action = { compute: function(){} };
  this._hp = new rll.State(8);
  this._armorClass = 8;
};
inherit(rll.Actor, rll.Entity);

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
  display.write(this._point.add(point),
      this._character.glyph(),
      this._character.color());
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

inherit(rll.Monster, rll.Actor);

rll.Monster.prototype.attackDamage = function() {
  return this._damage.roll();
};

rll.Monster.prototype.toHit = function() {
  return this._hitDice.number();
};

rll.Player = function(character, name) {
  rll.Actor.call(this, character, name);
  this._level = 1;
  this.setAction(new rll.Player.AutoHeal(this));
};
inherit(rll.Player, rll.Actor);

rll.Player.prototype.toHit = function() {
  return this._level;
};

rll.Player.AutoHeal = function(actor) {
  this._actor = actor;
};

rll.Player.AutoHeal.prototype.compute = function() {
  if (rll.random(0, 7) == 1) {
    this._actor.heal(1);
  }
};

rll.Player.prototype.drawStatusLine = function(display, point) {
  display.write(point, 'hp:' + this._hp);
};
