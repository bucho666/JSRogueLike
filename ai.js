/* global rll, game*/
game.AI = function(game) {
  this._game = game;
  this._lastDest = null;
};

game.AI.prototype.compute = function(actor) {
  var player = this._game.player();
  var playerPoint = player.point();
  if (this._lastDest && actor.on(this._lastDest)) {
    this._lastDest = null;
  }
  if (actor.isNextTo(playerPoint) && player.isAlive()) {
    this.attackToPlayer(actor, player);
    return;
  }
  if (this.canSee(actor, playerPoint)) {
    this._lastDest = playerPoint;
    this.chase(actor, playerPoint);
  } else if (this._lastDest) {
    this.chase(actor, this._lastDest);
  } else {
    this.randomMove(actor);
  }
};

game.AI.prototype.attackToPlayer = function(actor, player) {
  var attack = new game.MeleeAttack(actor, player); // TODO game
  if (attack.isHit() === false) {
    this._game.message(actor.name() + 'の攻撃をかわした!');
    return;
  }
  var damage = attack.damage();
  this._game.message(actor.name() + 'の攻撃が命中' + damage + 'のダメージ!!');
  if (player.isDead() === false) return;
  this._game.message('あなたは死んだ…');
};

game.AI.prototype.canSee = function(actor, point) {
  var stage = this._game.stage();
  var line = actor.lineTo(point);
  for (var i=0; i<line.length; i++) {
    if (stage.passLight(line[i]) === false) {
      return false;
    }
  }
  return true;
};

game.AI.prototype.chase = function(actor, point) {
  var stage = this._game.stage();
  var directions = actor.directionsTo(point);
  for (var i=0; i<directions.length; i++) {
    var dir = directions[i];
    var to = actor.movedPoint(dir);
    if (stage.walkableAt(to)) {
      actor.move(dir);
      return;
    }
  }
};

game.AI.prototype.randomMove = function(actor) {
  var stage = this._game.stage();
  var directions = new rll.List();
  for (var i=0; i<rll.Direction.AROUND.length; i++) {
    var dir = rll.Direction.AROUND[i];
    if (stage.walkableAt(actor.movedPoint(dir))) {
      directions.push(dir);
    }
  }
  actor.move(directions.choice());
};
