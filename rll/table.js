var rll = rll || {};

rll.Table = function() {
  this._items = {};
};

rll.Table.prototype.setTable = function(level, items) {
  this._items[level] = items;
};

rll.Table.prototype.choiceAtRandom = function(level) {
  var list = [];
  for (var l = 0; l <= level; l++) {
    if (this._items[l] === undefined) continue;
    list = list.concat(this._items[l]);
  }
  return list.choiceAtRandom();
};
