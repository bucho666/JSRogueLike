/*global rll*/
rll.Sight = function(size) {
  this._memory = [];
  this._sight = null;
  for (var y=0, h=size.height(); y<h; y++) {
    this._memory[y] = [];
    for (var x=0, w=size.width(); x<w; x++) {
      this._memory[y][x] = rll.Entity.BLANK;
    }
  }
};

rll.Sight.prototype.setMemory = function(entity, point) {
  this._memory[point.y()][point.x()] = entity.dark();
};

rll.Sight.prototype.clear = function() {
  var h = this._memory.length,
      w = this._memory[0].length;
 for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      this._memory[y][x] = rll.Entity.BLANK;
    }
  }
};

rll.Sight.prototype.draw = function(display, stage) {
  for (var y=0; y < this._memory.length; y++) {
    for (var x=0; x < this._memory[y].length; x++) {
      this._memory[y][x].draw(display, new rll.Point(x, y));
    }
  }
  for (var i=0; i<this._sight.length; i++) {
    var p = this._sight[i];
    stage.draw(display, p);
  }
};

rll.Sight.prototype.scan = function(point, stage) {
  var view = new rll.View(this._radius), p, i, entity;
  this._sight = view.scan(point, stage);
  for (i=0; i<this._sight.length; i++) {
    p = this._sight[i];
    entity = stage.item(p);
    entity = entity ? entity : stage.terrain(p);
    this.setMemory(entity, p);
  }
};

rll.Sight.prototype.existsMonster = function(stage, me) {
  return this.monsterPoints(stage, me).isEmpty() === false;
};

rll.Sight.prototype.monsterPoints = function(stage, me) {
  var points = [], i, point, actor;
  for (i=0; i<this._sight.length; i++) {
    point = this._sight[i];
    actor = stage.findActor(point);
    if (actor === null) continue;
    if (actor == me) continue;
    points.push(point);
  }
  return points;
};

rll.View = function(radius) {
  this._radius = radius || 8;
};

rll.View.prototype.scan = function(point, stage) {
  var result = [point];
  for (var oct=0; oct < 8; oct++) {
    var schanner = new rll.View.Scanner(point, stage, 0.0, 1.0, oct, this._radius);
    result = result.concat(schanner.scan(1));
  }
  return result;
};

rll.View.Scanner = function(point, stage, startSlope, endSlope, oct, radius) {
  this._point = point;
  this._stage = stage;
  this._startSlope = startSlope;
  this._endSlope = endSlope;
  this._oct = oct;
  this._radius = radius;
  this._result = [];
};

rll.View.Scanner.prototype.scan = function(start) {
  for (var y=start; y<this._radius; y++) {
    if (this._scanLine(y) === false) break;
  }
  return this._result;
};

rll.View.Scanner.prototype._scanLine = function(y) {
  var bloking = false,
      startX = Math.round(y * this._startSlope),
      endX = Math.round(y * this._endSlope),
      absPoint, passLight, schanner;
  if (startX > endX) return false;
  for (var x=startX; x<=endX; x++) {
    if (x*x + y*y > this._radius * this._radius) break;
    absPoint = this._absPoint(x, y);
    passLight = this._stage.passLight(absPoint);
    this._result.push(absPoint);
    if (bloking === false && passLight === false) {
      if (x > startX) {
        schanner = new rll.View.Scanner(this._point, this._stage,
            0.0, (x-0.5)/(y+0.5), this._oct, this._radius);
        this._result = this._result.concat(schanner.scan(y+1));
      }
      bloking = true;
    } else if (bloking === true && passLight === true) {
      schanner = new rll.View.Scanner(this._point, this._stage,
          (x+0.5)/(y-0.5), this._endSlope, this._oct, this._radius);
      this._result = this._result.concat(schanner.scan(y));
      return false;
    }
  }
  return !bloking;
};

rll.View.Scanner.prototype._absPoint = function(x, y) {
  if (this._oct % 2 == 1) x = [y, y = x][0];
  if (this._oct >= 2 && this._oct < 6) x = -x;
  if (this._oct >= 4 && this._oct < 8) y = -y;
  return new rll.Point(this._point.x() + x, this._point.y() + y);
};
