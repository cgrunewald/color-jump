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
const uuid = require('uuid');
const PhysicsForce = require('./forces/PhysicsForce');

class PhysicsForceSystem {
  _forces: Object;
  _newtonianForces: Object;
  _pushedStates: Array<Object>;

  constructor(options: Object) {
    this._forces = {};
    this._newtonianForces = {};
    this._pushedStates = [];
  }

  getForce(key: string): PhysicsForce {
    if (!this.hasForce(key)) {
      throw new Error('check for existence before getting force');
    }
    return this._forces[key];
  }

  addForce(key: string, force: PhysicsForce): string {
    this._forces[key] = force;
    return key;
  }

  hasForce(key: string): bool {
    return !!this._forces[key];
  }

  pushCheckpoint(): void {
    const pushedState = {forces: {}, newtonianForces: {}};
    for (var key in this._newtonianForces) {
      pushedState.newtonianForces[key] = this._newtonianForces[key].clone();
    }
    for (var key in this._forces) {
      pushedState.forces[key] = this._forces[key].clone();
    }
    this._pushedStates.push(pushedState);
  }

  popCheckpoint(): void {
    if (this._pushedStates.length === 0) {
      throw new Error('unequal number of state pushes and pops');
    }

    const popedState = this._pushedStates.pop();
    this._forces = popedState.forces;
    this._newtonianForces = popedState.newtonianForces;
  }

  removeForce(key: string): void {
    delete this._forces[key];
  }

  addNewtonianForce(direction: THREE.Vector3): void {
    this._newtonianForces[uuid()] = direction;
  }

  removeAllNewtonianForces(): void {
    this._newtonianForces = {};
  }

  getNewtonianForces(): Array<THREE.Vector3> {
    var forces = _.values(this._newtonianForces);
    return forces;
  }

  run(deltaTime: number): THREE.Vector3 {
    var summedForceVector = new THREE.Vector3();
    for (var key in this._forces) {
      var force = this._forces[key];
      var offset = force.update(deltaTime, this.getNewtonianForces());
      summedForceVector.add(offset);
    }

    return summedForceVector;
  }
}
module.exports = PhysicsForceSystem;
