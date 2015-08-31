var rll = rll || {};

var inherit = function(child, parent) {
  var F = function(){};
  F.prototype = parent.prototype;
  child.prototype = new F();
  child.prototype.constructer = child;
};

rll.random = function(min, max) {
  return min + Math.floor(Math.random() * (max - min));
};

rll.List = function() {
  Array.apply(this);
  for(var i = 0; i<arguments.length; i++) {
    this.push(arguments[i]);
  }
};
inherit(rll.List, Array);

rll.List.prototype.choice = function() {
  var index = rll.random(0, this.length);
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

rll.Direction = {};
rll.Direction.UP    = new rll.Point( 0, -1);
rll.Direction.DOWN  = new rll.Point( 0,  1);
rll.Direction.LEFT  = new rll.Point(-1,  0);
rll.Direction.RIGHT = new rll.Point( 1,  0);

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

rll.Character.prototype.draw = function(point, display) {
  display.fillStyle = this._color;
  display.fillText(this._glyph, point.x(), point.y());
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
  var cc = new rll.CharacterCode(this._character.code());
  if (cc.isWide()) w *= 2;
  context.fillStyle = rll.Grid._backGroundColor;
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
  var write_color = color || '#ccc', cc;
  for (var i=0; i<string.length; i++) {
    this._write(point, string[i], write_color);
    point = point.add(rll.Direction.RIGHT);
    cc = new rll.CharacterCode(string.charCodeAt(i));
    if (cc.isWide() === false) continue;
    this._clearCache(point);
    point = point.add(rll.Direction.RIGHT);
  }
};

rll.Display.prototype._clearCache = function(point) {
  var key = point.toString();
  if (key in this._dirty) delete this._dirty[key];
  if (key in this._grids) delete this._grids[key];
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
  this._grids = {};
  this._dirty = {};
};

rll.Display.prototype.clearLine = function(y) {
  for(var x=0, len=this._size.width(); x<len; x++) {
    this.write(new rll.Point(x, y), ' ');
  }
};

rll.Actor = function(character, name) {
  this._point = new rll.Point(0, 0);
  this._character = character;
  this._action = { compute: function(){} };
  this._name = name;
};

rll.Actor.prototype.name = function() {
  return this._name;
};

rll.Actor.prototype.lineTo = function(from) {
  return from.lineTo(this._point);
};

rll.Actor.prototype.point = function() {
  return this._point;
};

rll.Actor.prototype.directionsTo = function(point) {
  return this._point.directionsTo(point);
};

rll.Actor.prototype.setAction = function(newAction) {
  this._action = newAction;
};

rll.Actor.prototype.action = function() {
  this._action.compute(this);
};

rll.Actor.prototype.draw = function(display) {
  display.write(this._point,
      this._character.glyph(),
      this._character.color());
};

rll.Actor.prototype.move = function(direction) {
  this._point = this._point.add(direction);
};

rll.Actor.prototype.movedPoint = function(direction) {
  return this._point.add(direction);
};

rll.Actor.prototype.setPoint = function(point) {
  this._point = point;
};

rll.Actor.prototype.on = function(point) {
  return this._point.equal(point);
};

rll.Terrain = function(property) {
  this._character = new rll.Character(property.character, property.color);
  this._walkable = property.walkable;
};

rll.Terrain.FLOOR = new rll.Terrain({
  character: '.',
  color:'#ccc',
  walkable: true,
  });

rll.Terrain.WALL = new rll.Terrain({
  character: '#',
  color:'#ccc',
  walkable: false,
  });

rll.Terrain.prototype.draw = function(point, display) {
  display.write(point, this._character.glyph(), this._character.color());
};

rll.Terrain.prototype.walkable = function() {
  return this._walkable;
};

rll.TerrainMap = function(size) {
  this._terrain = [];
  for (var y=0, h=size.height(); y<h; y++) {
    this._terrain[y] = [];
    for (var x=0, w=size.width(); x<w; x++) {
      this._terrain[y][x] = rll.Terrain.WALL;
    }
  }
};

rll.TerrainMap.prototype.draw = function(point, display) {
  this._terrain[point.y()][point.x()].draw(point, display);
};

rll.TerrainMap.prototype.set = function(new_terrain, point) {
  this._terrain[point.y()][point.x()] = new_terrain;
};

rll.TerrainMap.prototype.walkableAt = function(point) {
  return this._terrain[point.y()][point.x()].walkable();
};

rll.TerrainMap.prototype.randomWalkablePoint = function() {
  h = this._terrain.length;
  w = this._terrain[0].length;
  while(true) {
    p = new rll.Point(rll.random(0, w), rll.random(0, h));
    if (this.walkableAt(p)) return p;
  }
};

rll.Stage = function(size) {
  this._terrain = new rll.TerrainMap(size);
  this._actors = new rll.List();
};

rll.Stage.prototype.setTerrain = function(terrain, point) {
  this._terrain.set(terrain, point);
};

rll.Stage.prototype.randomWalkablePoint = function() {
  return this._terrain.randomWalkablePoint();
};

rll.Stage.prototype.addActor = function(actor) {
  this._actors.push(actor);
};

rll.Stage.prototype.findActor = function(point) {
  return this._actors.find(function(actor){
    return actor.on(point);
  }.bind(this));
};

rll.Stage.prototype.forEachActor = function(callback, thisObject) {
  this._actors.forEach(callback, thisObject);
};

rll.Stage.prototype.find = function(callback) {
  return this._actors.find(callback);
};

rll.Stage.prototype.draw = function(point, display) {
  var a = this.findActor(point);
  if (a) {
    a.draw(display);
  } else {
    this._terrain.draw(point, display);
  }
};

rll.Stage.prototype.walkable = function(point) {
  if (this.findActor(point)) return false;
  if (this._terrain.walkableAt(point) === false) return false;
  return true;
};

rll.Stage.prototype.passLight = function(point) {
  if (this._terrain.walkableAt(point) === false) return false;
  return true;
};

rll.AI = function(game) {
  this._game = game;
  this._lastDest = null;
};

rll.AI.prototype.compute = function(actor) {
  var stage = this._game.stage();
  var player = this._game.player();
  var playerPoint = player.point();
  if (this._lastDest && actor.on(this._lastDest)) {
    this._lastDest = null;
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

rll.AI.prototype.canSee = function(actor, point) {
  var stage = this._game.stage();
  var line = actor.lineTo(point);
  for (var i=0; i<line.length; i++) {
    if (stage.passLight(line[i]) === false) {
      return false;
    }
  }
  return true;
};

rll.AI.prototype.chase = function(actor, point) {
  var stage = this._game.stage();
  var directions = actor.directionsTo(point);
  for (var i=0; i<directions.length; i++) {
    var dir = directions[i];
    if (stage.walkable(actor.movedPoint(dir))) {
      actor.move(dir);
      return;
    }
  }
};

rll.AI.prototype.randomMove = function(actor) {
  var stage = this._game.stage();
  var directions = new rll.List();
  for (var i=0; i<rll.Direction.AROUND.length; i++) {
    var dir = rll.Direction.AROUND[i];
    if (stage.walkable(actor.movedPoint(dir))) {
      directions.push(dir);
    }
  }
  actor.move(directions.choice());
};

rll.Messages = function() {
  this._messages = [];
};

rll.Messages.prototype.add = function(message) {
  this._messages.unshift(message);
};

rll.Messages.prototype.draw = function(display) {
  if (this._messages.length === 0) return;
  message = this._messages.shift();
  display.clearLine(0);
  display.write(new rll.Point(0, 0), message, '#ccc');
};

var game = game || {};

game.Game = function() {
  this._display = new rll.Display();
  this._player  = new rll.Actor(new rll.Character('@', '#880'));
  this._stage   = new rll.Stage(new rll.Size(80, 21));
  this._messages = new rll.Messages();
  this._dirKey = {
    'h': rll.Direction.W,  'l': rll.Direction.E,
    'k': rll.Direction.N,  'j': rll.Direction.S,
    'y': rll.Direction.NW, 'u': rll.Direction.NE,
    'b': rll.Direction.SW, 'n': rll.Direction.SE
  };
};

game.Game.prototype.stage = function() {
  return this._stage;
};

game.Game.prototype.player = function() {
  return this._player;
};

game.Game.prototype.run = function() {
  this._display.initialize();
  document.body.appendChild(this._display.getCanvas());
  window.addEventListener('keydown', this);
  var digger = new ROT.Map.Digger(79, 20);
  var callBack = function(x, y, value) {
    if (value) { return; }
    this._stage.setTerrain(rll.Terrain.FLOOR, new rll.Point(x, y));
  };
  digger.create(callBack.bind(this));
  this._player.setPoint(this._stage.randomWalkablePoint());
  this._stage.addActor(this._player);
  for (var i=0; i<3; i++) {
    var orc = new rll.Actor(new rll.Character('o', '#0f0'), 'オーク');
    orc.setPoint(this._stage.randomWalkablePoint());
    orc.setAction(new rll.AI(this));
    this._stage.addActor(orc);
    var goblin = new rll.Actor(new rll.Character('g', '#66f'), 'ゴブリン');
    goblin.setPoint(this._stage.randomWalkablePoint());
    goblin.setAction(new rll.AI(this));
    this._stage.addActor(goblin);
  }
  this.draw();
};

game.Game.prototype.draw = function() {
  for (var y=0; y<21; y++) {
    for (var x=0; x<80; x++) {
      this._stage.draw(new rll.Point(x, y), this._display);
    }
  }
  this._messages.draw(this._display);
};

game.Game.prototype.message = function(message) {
  this._messages.add(message);
};
game.Game.prototype.handleEvent = function(e) {
  var key = String.fromCharCode(e.keyCode).toLowerCase();
  if (key in this._dirKey) {
    if (this.moveActor(this._player, this._dirKey[key])) {
      this.actorsAction();
    }
  } else {
    switch (key) {
    case 'r':
      this._display.clear();
      break;
    case 'c':
      this._display.clearLine(0);
      break;
    default:
      return;
    }
  }
  this.draw();
};

game.Game.prototype.actorsAction = function() {
  this._stage.forEachActor(function(actor){
    actor.action();
  });
};

game.Game.prototype.moveActor = function(actor, direction) {
  var to = actor.movedPoint(direction);
  var otherActor = this._stage.findActor(to);
  if (otherActor) {
    this.message(otherActor.name() + 'が居る'); // TODO
  }
  if (this._stage.walkable(actor.movedPoint(direction)) === false) {
    return false;
  }
  actor.move(direction);
  return true;
};

(function() {
  var newGame = new game.Game();
  newGame.run();
})();
