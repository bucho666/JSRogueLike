/*global rll, inherit*/
rll.Terrain = function(property) {
  var ch = new rll.Character(property.character, property.color);
  rll.Entity.call(this, ch, property.name);
  this._walkable = property.walkable;
};
inherit(rll.Terrain, rll.Entity);

rll.Terrain.FLOOR = new rll.Terrain({
  character: '.',
  color: '#080',
  walkable: true,
  });

rll.Terrain.WALL = new rll.Terrain({
  character: '#',
  color:'#840',
  walkable: false,
  });

rll.Terrain.DOWN_STAIRS = new rll.Terrain({
  character: '>',
  color:'#ccc',
  walkable: true,
  });

rll.Terrain.prototype.walkable = function() {
  return this._walkable;
};
