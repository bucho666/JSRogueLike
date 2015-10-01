/*global rll*/
rll.Runner = function(actor, direction, stage) {
  this._actor = actor;
  this._stage = stage;
  this._direction = direction;
  var leftPoint = this._actor.leftPoint(this._direction),
      rightPoint = this._actor.rightPoint(this._direction);
  this._leftWalkable = this.walkableAt(direction.add(leftPoint));
  this._rightWalkable = this.walkableAt(direction.add(rightPoint));
};

rll.Runner.prototype.inFrontDoor = function() {
  var forward = this._direction.add(this._actor.point());
  return this._stage.closedDoorAt(forward);
};

rll.Runner.prototype.direction = function() {
  return this._direction;
};

rll.Runner.prototype.inCorrier = function() {
  return (this._leftWalkable === false && this._rightWalkable === false);
};

rll.Runner.prototype.runnableStraight = function() {
  var forward = this._direction.add(this._actor.point());
  return this.walkableAt(forward);
};

rll.Runner.prototype.onBranch = function() {
  var leftPoint = this._actor.leftPoint(this._direction),
      rightPoint = this._actor.rightPoint(this._direction);
  if (this.walkableAt(leftPoint) !== this._leftWalkable) return true;
  if (this.walkableAt(rightPoint) !== this._rightWalkable) return true;
  return false;
};

rll.Runner.prototype.walkableAt = function(point) {
  if (this._stage.closedDoorAt(point)) return true;
  return this._stage.walkableAt(point);
};

rll.Runner.prototype.mustStop = function() {
  if (this.inCorrier() === false) return this.onBranch();
  if (this.runnableStraight()) return this.onBranch();
  return this._turn();
};

rll.Runner.prototype._turn = function() {
  var forward = this._direction.add(this._actor.point()),
      cross = rll.Direction.CROSS,
      side;
  if (this._stage.walkableAt(forward) === false) {
    side = [cross.next(this._direction, 1), cross.prev(this._direction, 1),];
    side = side.filter(function(direction) {
      return this._stage.walkableAt(direction.add(this._actor.point()));
    }, this);
    if (side.length !== 1) return true;
    this._direction = side[0];
  }
  return false;
};
