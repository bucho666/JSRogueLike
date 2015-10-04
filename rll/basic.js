Object.defineProperty(Object.prototype, 'inherit', { value: function(parent) {
  var F = function(){};
  F.prototype = parent.prototype;
  this.prototype = new F();
  this.prototype.constructer = this;
  this.prototype._super = parent;
}});

Object.defineProperty(Array.prototype, 'choiceAtRandom', { value: function() {
  var index = rll.random(0, this.length - 1);
  return this[index];
}});

Object.defineProperty(Array.prototype, 'find', { value: function(f) {
  for (var i=0; i<this.length; i++) {
    if (f(this[i])) return this[i];
  }
  return null;
}});

Object.defineProperty(Array.prototype, 'next',
  { value: function(element, count) {
  count = count || 1;
  var i = this.indexOf(element);
  i = (i + count) % this.length;
  return this[i];
}});

Object.defineProperty(Array.prototype, 'prev',
  { value: function(element, count) {
  count = count || 1;
  var i = this.indexOf(element);
  i = (i + this.length - count) % this.length;
  return this[i];
}});

Object.defineProperty(Array.prototype, 'remove', {
  value: function(element) {
  var index = this.indexOf(element);
  if (index === -1) return;
  this.splice(index, 1);
}});

Object.defineProperty(Array.prototype, 'max', {
  value: function(f) {
  var max = 0,
      object = null;
  for (var i=0; i<this.length; i++) {
    var value = f(this[i]);
    if (value < max) continue;
    max = value;
    object = this[i];
  }
  return object;
}});

Object.defineProperty(Array.prototype, 'min', {
  value: function(f) {
  var min = null,
      object = null;
  for (var i=0; i<this.length; i++) {
    var value = f(this[i]);
    if (min !== null && value > min) continue;
    min = value;
    object = this[i];
  }
  return object;
}});

Object.defineProperty(Array.prototype, 'isEmpty', {
  value: function() {
  return this.length === 0;
}});

Object.defineProperty(Array.prototype, 'has', {
  value: function(item) {
  return this.indexOf(item) >= 0;
}});

var rll = rll || {};

rll.key = {
  RETURN: 13, ESCAPE: 27, SPACE: 32,
  LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
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

rll.cointoss = function() {
  return rll.random(0, 1) === 1;
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
  var x = this.x() + other.x(),
      y = this.y() + other.y();
  return new rll.Point(x, y);
};

rll.Point.prototype.distance = function(other) {
  var x = this.x() - other.x(),
      y = this.y() - other.y();
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
      return [straight, slash];
    } else {
      return [slash, straight];
    }
  } else {
    straight = new rll.Point(0, ty);
    if (v < absDistanceY) {
      return [straight, slash];
    } else {
      return [slash, straight];
    }
  }
};

rll.Point.prototype.crossDirectionToAtRandom = function(to) {
  var distance = to.distance(this),
      dx = distance.x(),
      dy = distance.y(),
      directions = [];
  if (dx > 0) directions.push(rll.Direction.E);
  if (dx < 0) directions.push(rll.Direction.W);
  if (dy > 0) directions.push(rll.Direction.S);
  if (dy < 0) directions.push(rll.Direction.N);
  return directions.choiceAtRandom();
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

rll.Direction.CROSS = [
  rll.Direction.N, rll.Direction.E,
  rll.Direction.S, rll.Direction.W,
  ];

rll.Direction.AROUND = [
  rll.Direction.N, rll.Direction.NE,
  rll.Direction.E, rll.Direction.SE,
  rll.Direction.S, rll.Direction.SW,
  rll.Direction.W, rll.Direction.NW
  ];

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
  var w = this.width()  * other.width(),
      h = this.height() * other.height();
  return new rll.Size(w, h);
};

rll.Size.prototype.area = function() {
  return this.width() * this.height();
};

rll.Size.prototype.contraction = function(v) {
  return new rll.Size(this.width()-v, this.height()-v);
};

