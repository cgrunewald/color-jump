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

const AcceleratingPhysicsForce = require('./AcceleratingPhysicsForce');
const PhysicsConstants = require('../PhysicsConstants');
const PhysicsForce = require('./PhysicsForce');

class GravityPhysicsForce extends AcceleratingPhysicsForce {
  constructor() {
    super(
      new THREE.Vector3(0, PhysicsConstants.GRAVITY, 0),
      new THREE.Vector3(0, 0, 0)
    );
  }
}

module.exports = GravityPhysicsForce;
