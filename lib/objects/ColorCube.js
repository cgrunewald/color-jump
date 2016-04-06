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

const AABB = require('../utils/AABB');
const Colors = require('../Colors');
const GameObject = require('./GameObject');
const TextureManager = require('../TextureManager');

const DEPTH = 2;

const EXTENSION_TIME_SECONDS = 1;

class ColorCube extends GameObject {
  constructor(color: number, size: number, length: number, extended: bool) {
    super();

    this._length = length;
    this._mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size * length, size, DEPTH),
      new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide,
        shading: THREE.SmoothShading,
      })
    );
    this._mesh.position.copy(new THREE.Vector3(0, 0, 0));
    this.add(this._mesh);

    this._extended = false;
    this._color = color;
    this._size = size;

    this.extend(!!extended, false);
  }

  supportsCollisions(): bool {
    return true;
  }

  getBoundingBox(delta: number): AABB {
    return AABB.fromCenterOfGravity(
      this._mesh.localToWorld(new THREE.Vector3()),
      this._size * this._length,
      this._size,
      DEPTH
    );
  }

  processCollision(
    collidingObject: THREE.Object3D,
    resultantForce: THREE.Vector3
  ): void {

  }

  prepareForces(delta: number): void {

  }

  extend(active: bool, animated: bool) {
    if (this._extended != active) {
      if (this._extended) {
        animated
          ? this.startAnimation(this._mesh, new THREE.Vector3(0, 0, -1), EXTENSION_TIME_SECONDS)
          : this._mesh.position.z -= 1;
      } else {
        animated
          ? this.startAnimation(this._mesh, new THREE.Vector3(0, 0, 1), EXTENSION_TIME_SECONDS)
          : this._mesh.position.z += 1;
      }

      this._extended = active;
    }
  }

  isExtended(): bool {
    return this._extended;
  }

  getColor(): number {
    return this._color;
  }

  getSize(): number {
    return this._size;
  }
}
module.exports = ColorCube;
