/*global rll, document, window*/
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

rll.Character = function(glyph, color, backgroundColor) {
  this._glyph = glyph;
  this._color = color;
  this._backgroundColor = backgroundColor || '#000';
  this._dark = null;
};

rll.Character.prototype.glyph = function() {
  return this._glyph;
};

rll.Character.prototype.color = function() {
  return this._color;
};

rll.Character.prototype.backgroundColor = function() {
  return this._backgroundColor;
};

rll.Character.prototype.equal = function(other) {
  return (this._glyph == other._glyph &&
          this._color == other._color &&
          this._backgroundColor == other.backgroundColor);
};

rll.Character.prototype.code = function() {
  return this._glyph.charCodeAt(0);
};

rll.Character.prototype.draw = function(point, display) {
  display.fillStyle = this._color;
  display.fillText(this._glyph, point.x(), point.y());
};

rll.Character.prototype.darkMask = parseInt('00f', 16);
rll.Character.prototype.dark = function() {
  if (this._dark) return this._dark;
  var n = parseInt(this._color.substr(1), 16);
  var r = (n >> 8 & this.darkMask);
  var g = (n >> 4 & this.darkMask);
  var b = (n & this.darkMask);
  r = Math.floor(r * 0.8);
  g = Math.floor(g * 0.8);
  b = Math.floor(b * 0.8);
  var darkColor = '#' + r.toString(16) + g.toString(16)+ b.toString(16);
  this._dark = new rll.Character(this._glyph, darkColor);
  return this._dark;
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
rll.Grid.prototype._wideFont = new rll.Font('Osaka', 12);
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
  var cc = new rll.CharacterCode(this._character.code());
  var isWide = cc.isWide();
  if (isWide) w *= 2;
  context.fillStyle = this._character.backgroundColor();
  context.fillRect(x, y, w, h);
  context.fillStyle = this._character.color();
  var orgFont = context.font;
  if (isWide) {
    context.font = this._wideFont.toString();
    y += 1;
  }
  context.fillText(this._character.glyph(), x, y);
  context.font = orgFont;
};

rll.Display = function() {
  this._context = null;
  this._font = new rll.Font('Courier New, Osaka', 15);
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

rll.Display.prototype.write = function(point, string, color, backgroundColor) {
  var write_color = color || '#ccc', cc;
  for (var i=0; i<string.length; i++) {
    this._write(point, string[i], write_color, backgroundColor);
    point = point.add(rll.Direction.RIGHT);
    cc = new rll.CharacterCode(string.charCodeAt(i));
    if (cc.isWide() === false) continue;
    this._clearCache(point);
    point = point.add(rll.Direction.RIGHT);
  }
};

rll.Display.prototype._clearCache = function(point) {
  if (point in this._dirty) delete this._dirty[point];
  if (point in this._grids) delete this._grids[point];
};

rll.Display.prototype._write = function(point, glyph, color, backgroundColor) {
  var grid = new rll.Grid(point, new rll.Character(glyph, color, backgroundColor));
  if (point in this._dirty && this._dirty[point].equal(grid)) {
    return;
  }
  this._dirty[point] = grid;
};

rll.Display.prototype.flush = function() {
  window.requestAnimationFrame(this.flush);
  if (Object.keys(this._dirty).isEmpty()) return;
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
  this._context.fillStyle = rll.Grid._backgroundColor;
  this._context.fillRect(0, 0, w, h);
  this._grids = {};
  this._dirty = {};
};

rll.Display.prototype.clearLine = function(y) {
  for(var x=0, len=this._size.width(); x<len; x++) {
    this.write(new rll.Point(x, y), ' ');
  }
};
