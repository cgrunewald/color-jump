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

const ColorCube = require('../objects/ColorCube');

class Range {
  _min: number;
  _max: number;

  constructor(min: number, max: number) {
    this._min = min;
    this._max = max;
  }

  map(func: Function): Array<mixed> {
    var ret = [];
    for (var ii = this._min; ii < this._max; ii++) {
      ret.push(func(ii));
    }
    return ret;
  }
}

class GameColorCubeIndex {
  static Range: Function;

  constructor(indexSpecification: Array<mixed>) {
    this._indexSpecification = indexSpecification;
    this._indexes = {};

    for (var ii = 0; ii < indexSpecification.length; ii++) {
      var indexSpec = indexSpecification[ii];

      if (typeof(indexSpec) === 'string') {
        // single-column index
        this._indexes[indexSpec] = {};
      } else if (typeof(indexSpec) === 'array') {
        // multi-column index
        throw new Error('not supported');
      }
    }
  }

  addColorCube(cube: ColorCube, indexedProperties: Object): void {
    for (var property in indexedProperties) {
      var value = indexedProperties[property];
      if (this._indexes.hasOwnProperty(property)) {
        if (!this._indexes[property].hasOwnProperty(value)) {
          this._indexes[property][value] = [];
        }
        this._indexes[property][value].push(cube);
      }
    }
  }

  queryElements(theKey: string, value: mixed): Array<ColorCube> {
    var self = this;
    if (value instanceof Range) {
      var elements = value.map(function (val) {
        return self.queryElements(theKey, val);
      });
      return elements.reduce(function (a, b) {
        return a.concat(b);
      }, []);
    }

    return this._indexes[theKey][value] || [];
  }

  query(querySpec: Object): Array<ColorCube> {
    var keys = Object.keys(querySpec);
    var intersection = [];

    for (var ii = 0; ii < keys.length; ii++) {
      var theKey = keys[ii];

      if (ii === 0) {
        intersection = this.queryElements(theKey, querySpec[theKey]);
      } else {
        var newIntersections = [];
        var newElements = this.queryElements(theKey, querySpec[theKey]);
        intersection.forEach(function (inter) {
          newElements.forEach(function (newElem) {
            if (inter === newElem) {
              newIntersections.push(inter);
            }
          });
        });
        intersection = newIntersections;
      }
    }

    return intersection;
  }
}
GameColorCubeIndex.Range = Range;

module.exports = GameColorCubeIndex;
