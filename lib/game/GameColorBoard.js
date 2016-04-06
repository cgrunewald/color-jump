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
const Colors = require('../Colors');
const ColorCube = require('../objects/ColorCube');
const GameColorBoardConstants = require('./GameColorBoardConstants');
const GameColorCubeIndex = require('./GameColorCubeIndex');
const GameColorBoardBuilder = require('./GameColorBoardBuilder');

class GameColorBoard {
  _colorCubeIndex: GameColorCubeIndex;
  _activeColor: ?number;
  _renderable: THREE.Object3D;
  _builder: GameColorBoardBuilder;
  _colorMap: Object;

  constructor() {
    this._colorCubeIndex = new GameColorCubeIndex([
      'color',
      'y',
      'x',
    ]);

    this._activeColor = null;
    this._builder = new GameColorBoardBuilder(
      GameColorBoardConstants.GAME_BOARD_WIDTH,
      GameColorBoardConstants.GAME_BOARD_HEIGHT,
      GameColorBoardConstants.COLORS
    );
    this._renderable = this._builder.build(this._colorCubeIndex);

    this._colorMap = {};
    for (var colorKey in Colors) {
      this._colorMap[colorKey] = [];
    }
  }

  getActiveColor(): ?number {
    return this._activeColor;
  }

  changeActiveColor(newColor: number): void {
    if (newColor === this._activeColor) {
      return;
    }

    var oldColor = this._activeColor;
    AlarmManager.setAlarm(1.5, function () {
      this._extendCubes(oldColor, false);
    }.bind(this));

    this._extendCubes(newColor, true);
    this._activeColor = newColor;
  }

  collectColorCubes(position: THREE.Vector3): Array<ColorCube> {
    const OFFSET = 2;
    var colorBoardSpace = this._builder.convertWorldPointToBoardPoint(position.x, position.y);
    console.log("cb space: " + colorBoardSpace.x + " " + colorBoardSpace.y)
    return this._colorCubeIndex.query({
      'x': new GameColorCubeIndex.Range(colorBoardSpace.x - OFFSET, colorBoardSpace.x + OFFSET + 1),
      'y': new GameColorCubeIndex.Range(colorBoardSpace.y - OFFSET, colorBoardSpace.y + OFFSET + 1),
    });
  }

  _extendCubes(color: ?number, extend: bool): void {
    if (color === null) {
      return;
    }

    var existingActiveBlocks = this._colorCubeIndex.query(
      {color: color}
    );
    existingActiveBlocks.forEach(function (cube) {
      cube.extend(extend, true);
    });
  }

  getRenderable(): THREE.Object3D {
    return this._renderable;
  }
}
module.exports = GameColorBoard;
