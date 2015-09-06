var inherit = function(child, parent) {
  var F = function(){};
  F.prototype = parent.prototype;
  child.prototype = new F();
  child.prototype.constructer = child;
};

var rll = rll || {};

rll.key = {
  SPACE: 32,
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

rll.State = function(value) {
  this._current = value;
  this._max = value;
};

rll.State.prototype.current = function() {
  return this._current;
};

rll.State.prototype.add = function(value) {
  this._current += value;
  if (this._current > this._max) {
    this._current = this._max;
  }
};

rll.State.prototype.addMax = function(value) {
  this._max += max;
};

rll.State.prototype.toString = function() {
  return this._current + '(' + this._max + ')';
};

rll.Actor = function(character, name) {
  this._point = new rll.Point(0, 0);
  this._character = character;
  this._action = { compute: function(){} };
  this._name = name;
  this._hp = new rll.State(8);
  this._level = 1;
  this._AC = 8;
};

rll.Actor.prototype.setHP = function(hp) {
  this._hp = new rll.State(hp);
};

rll.Actor.prototype.damage = function(damage) {
  this._hp.add(-damage);
};

rll.Actor.prototype.heal = function(hp) {
  this._hp.add(hp);
};

rll.Actor.prototype.isDead = function() {
  return this._hp.current() < 1;
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

rll.Actor.prototype.isNextTo = function(point) {
  return this._point.isNextTo(point);
};

rll.Actor.prototype.drawStatusLine = function(point, display) {
  display.write(point, 'hp:' + this._hp);
};

rll.Actor.prototype.toHit = function() {
  return this._level;
};

rll.Actor.prototype.AC = function() {
  return this._AC;
};

rll.Player = function(character, name) {
  rll.Actor.call(this, character, name);
  this.setAction(new rll.Player.AutoHeal(this));
};
inherit(rll.Player, rll.Actor);

rll.Player.AutoHeal = function(actor) {
  this._actor = actor;
};

rll.Player.AutoHeal.prototype.compute = function() {
  if (rll.random(0, 7) == 1) {
    this._actor.heal(1);
  }
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

rll.Terrain.DOWN_STAIRS = new rll.Terrain({
  character: '>',
  color:'#ccc',
  walkable: true,
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

rll.TerrainMap.prototype.downableAt= function(point) {
  return this._terrain[point.y()][point.x()] == rll.Terrain.DOWN_STAIRS;
};

rll.TerrainMap.prototype.randomWalkablePoint = function() {
  h = this._terrain.length;
  w = this._terrain[0].length;
  while(true) {
    p = new rll.Point(rll.random(0, w-1), rll.random(0, h-1));
    if (this.walkableAt(p)) return p;
  }
};

rll.Stage = function(size, floor) {
  this._terrain = new rll.TerrainMap(size);
  this._actors = new rll.List();
  this._floor = floor;
};

rll.Stage.prototype.floor = function() {
  return this._floor;
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

rll.Stage.prototype.removeActor = function(actor) {
  this._actors.remove(actor);
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

rll.Stage.prototype.walkableAt = function(point) {
  if (this.findActor(point)) return false;
  if (this._terrain.walkableAt(point) === false) return false;
  return true;
};

rll.Stage.prototype.downableAt = function(point) {
  return this._terrain.downableAt(point);
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
  if (actor.isNextTo(playerPoint)) {
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

rll.AI.prototype.attackToPlayer = function(actor, player) {
  var attack = new game.MeleeAttack(actor, player);
  if (attack.isHit() === false) {
    this._game.message(actor.name() + 'の攻撃をかわした!');
    return;
  }
  var damage = attack.damage();
  this._game.message(actor.name() + 'の攻撃が命中 ' + damage + 'のダメージ!!');
  if (player.isDead() === false) return;
  this._game.message('あなたは死んだ…');
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
    var to = actor.movedPoint(dir);
    if (stage.walkableAt(to)) {
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
    if (stage.walkableAt(actor.movedPoint(dir))) {
      directions.push(dir);
    }
  }
  actor.move(directions.choice());
};

rll.Messages = function() {
  this._messages = [];
  this._current = '';
};

rll.Messages.prototype.add = function(message) {
  var width = 0,
      start = 0,
      i;
  this._current += message;
  for (i=0; i<this._current.length; i++) {
    cc = new rll.CharacterCode(this._current.charCodeAt(i));
    width += cc.isWide() ? 2 : 1;
    if (width >= 70) {
      this._messages.push(this._current.slice(start, i));
      start = i;
      width = 0;
    }
  }
  this._current = this._current.slice(start, i);
};

rll.Messages.prototype.draw = function(display) {
  if (this._current.length > 0) {
    this._messages.push(this._current);
    this._current = '';
  }
  if (this.isEmpty()) return;
  var message = this._messages.shift();
  if (this.isEmpty() === false) message += ' -- more --';
  display.clearLine(0);
  display.write(new rll.Point(0, 0), message, '#ccc');
};

rll.Messages.prototype.isEmpty = function() {
  return this._messages.length === 0;
};

rll.KeyEvent = function() {
  this._current = null;
};

rll.KeyEvent.prototype.set = function(newEvent) {
  this.clear();
  window.addEventListener('keydown', newEvent);
  this._current = newEvent;
};

rll.KeyEvent.prototype.current = function() {
  return this._current;
};

rll.KeyEvent.prototype.clear = function() {
  window.removeEventListener('keydown', this._current);
};

// TODO
// MonsterCreator
// モンスターの強さを変える
// HitDiceの概念
// Goblin AC:6 HD:1-1 damage:1d6
// Orc    AC:6 HD:1 damage:1d6

// TODO 以上ができたら仮公開

rll.Dice = function(dice) {
  var result = /(\d+)d(\d+)([+-])(\d+)/.exec(dice);
  if (result === null) result = /(\d+)d(\d+)/.exec(dice);
  if (result === null) throw 'Dice: invalid arguments: ' + dice;
  this._num = parseInt(result[1]);
  this._faces = parseInt(result[2]);
  this._adjust = 0;
  if (result.length !== 5) return;
  this._adjust = parseInt(result[4]);
  if (result[3] === '-') this._adjust *= -1;
};

rll.Dice.prototype.roll = function() {
  var roll = 0;
  for (var c=0; c<this._num; c++) {
    roll += rll.random(1, this._faces);
  }
  return roll + this._adjust;
};

var game = game || {};

game.keyEvent = new rll.KeyEvent();

game.Game = function() {
  this._display = new rll.Display();
  this._player  = new rll.Player(new rll.Character('@', '#fff'), 'player');
  this._stage   = new rll.Stage(new rll.Size(80, 21), 0);
  this._messages = new rll.Messages();
};

game.Game.prototype._dirKey = {};
game.Game.prototype._dirKey[rll.key.H] = rll.Direction.W;
game.Game.prototype._dirKey[rll.key.L] = rll.Direction.E;
game.Game.prototype._dirKey[rll.key.K] = rll.Direction.N;
game.Game.prototype._dirKey[rll.key.J] = rll.Direction.S;
game.Game.prototype._dirKey[rll.key.Y] = rll.Direction.NW;
game.Game.prototype._dirKey[rll.key.U] = rll.Direction.NE;
game.Game.prototype._dirKey[rll.key.B] = rll.Direction.SW;
game.Game.prototype._dirKey[rll.key.N] = rll.Direction.SE;
game.Game.prototype._dirKey[rll.key.PERIOD] = rll.Direction.HERE;

game.Game.prototype._dirKey[rll.key.NUMPAD4] = rll.Direction.W;
game.Game.prototype._dirKey[rll.key.NUMPAD6] = rll.Direction.E;
game.Game.prototype._dirKey[rll.key.NUMPAD8] = rll.Direction.N;
game.Game.prototype._dirKey[rll.key.NUMPAD2] = rll.Direction.S;
game.Game.prototype._dirKey[rll.key.NUMPAD7] = rll.Direction.NW;
game.Game.prototype._dirKey[rll.key.NUMPAD9] = rll.Direction.NE;
game.Game.prototype._dirKey[rll.key.NUMPAD1] = rll.Direction.SW;
game.Game.prototype._dirKey[rll.key.NUMPAD3] = rll.Direction.SE;
game.Game.prototype._dirKey[rll.key.NUMPAD5] = rll.Direction.HERE;

game.Game.prototype.stage = function() {
  return this._stage;
};

game.Game.prototype.player = function() {
  return this._player;
};

game.Game.prototype.run = function() {
  this._display.initialize();
  document.body.appendChild(this._display.getCanvas());
  game.keyEvent.set(this);
  this.newLevel();
  this.draw();
};

game.Game.prototype.newLevel = function() {
  var newFloor = this._stage.floor() + 1;
  this._stage = new rll.Stage(new rll.Size(80, 21), newFloor);
  var digger = new ROT.Map.Digger(79, 20);
  var callBack = function(x, y, value) {
    if (value) { return; }
    this._stage.setTerrain(rll.Terrain.FLOOR, new rll.Point(x, y));
  };
  digger.create(callBack.bind(this));
  this._stage.setTerrain(rll.Terrain.DOWN_STAIRS,
      this._stage.randomWalkablePoint());
  this._player.setPoint(this._stage.randomWalkablePoint());
  this._stage.addActor(this._player);
  var monsterNum = 2 + parseInt(this._stage.floor() / 3);
  for (var i=0; i<monsterNum; i++) {
    if (rll.random(0, 1) == 1) {
      var orc = new rll.Actor(new rll.Character('o', '#0f0'), 'オーク');
      orc.setPoint(this._stage.randomWalkablePoint());
      orc.setAction(new rll.AI(this));
      this._stage.addActor(orc);
    } else {
      var goblin = new rll.Actor(new rll.Character('g', '#66f'), 'ゴブリン');
      goblin.setPoint(this._stage.randomWalkablePoint());
      goblin.setAction(new rll.AI(this));
      this._stage.addActor(goblin);
    }
  }
};

game.Game.prototype.draw = function() {
  for (var y=0; y<21; y++) {
    for (var x=0; x<80; x++) {
      this._stage.draw(new rll.Point(x, y), this._display);
    }
  }
  this._player.drawStatusLine(new rll.Point(0, 21), this._display);
  this._display.write(new rll.Point(71, 21), 'floor:'+this._stage.floor());
  this._messages.draw(this._display);
  if (this._messages.isEmpty() === false) {
    new game.More(this._messages, this._display);
  }
};

game.Game.prototype.message = function(message) {
  this._messages.add(message);
};

game.Game.prototype.handleEvent = function(e) {
  if (this._player.isDead()) return;
  var key = e.keyCode,
      onShift = e.shiftKey;
  if (onShift && key === rll.key.PERIOD) {
    if (this._stage.downableAt(this._player.point())) {
      this.newLevel();
    }
  } else if (key in this._dirKey) {
    if (this.movePlayer(this._player, this._dirKey[key])) {
      this.actorsAction();
    }
  } else {
    return;
  }
  this.draw();
};

game.Game.prototype.actorsAction = function() {
  this._stage.forEachActor(function(actor){
    actor.action();
  });
};

game.Game.prototype.movePlayer = function(actor, direction) {
  if (direction.equal(rll.Direction.HERE)) return true;
  var to = actor.movedPoint(direction);
  var monster = this._stage.findActor(to);
  if (monster) {
    this.attackToMonster(monster);
    return true;
  }
  if (this._stage.walkableAt(actor.movedPoint(direction)) === false) {
    return false;
  }
  actor.move(direction);
  return true;
};

game.Game.prototype.attackToMonster = function(monster) {
  var attack = new game.MeleeAttack(this._player, monster);
  if (attack.isHit() === false) {
    this.message(monster.name() + 'にかわされた!');
    return;
  }
  var damage = attack.damage();
  this.message(monster.name() + 'に命中 ' + damage + 'のダメージ!');
  if (monster.isDead() === false) return;
  this.message(monster.name() + 'をたおした!!');
  this._stage.removeActor(monster);
};

game.MeleeAttack = function(attaker, defender) {
  this._attaker = attaker;
  this._defender = defender;
};

game.MeleeAttack.prototype.isHit = function() {
  var rolls = rll.random(1, 20);
  return rolls < (this._defender.AC() - this._attaker.toHit());
};

game.MeleeAttack.prototype.damage = function() {
  var damagePoint = rll.random(1, 8);
  this._defender.damage(damagePoint);
  return damagePoint;
};

game.More = function(messages, display) {
  this._messages = messages;
  this._display = display;
  this._beforeEvent = game.keyEvent.current();
  game.keyEvent.set(this);
};

game.More.prototype.handleEvent = function(e) {
  if (e.keyCode != rll.key.SPACE) return;
  this._messages.draw(this._display);
  if (this._messages.isEmpty()) {
    game.keyEvent.set(this._beforeEvent);
  }
};

(function() {
  var newGame = new game.Game();
  newGame.run();
})();