rll.Rect = function(size, point) {
  this._point = point || new rll.Point(0, 0);
  this._size = size;
};

rll.Rect.prototype.width = function() {
  return this._size.width();
};

rll.Rect.prototype.height = function() {
  return this._size.height();
};

rll.Rect.prototype.forEachFrame = function(f, thisObject) {
  var px = this._point.x(), py = this._point.y();
  for (var y=0; y<this._size.height(); y++) {
    f.call(thisObject, new rll.Point(px, py + y));
    f.call(thisObject, new rll.Point(px+this._size.width()-1, py + y));
  }
  for (var x=1; x<this._size.width(); x++) {
    f.call(thisObject, new rll.Point(px + x, py));
    f.call(thisObject, new rll.Point(px + x, py + this._size.height()-1));
  }
};

rll.Rect.prototype.forEach = function(f, thisObject) {
  var px = this._point.x(),
      py = this._point.y(),
      w = this._size.width(),
      h = this._size.height(),
      x, y;
  for (y=0; y < h; y++) {
    for (x=0; x < w; x++) {
      f.call(thisObject, new rll.Point(px+x, py+y));
    }
  }
};

rll.Rect.prototype.forEachInside = function(f, thisObject) {
  var inside = this.contraction(2).move(new rll.Point(1, 1));
  inside.forEach(f, thisObject);
};

rll.Rect.prototype.insidePointAtRandom = function() {
  var x = rll.random(this._point.x() + 1, this._point.x() + this._size.width() - 2),
      y = rll.random(this._point.y() + 1, this._point.y() + this._size.height() - 2);
  return new rll.Point(x, y);
};

rll.Rect.prototype.x = function() {
  return this._point.x();
};

rll.Rect.prototype.y = function() {
  return this._point.y();
};

rll.Rect.prototype.splitVertical = function(v) {
  return [new rll.Rect(
            new rll.Size(v, this._size.height()),
            this._point),
          new rll.Rect(
            new rll.Size(this._size.width() - v + 1, this._size.height()),
            new rll.Point(this._point.x() + v - 1, this._point.y()))];
};

rll.Rect.prototype.splitHorizontal = function(v) {
  return [new rll.Rect(
            new rll.Size(this._size.width(), v),
            this._point),
          new rll.Rect(
            new rll.Size(this._size.width(), this._size.height() - v + 1),
            new rll.Point(this._point.x(), this._point.y() + v - 1))];
};

rll.Rect.prototype.contraction = function(v) {
  return new rll.Rect(this._size.contraction(v), this._point);
};

rll.Rect.prototype.move = function(dir) {
  return new rll.Rect(this._size, this._point.add(dir));
};

rll.Rect.prototype.area = function() {
  return this._size.area();
};

rll.Rect.prototype.center = function() {
  var w = this._size.width(),
      h = this._size.height(),
      x, y;
  w = Math.floor(w / 2) + (w % 2);
  h = Math.floor(h / 2) + (h % 2);
  x = this._point.x() + w - 1;
  y = this._point.y() + h - 1;
  return new rll.Point(x, y);
};

rll.Array2D = function(size, initial) {
  initial = initial === undefined ? null : initial;
  var h = size.height(), w = size.width();
  this._grid = new Array(size.height());
  for (var y=0; y<h; y++) {
    this._grid[y] = new Array(w);
    for (var x=0; x<w; x++) {
      this._grid[y][x] = initial;
    }
  }
};

rll.Array2D.prototype.set = function(value, point) {
  this._grid[point.y()][point.x()] = value;
};

rll.Array2D.prototype.get = function(point) {
  return this._grid[point.y()][point.x()];
};

rll.Array2D.prototype.forEach = function(f) {
  this._grid.forEach(function(line) {
    line.forEach(f);
  });
};

rll.Dice = function(dice) {
  this._string = dice;
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

rll.Dice.prototype.toString = function() {
  return this._string;
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

rll.Dice.prototype.adjust = function() {
  return this._adjust;
};

rll.Dice.prototype.sided = function() {
  return this._sided;
};

