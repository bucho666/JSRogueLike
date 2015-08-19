
var Point = function(x, y) {
  this._x = x;
  this._y = y;
};

Point.prototype.x = function() {
  return this._x;
};

Point.prototype.y = function() {
  return this._y;
};

Point.prototype.add = function(other) {
  var x = this.x() + other.x();
  var y = this.y() + other.y();
  return new Point(x, y);
};

Point.prototype.toString = function() {
  return this.x() + ':' + this.y();
};

Point.RIGHT = new Point(1, 0);

var Font = function(family, size) {
  this._fontFamily = family;
  this._fontSize = size;
};

Font.prototype.toString = function() {
  return this._fontSize + 'px ' + this._fontFamily;
};

Font.prototype.size = function() {
  return this._fontSize;
};

var Size = function(width, height) {
  this._width = width;
  this._height = height;
};

Size.prototype.width = function() {
  return this._width;
};

Size.prototype.height = function() {
  return this._height;
};

Size.prototype.multiply = function(other) {
  var w = this.width()  * other.width();
  var h = this.height() * other.height();
  return new Size(w, h);
};

var Character = function(glyph, color) {
  this._glyph = glyph;
  this._color = color;
};

Character.prototype.glyph = function() {
  return this._glyph;
};

Character.prototype.color = function() {
  return this._color;
};

Character.prototype.equal = function(other) {
  return (this._glyph == other._glyph &&
          this._color == other._color);
};

var Grid = function(point, ch) {
  this._point = point;
  this._character = ch;
};

Grid._size = null;
Grid._backGroundColor = '#000';

Grid.setSize = function(newSize) {
  Grid._size = newSize;
};

Grid.prototype.equal = function(other) {
  return this._character.equal(other._character);
};

Grid.prototype.draw = function(context) {
  var w = Grid._size.width();
  var h = Grid._size.height();
  var x = this._point.x() * w;
  var y = this._point.y() * h;
  context.fillStyle = Grid._backGroundColor;
  context.fillRect(x, y, w, h);
  context.fillStyle = this._character.color();
  context.fillText(this._character.glyph(), x, y);
};

var Display = function() {
  this._context = null;
  this._font = new Font('Courier New', 15);
  this._size = new Size(80, 25);
  this._grids = {};
  this._dirty = {};
};

Display.prototype.initialize = function() {
  var canvas = document.createElement('canvas');
  this._context = canvas.getContext('2d');
  this._setupFont();
  this._computeCanvasSize();
  this.clear();
};

Display.prototype._setupFont = function() {
  this._context.font = this._font.toString();
  this._context.textAlign    = 'left';
  this._context.textBaseline = 'top';
};

Display.prototype._computeCanvasSize = function() {
  var charWidth = Math.ceil(this._context.measureText('W').width);
  var gridSize = new Size(charWidth, this._font.size());
  var canvasSize = this._size.multiply(gridSize);
  Grid.setSize(gridSize);
  this._context.canvas.width = canvasSize.width();
  this._context.canvas.height = canvasSize.height();
  this._setupFont();
};

Display.prototype.getCanvas = function() {
  return this._context.canvas;
};

Display.prototype.write = function(point, string, color) {
  var write_color = color || '#ccc';
  // TODO 2byte文字対応
  for (var i=0; i < string.length; i++) {
    this._write(point, string[i], write_color);
    point = point.add(Point.RIGHT);
  }
};

Display.prototype._write = function(point, glyph, color) {
  var key = point.toString();
  var grid = new Grid(point, new Character(glyph, color));
  if (key in this._dirty && this._dirty[key].equal(grid)) {
    return;
  }
  this._dirty[key] = grid;
};

Display.prototype.flush = function() {
  for (var key in this._dirty) {
    if (key in this._grids && this._grids[key].equal(this._dirty[key])) {
      continue;
    }
    this._dirty[key].draw(this._context);
    this._grids[key] = this._dirty[key];
  }
  this._dirty = {};
};

Display.prototype.clear = function() {
  var w = this._context.canvas.width;
  var h = this._context.canvas.height;
  this._context.fillStyle = Grid._backGroundColor;
  this._context.fillRect(0, 0, w, h);
};

var Actor = function(point) {
  this._point = point;
};

Actor.prototype.draw = function(display) {
  display.write(this._point, '@', '#088');
};

Actor.prototype.move = function(direction) {
  this._point = this._point.add(direction);
};

var App = {
  _display: new Display(),
  _player: new Actor(new Point(1, 2)),

  run: function() {
    this._display.initialize();
    document.body.appendChild(this._display.getCanvas());
    window.addEventListener('keydown', this);
    this.drawMap();
    this._display.flush();
  },

  drawMap: function() {
    for (var x=0; x < 10; x++) {
      for (var y=0; y < 10; y++) {
        this._display.write(new Point(x, y), '.');
      }
    }
    this._display.write(new Point(0, 0), 'hello 世界', '#0c0');
    this._player.draw(this._display);
  },

  handleEvent: function(e) {
    var key = String.fromCharCode(e.keyCode).toLowerCase();
    if (key == 'h') {
      this._player.move(new Point(-1, 0));
    } else if (key == 'l') {
      this._player.move(new Point( 1, 0));
    } else if (key == 'k') {
      this._player.move(new Point( 0,-1));
    } else if (key == 'j') {
      this._player.move(new Point( 0, 1));
    } else {
      return;
    }
    this.drawMap();
    this._display.flush();
  },
};

App.run();
