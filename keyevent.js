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
