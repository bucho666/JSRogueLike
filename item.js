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

rll.Potion = function(name, magic, color) {
  rll.Item.call(this, new rll.Character('!', color), name);
  this._magic = magic;
};
inherit(rll.Potion, rll.Item);

rll.Potion.prototype.use = function(game) {
  (new this._magic(game)).apply();
};

rll.Money = function(value) {
  this._value = value;
  rll.Item.call(this, rll.Money.character, '銀貨');
};
rll.Money.character = new rll.Character('$', '#ff0');
inherit(rll.Money, rll.Item);

rll.Money.prototype.value = function() {
  return this._value;
};

rll.Money.prototype.isMoney = function() {
  return true;
};
