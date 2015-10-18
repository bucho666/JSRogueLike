/* global rll*/
rll.ChooseList = function(limit) {
  this._limit = limit;
  this._items = [];
  this._cursor = 0;
};

rll.ChooseList.prototype.draw = function(display) {
  var backgroundColor;
  for (var y=0; y<this._items.length; y++) {
    backgroundColor = this._cursor === y ? '#080' : '#000';
    display.write(new rll.Point(0, y), this.name(y), '#fff', backgroundColor);
  }
};

rll.ChooseList.prototype.add = function(newItem) {
  this._items.push(newItem);
};

rll.ChooseList.prototype.isEmpty = function() {
  return this._items.isEmpty();
};

rll.ChooseList.prototype.isFull = function() {
  return this._items.length >= this._limit;
};

rll.ChooseList.prototype.nextCursor = function() {
  this._cursor += 1;
  this._adjustCursor();
};

rll.ChooseList.prototype.prevCursor = function() {
  this._cursor -= 1;
  this._adjustCursor();
};

rll.ChooseList.prototype._adjustCursor = function() {
  if (this._items.isEmpty()) {
    this._cursor = 0;
  } else {
    this._cursor = (this._cursor + this._items.length) % this._items.length;
  }
};

rll.ChooseList.prototype.name = function(index) {
  return this._items[index].name();
};

rll.ChooseList.prototype.currentItem = function() {
  return this._items[this._cursor];
};

rll.ChooseList.prototype.removeCurrentItem = function() {
  var item = this._items[this._cursor];
  this._items.splice(this._cursor, 1);
  this._adjustCursor();
  return item;
};
