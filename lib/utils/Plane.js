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

function FLOAT_EQUALS(value: number, compare: number) {
  return Math.abs(value - compare) < 0.0001;
}

class Plane {
  _normal: THREE.Vector3;
  _point: THREE.Vector3;
  _implicitDValue: number;

  static ORIENTATION_POSITIVE: string;
  static ORIENTATION_NEGATIVE: string;
  static ORIENTATION_INTERSECT: string;

  constructor(normal: THREE.Vector3, point: THREE.Vector3) {
    this._normal = normal;
    this._point = point;

    this._implicitDValue = this._normal.clone().multiplyScalar(-1).dot(this._point);
  }

  translate(offset: THREE.Vector3): Plane {
    return new Plane(this._normal, this._point.clone().add(offset));
  }

  getNormal(): THREE.Vector3 {
    return this._normal;
  }

  getOrientationDistance(point: THREE.Vector3): number {
    return this._normal.dot(point) + this._implicitDValue;
  }

  computeOrientation(point: THREE.Vector3): string {
    var value = this.getOrientationDistance(point);
    return Plane.labelOrientation(value);
  }

  static labelOrientation(value: number): string {
    if (FLOAT_EQUALS(value, 0.0)) {
      return Plane.ORIENTATION_INTERSECT;
    }

    if (value > 0) {
      return Plane.ORIENTATION_POSITIVE;
    }

    return Plane.ORIENTATION_NEGATIVE;
  }
}
Plane.ORIENTATION_POSITIVE = 'positive';
Plane.ORIENTATION_INTERSECT = 'intersect';
Plane.ORIENTATION_NEGATIVE = 'negative';

module.exports = Plane;
