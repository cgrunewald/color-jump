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

class CollisionsManager {
  runCollissions(
    delta: number,
    groupA: Array<THREE.Object3D>,
    groupB: Array<THREE.Object3D>
  ): void {
    for (var ii = 0; ii < groupA.length; ii++) {
      var collidableA = groupA[ii];
      for (var jj = 0; jj < groupB.length; jj++) {
        var collidableB = groupB[jj]
        this._testCollission(delta, collidableA, collidableB);
      }
    }
  }

  _testCollission(
    delta: number,
    collidableA: THREE.Object3D,
    collidableB: THREE.Object3D
  ) {
    if (delta > 0.1) {
      throw new Error('cannot run collisions for such a high delta');
    }

    var boundingBoxA = collidableA.getBoundingBox(delta);
    var boundingBoxB = collidableB.getBoundingBox(delta);
    var collisions = null;
    if ((collisions = boundingBoxA.collidesNew(boundingBoxB)) !== null) {
      collidableB.processCollision(collidableA, collisions);
      collidableA.processCollision(
        collidableB,
        collisions.map(function (collision) {
          return collision.flip();
        })
      );
    }
  }
}
module.exports = CollisionsManager;
