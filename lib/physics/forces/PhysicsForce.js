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

class PhysicsForce {
  constructor() {
  }

  _checkNewtonianForces(
    force: THREE.Vector3,
    newtonianForces: Array<THREE.Vector3>
  ): ?THREE.Vector3 {
    force = force.clone();
    var resultingVectors = [];
    // TODO - we can probably simplify this by adding the newtonian forces up,
    // normalizing, and then checking once.
    for (var ii = 0; ii < newtonianForces.length; ii++) {
      var newtonianForce = newtonianForces[ii];
      var checkedForce = this._checkNewtonianForce(force, newtonianForce);
      if (checkedForce) {
        force.add(checkedForce);
        resultingVectors.push(checkedForce);
      }
    }

    if (resultingVectors.length) {
      return resultingVectors.reduce(function (prevValue, currentValue) {
        return prevValue.add(currentValue);
      }, new THREE.Vector3());
    }
    return null;
  }

  /**
   * Returns the force vector to cancel out, if we should cancel.
   */
  _checkNewtonianForce(
    force: THREE.Vector3,
    newtonianForce: THREE.Vector3
  ): ?THREE.Vector3 {
    var normalizedNewtonianForce = newtonianForce.clone().normalize();
    var oppositeForce = force.clone().multiplyScalar(-1);

    var projectionDirection = oppositeForce.dot(normalizedNewtonianForce);
    if (projectionDirection > 0) {
      // projection applies - figure out canceled force
      return normalizedNewtonianForce.multiplyScalar(projectionDirection);
    }

    return null;
  }

  update(
    deltaTime: number,
    newtonianForces: Array<THREE.Vector3>
  ): THREE.Vector3 {
    throw new Error('unimplemented');
  }

  clone(): PhysicsForce {
    throw new Error('unimplmented');
  }

  isAnyNormalForce(forces: Array<THREE.Vector3>): bool {
    return false;
  }

}
module.exports = PhysicsForce;
