/* global rll, inherit*/
rll.Money = function(value) {
  this._value = value;
  rll.Entity.call(this, rll.Money.character, '銀貨');
};
rll.Money.character = new rll.Character('$', '#ff0');
inherit(rll.Money, rll.Entity);

rll.Money.prototype.value = function() {
  return this._value;
};
