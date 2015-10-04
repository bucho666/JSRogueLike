/* global rll, inherit*/
rll.Item = function(character, name) {
  rll.Entity.call(this, character, name);
};
inherit(rll.Item, rll.Entity);

rll.Item.prototype.use = function(game) {
  game.message(this.name() + 'を使った。');
};

rll.Item.prototype.isMoney = function() {
  return false;
};

rll.Item.prototype.isWeapon = function() {
  return false;
};

rll.Money = function(value) {
  rll.Item.call(this, rll.Money.character, '銀貨');
  this._value = value;
};
rll.Money.character = new rll.Character('$', '#ff0');
inherit(rll.Money, rll.Item);

rll.Money.prototype.value = function() {
  return this._value;
};

rll.Money.prototype.isMoney = function() {
  return true;
};

rll.Potion = function(name, magic, color) {
  rll.Item.call(this, new rll.Character('!', color), name);
  this._magic = magic;
};
inherit(rll.Potion, rll.Item);

rll.Potion.prototype.use = function(game) {
  (new this._magic(game)).apply();
};

rll.Weapon = function(name, damage) {
  rll.Item.call(this, rll.Weapon.character, name);
  this._damageDice = new rll.Dice(damage);
};
rll.Weapon.inherit(rll.Item);
// TODO 全部書き換え

rll.Weapon.character = new rll.Character('/', '#fff');

rll.Weapon.prototype.isWeapon = function() {
  return true;
};

rll.Weapon.prototype.damage = function() {
  return this._damageDice.roll();
};

rll.Weapon.prototype.name = function() {
  return this._name + '(' + this._damageDice + ')';
};
