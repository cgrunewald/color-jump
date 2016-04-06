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

const _ = require('lodash');
const Collision = require('./Collision');
const Face = require('./Face');
const FaceOrientation = Face.FaceOrientation;
const Plane = require('./Plane');
const Vectors = require('./Vectors');

class AABB {
  _faces: Object;
  _points: Array<THREE.Vector3>;

  constructor(faces: Object) {
    this._points = [].concat(
      faces.negX.getBoundaryPoints(),
      faces.posX.getBoundaryPoints()
    );
    this._faces = faces;
  }

  tranaslate(offset: THREE.Vector3): AABB {
    return new AABB(
      this._points.map(function (point) {
        return point.clone().add(offset);
      }),
      this._faces.map(function (face) { return face.translate(offset); })
    );
  }

  getFaces(): Array<Plane> {
    return _.values(this._faces);
  }

  _getOppositeFace(key: string): Plane {
    switch (key) {
      case 'posX':
        return this._faces.negX;
      case 'negX':
        return this._faces.posX;
      case 'posY':
        return this._faces.negY;
      case 'negY':
        return this._faces.posY;
      case 'posZ':
        return this._faces.negZ;
      case 'negZ':
        return this._faces.posZ;
      default:
        throw new Error('invalid key ' + key);
    }
  }

  getPoints(): Array<THREE.Vector3> {
    return this._points;
  }

  static _aggregateOrientations(face: Face, points: Array<THREE.Vector3>): Object {
    var faceOrientations = {};

    for (var jj = 0; jj < points.length; jj++) {
      var point = points[jj];
      var orientation = face.computeOrientation(point);
      faceOrientations[orientation] = true;
    }
    return faceOrientations;
  }

  collidesNew(other: AABB): ?Array<Collision> {
    var allAdjustments = [];

    for (var faceKey in this._faces) {
      var face = this._faces[faceKey];

      var conflictingOppositeFace = other._getOppositeFace(faceKey);
      var conflictingOppositeFaceOrientation = face.computeFaceOrientation(conflictingOppositeFace);

      if (
        conflictingOppositeFaceOrientation.isNegative() ||
        conflictingOppositeFaceOrientation.isIntersect()
      ) {
        allAdjustments.push(conflictingOppositeFaceOrientation);
      } else {
        return null;
      }
    }

    allAdjustments.sort(function (a: FaceOrientation, b: FaceOrientation) {
      return a.getDelta() - b.getDelta();
    });

    var onlyIntersections = allAdjustments.filter(function (a: FaceOrientation) {
      return a.isIntersect();
    });

    // If we have an intersection, we technically don't have a collision
    // (since there is no overlap). Just return all the intersections
    // and let the colliding logic deal with how to resolve.
    if (onlyIntersections.length > 0) {
      return onlyIntersections.map(function (o) {
        return new Collision(o.getFace().getNormal(), o.getDelta());
      });
    }

    return allAdjustments.map(function (o) {
      return new Collision(o.getFace().getNormal(), o.getDelta());
    });
  }

  collides(other: AABB): ?Array<THREE.Vector3> {
    var possibleIntersection = [];
    var directIntersection = null;

    for (var faceKey in this._faces) {
      var face = this._faces[faceKey];
      var faceOrientations = AABB._aggregateOrientations(face, other.getPoints());

      // If all the points have a positive orientation to the plane, then there
      // is no chance of intersection.
      if (
        Object.keys(faceOrientations).length === 1 &&
        faceOrientations[Plane.ORIENTATION_POSITIVE]
      ) {
        return null;
      } else if (faceOrientations[Plane.ORIENTATION_INTERSECT]) {
        directIntersection = face.getNormal();
        possibleIntersection.push(face.getNormal());
      } else if (
          // TODO - this isn't good enough for a split intersection
          faceOrientations[Plane.ORIENTATION_POSITIVE] &&
          faceOrientations[Plane.ORIENTATION_NEGATIVE]
      ) {
        // This intersection only applies if the opposite facing face intersects
        var conflictingFace = other._getOppositeFace(faceKey);
        var conflictingFaceOrientations = AABB._aggregateOrientations(conflictingFace, this.getPoints());
        if (
          conflictingFaceOrientations[Plane.ORIENTATION_NEGATIVE] &&
          conflictingFaceOrientations[Plane.ORIENTATION_POSITIVE]
        ) {
          possibleIntersection.push(face.getNormal());
        }
      }
    }

    if (directIntersection) {
      return [directIntersection];
    }

    /*
     * We can sort these by the distance by which points overlap the intersecting faces
     * A low overlap means that the two boxes barely intersect on that side. A large
     * overlap means they intersect a bunch. This works well for the same objects
     * since we only compare opposite faces. For another object, it gets tricky...
     *
     * Given an intersecting corner, the resultant vector should push against
     * the face with the smallest area.
     * Given an overlapping corner, compute the overlap ratio with each overlapping
     * face - take the smaller ratio.
     */
    return possibleIntersection;
  }

  static fromCenterOfGravity(
    centerOfGraviy: THREE.Vector3,
    xSize: number,
    ySize: number,
    zSize: number
  ) {
    const xOffset = xSize / 2.0;
    const yOffset = ySize / 2.0;
    const zOffset = zSize / 2.0;

    const cornerOffsets = [
      new THREE.Vector3(xOffset, yOffset, zOffset),
      new THREE.Vector3(-xOffset, yOffset, zOffset),
      new THREE.Vector3(xOffset, yOffset, -zOffset),
      new THREE.Vector3(-xOffset, yOffset, -zOffset),
      new THREE.Vector3(xOffset, -yOffset, zOffset),
      new THREE.Vector3(-xOffset, -yOffset, zOffset),
      new THREE.Vector3(xOffset, -yOffset, -zOffset),
      new THREE.Vector3(-xOffset, -yOffset, -zOffset),
    ];
    const points = cornerOffsets.map(function (point) {
      return point.add(centerOfGraviy);
    });

    const faces = {
      posX: new Face(
        new Plane(Vectors.unityX(), points[0]),
        [points[0], points[2], points[6], points[4]]
      ),
      negX: new Face(
        new Plane(Vectors.unityX().multiplyScalar(-1), points[1]),
        [points[1], points[5], points[7], points[3]]
      ),

      posY: new Face(
        new Plane(Vectors.unityY(), points[0]),
        [points[0], points[1], points[3], points[2]]
      ),
      negY: new Face(
        new Plane(Vectors.unityY().multiplyScalar(-1), points[4]),
        [points[4], points[6], points[7], points[5]]
      ),

      posZ: new Face(
        new Plane(Vectors.unityZ(), points[0]),
        [points[0], points[4], points[5], points[1]]
      ),
      negZ: new Face(
        new Plane(Vectors.unityZ().multiplyScalar(-1), points[2]),
        [points[2], points[3], points[7], points[6]]
      ),
    };

    return new AABB(faces);
  }
}
module.exports = AABB;
