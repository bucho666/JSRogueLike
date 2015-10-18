/*global rll*/
rll.TerrainMap = function(size) {
  this._terrain = [];
  for (var y=0, h=size.height(); y<h; y++) {
    this._terrain[y] = [];
    for (var x=0, w=size.width(); x<w; x++) {
      this._terrain[y][x] = rll.Terrain.WALL;
    }
  }
};

rll.TerrainMap.prototype.get = function(point) {
  if (this._terrain[point.y()] === undefined) return undefined;
  return this._terrain[point.y()][point.x()];
};

rll.TerrainMap.prototype.set = function(new_terrain, point) {
  this._terrain[point.y()][point.x()] = new_terrain;
};

rll.TerrainMap.prototype.draw = function(display, point) {
  this._terrain[point.y()][point.x()].draw(display, point);
};

rll.TerrainMap.prototype.walkableAt = function(point) {
  var t = this.get(point);
  if (t === undefined) return false;
  return t.walkable();
};

rll.TerrainMap.prototype.downableAt = function(point) {
  return this.get(point) === rll.Terrain.DOWN_STAIRS;
};

rll.TerrainMap.prototype.randomWalkablePoint = function() {
  var h = this._terrain.length;
  var w = this._terrain[0].length;
  while(true) {
    var p = new rll.Point(rll.random(0, w-1), rll.random(0, h-1));
    if (this.walkableAt(p)) return p;
  }
};

rll.TerrainMap.prototype.closedDoorAt = function(point) {
  return this.get(point) === rll.Terrain.CLOSED_DOOR;
};

rll.TerrainMap.prototype.openedDoorAt = function(point) {
  return this.get(point) === rll.Terrain.OPENED_DOOR;
};

rll.TerrainMap.prototype.closeDoorAt = function(point) {
  this._terrain[point.y()][point.x()] = rll.Terrain.CLOSED_DOOR;
};

rll.TerrainMap.prototype.openDoorAt = function(point) {
  this._terrain[point.y()][point.x()] = rll.Terrain.OPENED_DOOR;
};

rll.Stage = function(size, floor) {
  this._floor = floor;
  this._terrain = new rll.TerrainMap(size);
  this._actors = [];
  this._item = {};
};

rll.Stage.prototype.item = function(point) {
  return this._item[point];
};

rll.Stage.prototype.putItem = function(item, point) {
  this._item[point] = item;
};

rll.Stage.prototype.pickupItem = function(point) {
  var item = this._item[point];
  delete this._item[point];
  return item;
};

rll.Stage.prototype.terrain = function(point) {
  return this._terrain.get(point);
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

rll.Stage.prototype.draw = function(display, point) {
  var a = this.findActor(point), item;
  if (a) {
    a.draw(display);
    return;
  }
  item = this.item(point);
  if (item) {
    item.draw(display, point);
    return;
  }
  this._terrain.draw(display, point);
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

rll.Stage.prototype.closedDoorAt = function(point) {
  return this._terrain.closedDoorAt(point);
};

rll.Stage.prototype.closeDoorAt = function(point) {
  this._terrain.closeDoorAt(point);
};

rll.Stage.prototype.openedDoorAt = function(point) {
  return this._terrain.openedDoorAt(point);
};

rll.Stage.prototype.openDoorAt = function(point) {
  this._terrain.openDoorAt(point);
};

rll.Stage.prototype.actorsAction = function() {
  this.forEachActor(function(actor){
    actor.action();
  });
};


