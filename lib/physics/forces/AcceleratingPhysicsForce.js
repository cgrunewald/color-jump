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
const Vectors = require('../../utils/Vectors');

class AcceleratingPhysicsForce extends PhysicsForce {
  _acceleration: THREE.Vector3;
  _initialVelocity: THREE.Vector3;
  _accumulatdTime: number;

  constructor(acceleration: THREE.Vector3, initialVelocity: THREE.Vector3) {
    super();
    this._initialVelocity = initialVelocity;
    this._acceleration = acceleration;
    this._accumulatdTime = 0;
  }

  clone(): PhysicsForce {
    var clone = new AcceleratingPhysicsForce(
      this._acceleration.clone(),
      this._initialVelocity.clone()
    );
    clone._accumulatdTime = this._accumulatdTime;
    return clone;
  }

  reset(): void {
    this.resetWithInitialVelocity(new THREE.Vector3());
  }

  resetWithInitialVelocity(initialVelocity: THREE.Vector3) {
    this._accumulatdTime = 0;
    this._initialVelocity = initialVelocity;
  }

  isAnyNormalForce(forces: Array<THREE.Vector3>): bool {
    var self = this;
    return forces.reduce(function (prevValue: bool, currentValue: THREE.Vector3) {
      return prevValue || self.isNormalForce(currentValue)
    }, false);
  }

  isNormalForce(force: THREE.Vector3): bool {
    var resultingForce = this._getCurrentVelocity();
    var cancelingForce = this._checkNewtonianForces(resultingForce, [force]);
    if (cancelingForce) {
      resultingForce = resultingForce.add(cancelingForce);
    }

    return resultingForce.length() < 0.0001;
  }

  _getCurrentVelocity(): THREE.Vector3 {
    return this
      ._acceleration
      .clone()
      .multiplyScalar(this._accumulatdTime)
      .add(this._initialVelocity);
  }

  update(
    deltaTime: number,
    newtonianForces: Array<THREE.Vector3>
  ): THREE.Vector3 {
    // Accelerate the force (increase the velocity)
    this._accumulatdTime += deltaTime;

    var resultingForce = this._getCurrentVelocity();
    var cancelingForce = this._checkNewtonianForces(resultingForce, newtonianForces);
    if (cancelingForce) {
      resultingForce = resultingForce.add(cancelingForce);
    }

    // We've found a force that completely ceaces the acceleration - cancel it.
    if (resultingForce.length() < 0.0001) {
      this._accumulatdTime = 0;
    }

    return resultingForce.multiplyScalar(deltaTime);
  }
}

module.exports = AcceleratingPhysicsForce;
