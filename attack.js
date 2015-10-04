/*global rll*/
var game = game || {};

game.MeleeAttack = function(attaker, defender) {
  this._attaker = attaker;
  this._defender = defender;
};

game.MeleeAttack.prototype.isHit = function() {
  var rolls = rll.random(1, 20);
  if (rolls === 20) return true;
  if (rolls === 1 ) return false;
  return rolls <= (this._defender.armorClass() + this._attaker.toHit());
};

game.MeleeAttack.prototype.damage = function() {
  var damagePoint = this._attaker.attackDamage();
  this._defender.damage(damagePoint);
  return damagePoint;
};
