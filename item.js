/* global rll*/
var game = game || {};

game.potion = {};
game.potion.CureLightWounds = new rll.Potion('軽傷治癒の水薬', game.CureLightWounds, '#66f');

game.Weapon = function(name, damageDice) {
  rll.Weapon.call(this, name, damageDice);
};
game.Weapon.inherit(rll.Weapon);

game.Weapon.prototype.use = function(game) {
  var player = game.player();
  player.equip(this);
  game.message(this.name() + 'を装備した！');
};
game.weapon = {};
game.weapon.dagger = new game.Weapon('ダガー', '2d2');
game.weapon.list = [
  game.weapon.dagger,
  new game.Weapon('クラブ', '1d5'),
  new game.Weapon('ショートソード', '2d3'),
  new game.Weapon('メイス', '2d2+1'),
  new game.Weapon('ハンドアックス', '1d7'),
  new game.Weapon('スピア', '1d6+1'),
  new game.Weapon('ハンマー', '2d3-1'),
  new game.Weapon('ロングソード', '2d4'),
  new game.Weapon('バトルアックス', '1d9'),
  new game.Weapon('トゥハンドソード', '2d5')
];
