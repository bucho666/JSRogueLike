/*global rll*/
rll.Messages = function() {
  this._messages = [];
  this._current = '';
};

rll.Messages.prototype.add = function(message) {
  var width = 0,
      start = 0,
      i, cc;
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
  display.clearLine(20);
  display.write(new rll.Point(0, 20), message, '#ccc');
};

rll.Messages.prototype.isEmpty = function() {
  return this._messages.isEmpty();
};

rll.KeyEvent = function() {
  this._current = null;
};
