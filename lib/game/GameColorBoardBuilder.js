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

const BLOCK_SIZE = GameColorBoardConstants.BLOCK_SIZE;

class GameColorBoardBuilder {
  _width: number;
  _height: number;
  _colors: Array<number>;

  constructor(width: number, height: number, colors: Array<number>) {
    this._width = width;
    this._height = height;
    this._colors = colors;
  }

  _seedEmptyDistribution(): Array<number> {
    var result = [];
    for (var ii = 0; ii < this._width; ii++) {
      result[ii] = Colors.BLACK;
    }
    return result;
  }

  computeDensity(xPos: number, densityHistories: Array<Array<number>>): Object {
    const look = 2;
    const denom = 1/((look * 2 + 1) * densityHistories.length);

    var densities = {};
    densities[Colors.BLACK] = 0.0;
    for (var ii = 0; ii < this._colors.length; ii++) {
      densities[this._colors[ii]] = 0.0;
    }

    for (var xx = -look; xx <= look; xx++) {
      var offset = xPos + xx;
      if (offset < 0 || offset >= this._width) {
        densities[Colors.BLACK] += denom;
        continue;
      }

      densityHistories.forEach(function (density) {
        densities[density[offset]] += denom;
      });
    }

    densities['total'] = 1 - densities[Colors.BLACK];
    return densities;
  }

  isBorder(xx: number, yy: number): bool {
    return (xx === 0 || xx === this._width - 1 || yy === 0) ||
      (yy === 1 && xx === 1);
  }

  _computeColor(densities: Object) {
    var weights = [];
    var total = 0.0;
    for (var ii = 0; ii < this._colors.length; ii++) {
      var weight = densities[this._colors[ii]] > 0
        ? (1 - densities[this._colors[ii]]) * (1 - densities[this._colors[ii]])
        : 2;
      total += weight;
      weights.push(weight);
    }

    var random = Math.random();
    var accum = 0.0;
    for (var ii = 0; ii < weights.length; ii++) {
      var prob = weights[ii] / total;
      if (random < accum + prob) {
        return this._colors[ii];
      }

      accum += prob;
    }
    throw new Error('wtf');
  }

  convertWorldPointToBoardPoint(worldX: number, worldY: number): THREE.Vector2 {
    var boardOffsetX = (this._width * BLOCK_SIZE / 2 - .5) + worldX;
    return new THREE.Vector2(
      Math.floor(boardOffsetX / BLOCK_SIZE - BLOCK_SIZE * 0.5),
      Math.floor(worldY / BLOCK_SIZE));
  }

  build(index: GameColorCubeIndex): THREE.Object3D {
    let colorStackRoot = new THREE.Object3D();

    var colorDistributionL1 = this._seedEmptyDistribution();
    var colorDistributionL2 = this._seedEmptyDistribution();
    var colorDistributionL3 = this._seedEmptyDistribution();

    for (var yy = 0; yy < this._height; ++yy) {
      var colorDistributionL0 = this._seedEmptyDistribution();

      var xx = 0;
      while (xx < this._width) {
        var color = Colors.BLACK;
        var extended = false;
        var length = 1;

        if (!this.isBorder(xx, yy)) {
          var density = this.computeDensity(xx, [colorDistributionL1, colorDistributionL2, colorDistributionL3]);
          var densityNext = this.computeDensity(xx + 1, [colorDistributionL1, colorDistributionL2, colorDistributionL3]);
          if ( density.total < Math.pow(Math.random(), 2.0) && densityNext.total < Math.pow(Math.random(), 2.0)) {
            color = this._computeColor(density);
            length = Math.min(2, this._width - 1 - xx);
          }

          var lengthCopy = length;
          while (lengthCopy > 0) {
            colorDistributionL0[xx + lengthCopy] = color;
            lengthCopy -= 1;
          }
        } else {
          extended = !(xx === 1 && yy === 1);
        }

        let cube = new ColorCube(color, BLOCK_SIZE, length, extended);
        index.addColorCube(
          cube,
          {x: xx, y: yy, color: color}
        );

        cube.position.copy(new THREE.Vector3((xx * BLOCK_SIZE) + BLOCK_SIZE * length * 0.5, yy * BLOCK_SIZE, 0));
        colorStackRoot.add(cube);

        xx += length;
      }

      colorDistributionL3 = colorDistributionL2;
      colorDistributionL2 = colorDistributionL1;
      colorDistributionL1 = colorDistributionL0;
    }

    colorStackRoot.position.copy(new THREE.Vector3(-this._width * BLOCK_SIZE / 2 + .5, 0, 0));
    return colorStackRoot;
  }
}
module.exports = GameColorBoardBuilder;
