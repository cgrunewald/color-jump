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

class Collision {
  _resultantDirection: THREE.Vector3;
  _overlap: number;

  constructor(resultantDirection: THREE.Vector3, overlap: number) {
    this._resultantDirection = resultantDirection;
    this._overlap = overlap;
  }

  getOverlap(): number {
    return Math.abs(this._overlap);
  }

  getResultantDirection(): THREE.Vector3 {
    return this._resultantDirection;
  }

  getOffsetDirection(): THREE.Vector3 {
    return this._resultantDirection
      .clone()
      .normalize()
      .multiplyScalar(this.getOverlap());
  }

  flip(): Collision {
    return new Collision(
      this._resultantDirection.clone().multiplyScalar(-1),
      this._overlap
    );
  }
}
module.exports = Collision;
