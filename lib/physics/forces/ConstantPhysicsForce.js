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

const PhysicsForce = require('./PhysicsForce');

class ConstantPhysicsForce extends PhysicsForce {
  _force: THREE.Vector3;

  constructor(force: THREE.Vector3) {
    super();
    this._force = force;
  }

  getForce(): THREE.Vector3 {
    return this._force.clone();
  }

  update(
    deltaTime: number,
    newtonianForces: Array<THREE.Vector3>
  ): THREE.Vector3 {
    var force = this._force.clone();
    var cancelingForce = this._checkNewtonianForces(this._force, newtonianForces);
    if (cancelingForce) {
      force = force.add(cancelingForce);
    }

    return force.multiplyScalar(deltaTime);
  }

  isNormalForce(force: THREE.Vector3): bool {
    var resultingForce = this.getForce();
    var cancelingForce = this._checkNewtonianForces(resultingForce, [force]);
    if (cancelingForce) {
      resultingForce = resultingForce.add(cancelingForce);
    }
    return resultingForce.length() < 0.0001;
  }

  isAnyNormalForce(forces: Array<THREE.Vector3>): bool {
    var self = this;
    return forces.reduce(function (prevValue: bool, currentValue: THREE.Vector3) {
      return prevValue || self.isNormalForce(currentValue)
    }, false);
  }

  clone(): PhysicsForce {
    // No need to clone
    return this;
  }

}
module.exports = ConstantPhysicsForce;
