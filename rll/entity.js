/*global rll*/
rll.Entity = function(character, name) {
  this._character = character;
  this._name = name;
};

rll.Entity.prototype.name = function() {
  return this._name;
};

rll.Entity.prototype.draw = function(display, point) {
  display.writeCharacter(point, this._character);
};

rll.Entity.prototype.dark = function() {
  return new rll.Entity(this._character.dark(), this._name);
};

rll.Entity.BLANK = new rll.Entity(new rll.Character(' ', '#000'), 'unknown');
