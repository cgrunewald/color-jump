/**
 * Copyright 2016 - Present Calvin Grunewald. All Rights Reserved.
 * 
 * This file is part of Color Jump.
 * 
 * Color Jump is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Color Jump is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Color Jump.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * @flow
 */

'use strict';

const AlarmManager = require('../utils/AlarmManager');
const CollisionsManager = require('../physics/CollisionsManager');
const Colors = require('../Colors');
const GameColorBoard = require('./GameColorBoard');
const GameScene = require('../GameScene');
const GameState = require('./GameState');
const Menu = require('../Menu');

const COLORS = [
  Colors.YELLOW,
  Colors.BLUE,
  Colors.GREEN,
  Colors.RED,
];

class Game {
  _menu: Menu;
  _collissionsManager: CollisionsManager;
  _colorBoard: GameColorBoard;
  _gameScene: GameScene;
  _colorsQueue: Array<number>;
  _running: bool;

  constructor(renderer) {
    this._menu = new Menu(this);
    this._collissionsManager = new CollisionsManager();
    this._colorBoard = new GameColorBoard();
    this._gameScene = new GameScene(
      renderer,
      this._colorBoard.getRenderable()
    );
    this._gameScene.addGameStateListener(this._gameStateChanged.bind(this));

    this._colorsQueue = [];
    this._generateColorsQueue();
    this.pause();
  }

  _generateColorsQueue(): void {
    const MIN_COLOR_LENGTH = 5;
    if (this._colorsQueue.length < MIN_COLOR_LENGTH) {
      for (var ii = 0; ii < MIN_COLOR_LENGTH * 2; ii++) {
        this._colorsQueue.push(
          COLORS[Math.floor(Math.random() * COLORS.length)]
        );
      }
    }
  }

  _getCurrentScene(): GameScene {
    return this._gameScene;
  }

  _getActiveColor(): number {
    this._generateColorsQueue();
    this._menu.updateColorQueue(1, this._colorsQueue.slice(1, 6));
    return this._colorsQueue.shift();
  }

  update(delta: number): void {
    if (!this._running) {
      return;
    }

    if (this._colorBoard.getActiveColor() === null) {
      this._updateAndScheduleColorChange();
    }

    this._getCurrentScene().traverse(function (obj) {
      obj.preUpdate && obj.preUpdate(delta);
    });

    var collidableObjects = [];
    collidableObjects = this._colorBoard.collectColorCubes(this._gameScene.getPlayer().position);
    console.log("numb objects: " + collidableObjects.length);

    /*this._getCurrentScene().getGameBoard().traverse(function (obj) {
      if (obj.supportsCollisions && obj.supportsCollisions()) {
        collidableObjects.push(obj);
      }
    });*/

    this._collissionsManager.runCollissions(
      delta,
      [this._getCurrentScene().getPlayer()],
      collidableObjects
    );

    this._getCurrentScene().traverse(function (obj) {
      obj.update && obj.update(delta);
    });

    this._getCurrentScene().traverse(function (obj) {
      obj.postUpdate && obj.postUpdate(delta);
    });
  }

  reset(): void {
    AlarmManager.cancelAllAlarms();
    this._colorBoard = new GameColorBoard();
    this._gameScene.resetWithColorBoard(this._colorBoard.getRenderable());
  }

  pause(): void {
    this._running = false;;
    AlarmManager.setRunning(false);
    this._menu.setupGameOverMenu();
  }

  start(): void {
    this._running = true;
    AlarmManager.setRunning(true);
  }

  _updateAndScheduleColorChange() {
    this._colorBoard.changeActiveColor(this._getActiveColor());
    AlarmManager.setAlarm(4, function() {
      this._updateAndScheduleColorChange();
    }.bind(this));
  }

  render(): void {
    this._getCurrentScene().render();
  }

  setScreenSize(width: number, height: number) {
    this._getCurrentScene().setScreenSize(width, height);
  }

  _gameStateChanged(state: string, score: number): void {
    if (state === GameState.LOSE) {
      this.pause();
    } else if (state === GameState.NEW_HIGH_SCORE) {
      this._menu.updateHighScore(score);
    }
  }

  onDocumentReady() {
    this._menu.setupStartMenu();
  }
}

module.exports = Game;
