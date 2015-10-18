/*global rll*/
var game = game || {};

game.LevelFactory = function(thisGame) {
  this._game = thisGame;
  this._stage = null;
  this._player = thisGame.player();
};

game.LevelFactory.prototype.create = function(floor) {
  var mapSize = new rll.Size(80, 21),
      generator = new rll.Generator(mapSize),
      doorTerrain;
  this._stage = new rll.Stage(mapSize, floor);
  generator.generate();
  generator.forEachInsideRoom(function(point) {
    this.setTerrain(rll.Terrain.FLOOR, point);
  }, this._stage);
  generator.forEachDoor(function(point) {
    switch(rll.random(1, 6)) {
      case 1:
        doorTerrain = rll.Terrain.FLOOR;
        break;
      case 2:
        doorTerrain = rll.Terrain.OPENED_DOOR;
        break;
      default:
        doorTerrain = rll.Terrain.CLOSED_DOOR;
        break;
    }
    this.setTerrain(doorTerrain, point);
  }, this._stage);
  generator.forEachCorridor(function(point) {
    this.setTerrain(rll.Terrain.FLOOR, point);
  }, this._stage);
  this._stage.setTerrain(rll.Terrain.DOWN_STAIRS,
      generator.roomInsidePointAtRandom());
  this._player.setPoint(generator.roomInsidePointAtRandom());
  this._stage.addActor(this._player);
  generator.forEachRoom(function(room) {
    this.makeRoom(room);
  }, this);
  return this._stage;
};

game.LevelFactory.prototype.makeRoom = function(room) {
  var dice = new rll.Dice('1d6');
  var roll = dice.roll();
  if (roll === 3) {
    dice = new rll.Dice('1d3');
  } else if (roll >= 4) {
    this.putMonster(room);
    dice = new rll.Dice('1d2');
  }
  if (dice.roll() === 1) {
    this.putTreasure(room);
  }
};

game.LevelFactory.prototype.putMonster = function(room) {
  var level = parseInt(this._stage.floor() / 2),
    monsterNum = rll.random(1, level),
    i = 0;
  while (true) {
    var m = game.Monster.table.choiceAtRandom(level).create();
    i += m.level();
    if (i > monsterNum) break;
    m.setPoint(room.insidePointAtRandom());
    m.setAction(new game.AI(this._game));
    this._stage.addActor(m);
  }
};

game.LevelFactory.prototype.putTreasure = function(room) {
  var treasure;
  var itemLevel = this._stage.floor() / 2;
  switch(rll.random(1, 18)) {
    case 1:
    case 2:
      treasure = game.Potion.table.choiceAtRandom(itemLevel);
      break;
    case 3:
    case 4:
      treasure = game.Weapon.table.choiceAtRandom(itemLevel);
      break;
    case 5:
    case 6:
      treasure = game.Armor.table.choiceAtRandom(itemLevel);
      break;
    case 7:
      treasure = game.Rod.table.choiceAtRandom(itemLevel);
      break;
    default:
      var diceNum = (Math.floor(this._stage.floor() / 2) + 1) * 6;
      treasure = new rll.Money(Math.floor((new rll.Dice('1d'+diceNum)).roll() * 100));
  }
  if (treasure === undefined) return;
  this._stage.putItem(treasure.copy(), room.insidePointAtRandom());
};
