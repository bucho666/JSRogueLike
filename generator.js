/* global rll, inherit*/
rll.Room = function(size, point) {
  rll.Rect.call(this, size, point);
};
inherit(rll.Room, rll.Rect);

rll.Room.prototype.randomSideOf = function(side) {
  var x, y;
  switch (side) {
    case rll.Direction.N:
      x = rll.random(this.x() + 1, this.x() + this.width() - 3);
      x = (x % 2) ? x : x+1;
      y = this.y();
      break;
    case rll.Direction.S:
      x = rll.random(this.x() + 1, this.x() + this.width() - 3);
      x = (x % 2) ? x : x+1;
      y = this.y()+this.height()-1;
      break;
    case rll.Direction.E:
      x = this.x() + this.width()-1;
      y = rll.random(this.y() + 1, this.y() + this.height() - 3);
      y = (y % 2) ? y : y+1;
      break;
    case rll.Direction.W:
      x = this.x();
      y = rll.random(this.y() + 1, this.y() + this.height() - 3);
      y = (y % 2) ? y : y+1;
      break;
  }
  return new rll.Point(x, y);
};


rll.Region = function(size) {
  this._rects = [new rll.Rect(size.contraction(2), new rll.Point(1, 1))];
  this._size = size;
};

rll.Region.prototype.size = function() {
  return this._size;
};

rll.Region.prototype.number = function() {
  return this._rects.length;
};

rll.Region.prototype.splitVertical = function(minimum) {
  var target = this.biggest(),
      splitedRect = [],
      value;
  if (target.width() < minimum*2) return;
  value = rll.random(minimum, target.width() - minimum);
  if (value % 2 === 0) value += 1;
  splitedRect = target.splitVertical(value);
  this._rects = this._rects.concat(splitedRect);
  this.remove(target);
};

rll.Region.prototype.splitHorizontal = function(minimum) {
  var target = this.biggest(),
      splitedRect = [],
      value;
  if (target.height() < minimum*2) return;
  value = rll.random(minimum, target.height() - minimum);
  if (value % 2 === 0) value += 1;
  splitedRect = target.splitHorizontal(value);
  this._rects = this._rects.concat(splitedRect);
  this.remove(target);
};

rll.Region.prototype.remove = function(target) {
  this._rects.remove(target);
};

rll.Region.prototype.biggest = function() {
  return this._rects.max(function(r) {
    return r.area();
  });
};

rll.Region.prototype.forEach = function(f, thisObject) {
  this._rects.forEach(f, thisObject);
};

rll.Region.prototype.forEachFrame = function(f, thisObject) {
  this.forEach(function (rect) {
    rect.forEachFrame(f, thisObject);
  });
};

rll.Astar = function(from, to, map) {
  this._from = from;
  this._to = to;
  this._open = [];
  this._close = [];
  this._map = map;
};

rll.Astar.prototype.compute = function() {
  var node, points, i;
  this.addOpen(this._from, null);
  while(this._open.length > 0) {
    node = this._open.min(function(node){
      return node.distance();
    });
    if (node.pointEqual(this._to)) return node;
    points = node.neighbors(this._map);
    points = points.filter(function(point){
      return this.closePointOf(point) === false;
    }, this);
    for(i=0; i < points.length; i++) {
      this.addOpen(points[i], node);
    }
    this._open.remove(node);
    this._close.push(node.point());
  }
  return null;
};

rll.Astar.prototype.closePointOf = function(point) {
  for (var i=0; i<this._close.length; i++) {
    if (this._close[i].equal(point)) return true;
  }
  return false;
};

rll.Astar.prototype.addOpen = function(point, prev) {
  var node = new rll.Astar.Node(point, this._to, prev);
  this._open.push(node);
};

rll.Astar.Node = function(point, to, prev) {
  var distance = point.distance(to);
  this._point = point;
  this._prev = prev;
  this._distance = Math.abs(distance.x()) + Math.abs(distance.y());
};

rll.Astar.Node.prototype.pointEqual = function(other) {
  return this._point.equal(other);
};

rll.Astar.Node.prototype.forEachRoute = function(f, thisObject) {
  var node = this;
  while (node !== null) {
    f.call(thisObject, node.point());
    node = node.prev();
  }
};

rll.Astar.Node.prototype.point = function() {
  return this._point;
};

rll.Astar.Node.prototype.prev = function() {
  return this._prev;
};

rll.Astar.Node.prototype.distance = function() {
  return this._distance;
};

rll.Astar.Node.prototype.neighbors = function(map) {
  var points = rll.Direction.CROSS.map(function(dir){
    return this._point.add(dir);
  }, this);
  return points.filter(function(point){
    return this.get(point);
  }, map);
};

rll.Generator = function(size) {
  this._region = new rll.Region(size);
  this._rooms = [];
  this._door = [];
  this._corridor = [];
};

