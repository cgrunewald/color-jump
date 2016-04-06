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

const Plane = require('./Plane');

class FaceOrientation {
  _face1: Face;
  _face2: Face;
  _planeOrientation: string;
  _delta: number;

  constructor(face1: Face, face2: Face, planeOrientation: string, delta: number) {
    this._face1 = face1;
    this._face2 = face2;
    this._planeOrientation = planeOrientation;
    this._delta = delta;
  }

  getPlaneOrientation(): string {
    return this._planeOrientation;
  }

  isIntersect(): bool {
    return this._planeOrientation === Plane.ORIENTATION_INTERSECT;
  }

  isNegative(): bool {
    return this._planeOrientation === Plane.ORIENTATION_NEGATIVE;
  }

  isPositive(): bool {
    return this._planeOrientation === Plane.ORIENTATION_POSITIVE;
  }

  getDelta(): number {
    return this._delta;
  }

  getFace(): Face {
    return this._face1;
  }

  getOpposingFace(): Face {
    return this._face2;
  }
}

class Face {
  _plane: Plane;
  _boundaryPoints: Array<THREE.Vector3>;
  static FaceOrientation: Function;

  /**
   * Plane and then boundary points of the face with clockwise winding.
   */
  constructor(plane: Plane, boundaryPoints: Array<THREE.Vector>) {
    this._plane = plane;
    this._boundaryPoints = boundaryPoints;
  }

  getPlane(): Plane {
    return this._plane;
  }

  getNormal(): THREE.Vector3 {
    return this.getPlane().getNormal();
  }

  getBoundaryPoints(): Array<THREE.Vector3> {
    return this._boundaryPoints;
  }

  computeOrientation(point: THREE.Vector3): string {
    return this._plane.computeOrientation(point);
  }

  computeFaceOrientation(face: Face): FaceOrientation {
    var self = this;
    var totalDistance = face._boundaryPoints.reduce(function (prevValue, currValue) {
      return prevValue = self._plane.getOrientationDistance(currValue);
    }, 0.0);
    var avgDistance = totalDistance / this._boundaryPoints.length;
    return new FaceOrientation(this, face, Plane.labelOrientation(avgDistance), avgDistance);
  }

  translate(offset: THREE.Vector3): Face {
    // TODO - implement this;
    throw new Error('unimplemented');
  }
}
Face.FaceOrientation = FaceOrientation;

module.exports = Face;
