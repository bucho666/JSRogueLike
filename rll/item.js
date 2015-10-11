/* global rll*/
rll.Item = function(character, name) {
  rll.Entity.call(this, character, name);
};
rll.Item.inherit(rll.Entity);

rll.Item.prototype.use = function(game) {
  game.message(this.name() + 'を使った。');
};

rll.Item.prototype.isMoney = function() {
  return false;
};

rll.Item.prototype.isPotion = function() {
  return false;
};

rll.Item.prototype.isWeapon = function() {
  return false;
};

rll.Item.prototype.isArmor = function() {
  return false;
};

rll.Item.prototype.isShield = function() {
  return false;
};

rll.Item.prototype.isRod = function() {
  return false;
};

rll.Money = function(value) {
  rll.Item.call(this, rll.Money.character, '銀貨');
  this._value = value;
};
rll.Money.character = new rll.Character('$', '#ff0');
rll.Money.inherit(rll.Item);

rll.Money.prototype.value = function() {
  return this._value;
};

rll.Money.prototype.isMoney = function() {
  return true;
};

rll.MagicItem = function(name, magic, character) {
  rll.Item.call(this, character, name);
  this._magic = magic;
};
rll.MagicItem.inherit(rll.Item);

rll.MagicItem.prototype.use = function(game) {
  (new this._magic(game)).apply();
};

rll.Potion = function(name, magic, color) {
  rll.MagicItem.call(this, name, magic, new rll.Character('!', color), name);
};
rll.Potion.inherit(rll.MagicItem);

rll.Potion.prototype.isPotion = function() {
  return true;
};

rll.Rod = function(name, magic, color) {
  rll.MagicItem.call(this, name, magic, new rll.Character('-', color), name);
};
rll.Rod.inherit(rll.MagicItem);

rll.Rod.prototype.isRod = function() {
  return true;
};

rll.Weapon = function(name, damage) {
  rll.Item.call(this, rll.Weapon.character, name);
  this._damageDice = new rll.Dice(damage);
};
rll.Weapon.inherit(rll.Item);

rll.Weapon.character = new rll.Character('(', '#fff');

rll.Weapon.prototype.isWeapon = function() {
  return true;
};

rll.Weapon.prototype.damage = function() {
  return this._damageDice.roll();
};

rll.Weapon.prototype.name = function() {
  return this._name + '(' + this._damageDice + ')';
};

rll.Armor = function(name, armorClass) {
  rll.Item.call(this, rll.Armor.character, name);
  this._armorClass = armorClass;
};
rll.Armor.inherit(rll.Item);

rll.Armor.character = new rll.Character(']', '#fff');

rll.Armor.prototype.isArmor = function() {
  return true;
};

rll.Armor.prototype.armorClass = function() {
  return this._armorClass;
};

rll.Armor.prototype.name = function() {
  return this._name + '[' + this._armorClass + ']';
};

rll.Shield = function(name, armorClass) {
  rll.Armor.call(this, name, armorClass);
  this._character = rll.Shield.character;
};
rll.Shield.inherit(rll.Armor);

rll.Shield.character = new rll.Character('[', '#888');

rll.Shield.prototype.isShield = function() {
  return true;
};