rll.Generator.prototype.REGION_MIN_SIZE = new rll.Size(9, 7);
rll.Generator.prototype.EXTEND_CONNECT_MAX = 3;
rll.Generator.prototype.REGION_MIN = 7;
rll.Generator.prototype.REGION_MAX = 9;
rll.Generator.prototype.ROOM_WIDTH_MAX = 13;
rll.Generator.prototype.ROOM_WIDTH_MIN = 9;
rll.Generator.prototype.ROOM_HEIGHT_MAX = 11;
rll.Generator.prototype.ROOM_HEIGHT_MIN = 5;

rll.Generator.prototype.forEachInsideRoom = function(f, thisObject) {
  this._rooms.forEach(function(room) {
    room.forEachInside(this);
  }, f.bind(thisObject));
};

rll.Generator.prototype.forEachDoor = function(f, thisObject) {
  this._door.forEach(f, thisObject);
};

rll.Generator.prototype.forEachCorridor = function(f, thisObject) {
  this._corridor.forEach(f, thisObject);
};


rll.Generator.prototype.generate = function() {
  this.spliteRegions();
  this.makeRooms();
  this.connectRooms();
};

rll.Generator.prototype.spliteRegions = function() {
  var vertical = true;
  var regionMin = rll.random(this.REGION_MIN, this.REGION_MAX);
  while(this._region.number() < regionMin) {
    if (vertical) {
      this._region.splitVertical(this.REGION_MIN_SIZE.width());
    } else {
      this._region.splitHorizontal(this.REGION_MIN_SIZE.height());
    }
    vertical = !vertical;
  }
};

rll.Generator.prototype.connectRooms = function() {
  var unconnected = this._rooms.concat(),
      map = this.makeRegionFrameMap(),
      fromRoom = unconnected.randomChoice(),
      extend = rll.random(0, this.EXTEND_CONNECT_MAX),
      toRoom;
  while (unconnected.length > 1) {
    unconnected.remove(fromRoom);
    toRoom = unconnected.randomChoice();
    this.connectRoom(fromRoom, toRoom, map);
    fromRoom = toRoom;
  }
  while(extend--) {
    fromRoom = this._rooms.randomChoice();
    toRoom = this._rooms.randomChoice();
    if (fromRoom === toRoom) continue;
    this.connectRoom(fromRoom, toRoom, map);
  }
};

rll.Generator.prototype.makeRegionFrameMap = function() {
  var map = new rll.Array2D(this._region.size(), false);
  this._region.forEachFrame(function(point) {
    this.set(true, point);
  }, map);
  return map;
};

rll.Generator.prototype.connectRoom = function(fromRoom, toRoom, map) {
  var fromCenter = fromRoom.center(),
      toCenter = toRoom.center(),
      fromDir = fromCenter.crossDirectionToAtRandom(toCenter),
      toDir = toCenter.crossDirectionToAtRandom(fromCenter),
      fromPoint = this.makeCorridorToRegionFrame(fromRoom, map, fromDir),
      toPoint = this.makeCorridorToRegionFrame(toRoom, map, toDir),
      astar = new rll.Astar(fromPoint, toPoint, map),
      node = astar.compute();
  node.forEachRoute(function(point){
    this.push(point);
  }, this._corridor);
};

rll.Generator.prototype.makeCorridorToRegionFrame = function(
    room, map, side){
  var point = room.randomSideOf(side);
  this._door.push(point);
  while(map.get(point) === false) {
    point = point.add(side);
    this._corridor.push(point);
  }
  return point;
};

rll.Generator.prototype.makeRooms = function() {
  this._region.forEach(function(rect) {
    var max = rect.contraction(2).move(new rll.Point(1, 1)),
    maxWidth = Math.min(max.width() - 1, this.ROOM_WIDTH_MAX),
    maxHeight= Math.min(max.height() - 1, this.ROOM_HEIGHT_MAX),
    width = rll.random(this.ROOM_WIDTH_MIN, maxWidth),
    height = rll.random(this.ROOM_HEIGHT_MIN, maxHeight),
    x = rll.random(max.x(), max.x() + (maxWidth - width) + 1),
    y = rll.random(max.y(), max.y() + (maxHeight - height) + 1),
    size, point;
    x = this.evan(x);
    y = this.evan(y);
    width = this.odd(width);
    height = this.odd(height);
    size = new rll.Size(width, height);
    point = new rll.Point(x, y);
    this._rooms.push(new rll.Room(size, point));
  }, this);
};

rll.Generator.prototype.evan = function(n) {
  return n % 2 ? n - 1: n;
};

rll.Generator.prototype.odd = function(n) {
  return n % 2 ? n : n - 1;
};

rll.Generator.prototype.draw = function(display) {
  this._rooms.forEach(function(room) {
    room.forEachFrame(function(point) {
      this.write(point, '#');
    }, this);
  }, display);
  this._door.forEach(function(point) {
      this.write(point, '+');
  }, display);
  this._corridor.forEach(function(point) {
      this.write(point, '.');
  }, display);
};
