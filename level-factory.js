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
  var max = 1 + parseInt(this._stage.floor() / 3);
  var monsterNum = rll.random(1, max);
  var monsterList = new game.MonsterList(1+Math.floor(this._stage.floor() / 6));
  for (var i=0; i<monsterNum; i++) {
    var m = monsterList.getAtRandom();
    m.setPoint(room.insidePointAtRandom());
    m.setAction(new game.AI(this._game));
    this._stage.addActor(m);
  }
};

game.LevelFactory.prototype.putTreasure = function(room) {
  if (rll.random(1, 6) === 1) {
    var potion = game.potion.CureLightWounds;
    this._stage.putItem(potion, room.insidePointAtRandom());
  } else {
    var diceNum = (Math.floor(this._stage.floor() / 5) + 1) * 6;
    this._stage.putItem(new rll.Money(Math.floor((new rll.Dice('1d'+diceNum)).roll() * 100)),
    room.insidePointAtRandom());
  }
};
