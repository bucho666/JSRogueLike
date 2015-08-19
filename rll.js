var rll = rll || {};

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

rll.Point.prototype.add = function(other) {
  var x = this.x() + other.x();
  var y = this.y() + other.y();
  return new rll.Point(x, y);
};

rll.Point.prototype.toString = function() {
  return this.x() + ':' + this.y();
};

rll.Point.RIGHT = new rll.Point(1, 0);

rll.Font = function(family, size) {
  this._fontFamily = family;
  this._fontSize = size;
};

rll.Font.prototype.toString = function() {
  return this._fontSize + 'px ' + this._fontFamily;
};

rll.Font.prototype.size = function() {
  return this._fontSize;
};

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

rll.Character = function(glyph, color) {
  this._glyph = glyph;
  this._color = color;
};

rll.Character.prototype.glyph = function() {
  return this._glyph;
};

rll.Character.prototype.color = function() {
  return this._color;
};

rll.Character.prototype.equal = function(other) {
  return (this._glyph == other._glyph &&
          this._color == other._color);
};

rll.Character.prototype.code = function() {
  return this._glyph.charCodeAt(0);
};

rll.CharacterCode = function(code) {
  this._code = code;
};

rll.CharacterCode.prototype.isWide = function() {
  return (this._code > 0xff   && this._code < 0xff61) ||
         (this._code > 0xffdc && this._code < 0xffe8) &&
          this._code > 0xffee;
};

rll.Grid = function(point, ch) {
  this._point = point;
  this._character = ch;
};

rll.Grid._size = null;
rll.Grid._backGroundColor = '#000';

rll.Grid.setSize = function(newSize) {
  rll.Grid._size = newSize;
};

rll.Grid.prototype.equal = function(other) {
  return this._character.equal(other._character);
};

rll.Grid.prototype.draw = function(context) {
  var w = rll.Grid._size.width();
  var h = rll.Grid._size.height();
  var x = this._point.x() * w;
  var y = this._point.y() * h;
  context.fillStyle = rll.Grid._backGroundColor;
  var cc = new rll.CharacterCode(this._character.code());
  if (cc.isWide()) w *= 2;
  context.fillRect(x, y, w, h);
  context.fillStyle = this._character.color();
  context.fillText(this._character.glyph(), x, y);
};

rll.Display = function() {
  this._context = null;
  this._font = new rll.Font('Courier New', 15);
  this._size = new rll.Size(80, 25);
  this._grids = {};
  this._dirty = {};
};

rll.Display.prototype.initialize = function() {
  var canvas = document.createElement('canvas');
  this._context = canvas.getContext('2d');
  this._setupFont();
  this._computeCanvasSize();
  this.clear();
  this.flush = this.flush.bind(this);
  this.flush();
};

rll.Display.prototype._setupFont = function() {
  this._context.font = this._font.toString();
  this._context.textAlign    = 'left';
  this._context.textBaseline = 'top';
};

rll.Display.prototype._computeCanvasSize = function() {
  var charWidth = Math.ceil(this._context.measureText('W').width);
  var gridSize = new rll.Size(charWidth, this._font.size());
  var canvasSize = this._size.multiply(gridSize);
  rll.Grid.setSize(gridSize);
  this._context.canvas.width = canvasSize.width();
  this._context.canvas.height = canvasSize.height();
  this._setupFont();
};

rll.Display.prototype.getCanvas = function() {
  return this._context.canvas;
};

rll.Display.prototype.write = function(point, string, color) {
  var write_color = color || '#ccc',
      cc;
  for (var i=0; i < string.length; i++) {
    this._write(point, string[i], write_color);
    point = point.add(rll.Point.RIGHT);
    cc = new rll.CharacterCode(string.charCodeAt(i));
    if (cc.isWide() === false) continue;
    this._clearCache(point);
    point = point.add(rll.Point.RIGHT);
  }
};

rll.Display.prototype._clearCache = function(point) {
  var key = point.toString();
  if (key in this._dirty === false) return;
  delete this._dirty[key];
};

rll.Display.prototype._write = function(point, glyph, color) {
  var key = point.toString();
  var grid = new rll.Grid(point, new rll.Character(glyph, color));
  if (key in this._dirty && this._dirty[key].equal(grid)) {
    return;
  }
  this._dirty[key] = grid;
};

rll.Display.prototype.flush = function() {
  window.requestAnimationFrame(this.flush);
  if (Object.keys(this._dirty).length === 0) return;
  for (var key in this._dirty) {
    if (key in this._grids && this._grids[key].equal(this._dirty[key])) {
      continue;
    }
    this._dirty[key].draw(this._context);
    this._grids[key] = this._dirty[key];
  }
  this._dirty = {};
};

rll.Display.prototype.clear = function() {
  var w = this._context.canvas.width;
  var h = this._context.canvas.height;
  this._context.fillStyle = rll.Grid._backGroundColor;
  this._context.fillRect(0, 0, w, h);
  this._grids = [];
  this._dirty = [];
};

rll.Actor = function(point) {
  this._point = point;
};

rll.Actor.prototype.draw = function(display) {
  display.write(this._point, '@', '#088');
};

rll.Actor.prototype.move = function(direction) {
  this._point = this._point.add(direction);
};

var App = {
  _display: new rll.Display(),
  _player: new rll.Actor(new rll.Point(1, 2)),

  run: function() {
    this._display.initialize();
    document.body.appendChild(this._display.getCanvas());
    window.addEventListener('keydown', this);
    this.drawMap();
  },

  drawMap: function() {
    for (var x=0; x < 10; x++) {
      for (var y=0; y < 10; y++) {
        this._display.write(new rll.Point(x, y), '.');
      }
    }
    this._display.write(new rll.Point(0, 0), 'hello 世界', '#0c0');
    this._display.write(new rll.Point(2, 3), 'こんにちわ world', '#cc0');
    this._player.draw(this._display);
  },

  handleEvent: function(e) {
    var key = String.fromCharCode(e.keyCode).toLowerCase();
    if (key == 'h') {
      this._player.move(new rll.Point(-1, 0));
    } else if (key == 'l') {
      this._player.move(new rll.Point( 1, 0));
    } else if (key == 'k') {
      this._player.move(new rll.Point( 0,-1));
    } else if (key == 'j') {
      this._player.move(new rll.Point( 0, 1));
    } else if (key == 'r') {
      this._display.clear();
    } else {
      return;
    }
    this.drawMap();
  },
};

App.run();
