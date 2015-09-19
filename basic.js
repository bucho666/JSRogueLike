var inherit = function(child, parent) {
  var F = function(){};
  F.prototype = parent.prototype;
  child.prototype = new F();
  child.prototype.constructer = child;
};

var rll = rll || {};

rll.key = {
  SPACE: 32,
  LEFT: 37, UP: 38,
  RIGHT: 39, DOWN: 40,
  A: 65, B: 66, C: 67,
  D: 68, E: 69, F: 70,
  G: 71, H: 72, I: 73,
  J: 74, K: 75, L: 76,
  M: 77, N: 78, O: 79,
  P: 80, Q: 81, R: 82,
  S: 83, T: 84, U: 85,
  V: 86, W: 87, X: 88,
  Y: 89, Z: 90,
  NUMPAD0: 96,
  NUMPAD1: 97,  NUMPAD2: 98, NUMPAD3: 99,
  NUMPAD4: 100, NUMPAD5: 101, NUMPAD6: 102,
  NUMPAD7: 103, NUMPAD8: 104, NUMPAD9: 105,
  MULTIPLY: 106, ADD: 107, SEPARATOR: 108,
  SUBTRACT: 109, DECIMAL: 110, DIVIDE: 111,
  PERIOD: 190
};

rll.random = function(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
};

rll.List = function() {
  Array.call(this);
  for(var i = 0; i<arguments.length; i++) {
    this.push(arguments[i]);
  }
};
inherit(rll.List, Array);

rll.List.prototype.choice = function() {
  var index = rll.random(0, this.length - 1);
  return this[index];
};

rll.List.prototype.find = function(f) {
  for (var i=0; i<this.length; i++) {
    if (f(this[i])) return this[i];
  }
  return null;
};

rll.List.prototype.next = function(element, count) {
  count = count || 1;
  var i = this.indexOf(element);
  i = (i + count) % this.length;
  return this[i];
};

rll.List.prototype.prev = function(element, count) {
  count = count || 1;
  var i = this.indexOf(element);
  i = (i + this.length - count) % this.length;
  return this[i];
};

rll.List.prototype.remove = function(element) {
  var index = this.indexOf(element);
  if (index === -1) return;
  this.splice(index, 1);
};

rll.Point = function(x, y) {
  this._x = x;
  this._y = y;
};

rll.Point.prototype.x = function() {
  return this._x;
};

rll.Point.prototype.y = function() {
  return this._y;
};

rll.Point.prototype.equal = function(other) {
  return (this.x() === other.x() &&
          this.y() === other.y());
};

rll.Point.prototype.add = function(other) {
  var x = this.x() + other.x();
  var y = this.y() + other.y();
  return new rll.Point(x, y);
};

rll.Point.prototype.distance = function(other) {
  var x = this.x() - other.x();
  var y = this.y() - other.y();
  return new rll.Point(x, y);
};

rll.Point.prototype.toString = function() {
  return this.x() + ':' + this.y();
};

rll.Point.prototype.lineTo = function(to) {
  var distance = to.distance(this),
      dx = distance.x(), dy = distance.y(),
      addX = dx / Math.abs(dx),
      addY = dy / Math.abs(dy),
      cx = this.x(), cy = this.y(),
      absDistanceX = Math.abs(dx),
      absDistanceY = Math.abs(dy),
      error, line = [];
  if (absDistanceX > absDistanceY) {
    error = absDistanceX / 2;
    while (cx != to.x()) {
      cx += addX;
      error += absDistanceY;
      if (error > absDistanceX) {
        cy += addY;
        error -= absDistanceX;
      }
      line.push(new rll.Point(cx, cy));
    }
  } else {
    error = absDistanceY / 2;
    while (cy != to.y()) {
      cy += addY;
      error += absDistanceX;
      if (error > absDistanceY) {
        cx += addX;
        error -= absDistanceY;
      }
      line.push(new rll.Point(cx, cy));
    }
  }
  return line;
};

rll.Point.prototype.directionsTo = function(to) {
  var distance = to.distance(this),
      dx = distance.x(),
      dy = distance.y(),
      absDistanceX = Math.abs(dx),
      absDistanceY = Math.abs(dy),
      tx = dx === 0 ? 0 : dx / absDistanceX,
      ty = dy === 0 ? 0 : dy / absDistanceY,
      v = rll.random(0, absDistanceX + absDistanceY),
      slash = new rll.Point(tx, ty),
      straight;
  if (absDistanceX > absDistanceY) {
    straight = new rll.Point(tx, 0);
    if (v < absDistanceX) {
      return new rll.List(straight, slash);
    } else {
      return new rll.List(slash, straight);
    }
  } else {
    straight = new rll.Point(0, ty);
    if (v < absDistanceY) {
      return new rll.List(straight, slash);
    } else {
      return new rll.List(slash, straight);
    }
  }
};

rll.Point.prototype.isNextTo = function(point) {
  var dx = Math.abs(this.x() - point.x());
  var dy = Math.abs(this.y() - point.y());
  return (dx < 2 && dy < 2);
};

rll.Direction = {};
rll.Direction.UP    = new rll.Point( 0, -1);
rll.Direction.DOWN  = new rll.Point( 0,  1);
rll.Direction.LEFT  = new rll.Point(-1,  0);
rll.Direction.RIGHT = new rll.Point( 1,  0);

rll.Direction.HERE  = new rll.Point(0, 0);
rll.Direction.N  = rll.Direction.UP;
rll.Direction.E  = rll.Direction.RIGHT;
rll.Direction.S  = rll.Direction.DOWN;
rll.Direction.W  = rll.Direction.LEFT;
rll.Direction.NE = rll.Direction.N.add(rll.Direction.E);
rll.Direction.SE = rll.Direction.S.add(rll.Direction.E);
rll.Direction.SW = rll.Direction.S.add(rll.Direction.W);
rll.Direction.NW = rll.Direction.N.add(rll.Direction.W);

rll.Direction.AROUND = new rll.List(
  rll.Direction.N, rll.Direction.NE,
  rll.Direction.E, rll.Direction.SE,
  rll.Direction.S, rll.Direction.SW,
  rll.Direction.W, rll.Direction.NW);

rll.Size = function(width, height) {
  this._width = width;
  this._height = height;
};

rll.Size.prototype.width = function() {
  return this._width;
};

rll.Size.prototype.height = function() {
  return this._height;
};

rll.Size.prototype.multiply = function(other) {
  var w = this.width()  * other.width();
  var h = this.height() * other.height();
  return new rll.Size(w, h);
};

rll.Dice = function(dice) {
  var result = /(\d+)d(\d+)([+-])(\d+)/.exec(dice);
  if (result === null) result = /(\d+)d(\d+)/.exec(dice);
  if (result === null) throw 'Dice: invalid arguments: ' + dice;
  this._num = parseInt(result[1]);
  this._sided = parseInt(result[2]);
  this._adjust = 0;
  if (result.length !== 5) return;
  this._adjust = parseInt(result[4]);
  if (result[3] === '-') this._adjust *= -1;
};

rll.Dice.prototype.roll = function() {
  var roll = 0;
  for (var c=0; c<this._num; c++) {
    roll += rll.random(1, this._sided);
  }
  roll += this._adjust;
  return (roll < 1) ? 1 : roll;
};

rll.Dice.prototype.number = function() {
  return parseInt(this._num);
};
