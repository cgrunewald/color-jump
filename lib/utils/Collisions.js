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

const Collision = require('./Collision');

class Collisions {

  static allIntersections(collisions: Array<Collision>): bool {
    const nonIntersections = Collisions.nonIntersections(collisions);
    return nonIntersections.length === 0 && collisions.length > 0;
  }

  static intersections(collisions: Array<Collision>): Array<Collision> {
    const filteredCollisions = collisions.filter(function (c: Collision): bool {
      return Math.abs(c.getOverlap()) < 0.0001;
    });
    return filteredCollisions;
  }

  static nonIntersections(collisions: Array<Collision>): Array<Collision> {
    const filteredCollisions = collisions.filter(function (c: Collision): bool {
      return Math.abs(c.getOverlap()) >= 0.0001;
    });
    return filteredCollisions;
  }

  static getBestCollision(
    collisions: Array<Collision>,
    tieBreakerDirection: THREE.Vector3
  ): ?Collision {
    if (collisions.length === 0) {
      return null;
    }

    const intersections = Collisions.intersections(collisions);
    if (intersections.length === 1) {
      return intersections[0];
    }

    if (intersections.length > 1) {
      intersections.sort(function (a: Collision, b: Collision): number {
        return (
          b.getResultantDirection().dot(tieBreakerDirection) -
          a.getResultantDirection().dot(tieBreakerDirection)
        );
      });
      return intersections[0];
    }

    // Finally, find the minimum distance to "eject" the overlapping box.
    var collisionsCopy = collisions.slice(0);
    collisionsCopy.sort(function (a: Collision, b: Collision): number {
      return Math.abs(a.getOverlap()) - Math.abs(b.getOverlap());
    });
    return collisionsCopy[0];
  }
}
module.exports = Collisions;
