/* global rll*/
var game = game || {};

game.ItemTable = function() {
  this._items = {};
};

game.ItemTable.prototype.setTable = function(level, items) {
  this._items[level] = items;
};

game.ItemTable.prototype.getAtRandom = function(level) {
  var list = [];
  for (var l = 0; l <= level; l++) {
    if (this._items[l] === undefined) continue;
    list = list.concat(this._items[l]);
  }
  return list.choiceAtRandom().copy();
};

game.potion = {};
game.potion.CureLightWounds = new rll.Potion('軽傷治癒の水薬', game.CureLightWounds, '#66f');

game.equipItem = function(game) {
  var player = game.player();
  player.equip(this);
  game.message(this.name() + 'を装備した！');
};

game.Weapon = function(name, damageDice) {
  rll.Weapon.call(this, name, damageDice);
};
game.Weapon.inherit(rll.Weapon);
game.Weapon.prototype.use = game.equipItem;

game.Weapon.prototype.copy = function() {
  return new game.Weapon(this._name, this._damageDice.toString());
};

game.Armor = function(name, armorClass) {
  rll.Armor.call(this, name, armorClass);
};
game.Armor.inherit(rll.Armor);
game.Armor.prototype.use = game.equipItem;

game.Armor.prototype.copy = function() {
  return new game.Armor(this._name, this._armorClass);
};

game.Shield = function(name, armorClass) {
  rll.Shield.call(this, name, armorClass);
};
game.Shield.inherit(rll.Shield);
game.Shield.prototype.use = game.equipItem;
game.Shield.prototype.copy = function() {
  return new game.Shield(this._name, this._armorClass);
};

game.Weapon.table = new game.ItemTable();
game.Weapon.table.setTable(0, [
    new game.Weapon('ダガー', '2d2'),
    new game.Weapon('クラブ', '1d5')]);
game.Weapon.table.setTable(1, [
    new game.Weapon('ショートソード', '2d3'),
    new game.Weapon('メイス', '2d2+1')]);
game.Weapon.table.setTable(2, [
  new game.Weapon('ハンドアックス', '1d7'),
  new game.Weapon('スピア', '1d6+1')]);
game.Weapon.table.setTable(3, [
  new game.Weapon('ハンマー', '2d3-1'),
  new game.Weapon('ロングソード', '2d4')]);
game.Weapon.table.setTable(4, [
  new game.Weapon('バトルアックス', '1d9'),
  new game.Weapon('トゥハンドソード', '2d5')]);

game.Armor.table = new game.ItemTable();
game.Armor.table.setTable(0, [
    new game.Armor('レザーアーマー', -2),
    new game.Shield('シールド', -1)]);
game.Armor.table.setTable(1, [
    new game.Armor('レザーアーマー+1', -3)]);
game.Armor.table.setTable(3, [
    new game.Armor('チェインメイル', -4),
    new game.Armor('チェインメイル+1', -5)]);
game.Armor.table.setTable(4, [
    new game.Shield('シールド+1', -2)]);
game.Armor.table.setTable(5, [
    new game.Armor('プレートメイル', -6),
    new game.Armor('プレートメイル+1', -7)]);
game.Armor.table.setTable(6, [
    new game.Shield('シールド+2', -3)]);
