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
const AcceleratingPhysicsForce = require('../physics/forces/AcceleratingPhysicsForce');
const Collision = require('../utils/Collision');
const Collisions = require('../utils/Collisions');
const KeyboardInput = require('../controls/KeyboardInput');
const PhysicsConstants = require('../physics/PhysicsConstants');
const PhysicsForceSystem = require('../physics/PhysicsForceSystem');
const ConstantPhysicsForce = require('../physics/forces/ConstantPhysicsForce');
const GravityPhysicsForce = require('../physics/forces/GravityPhysicsForce');

const PLAYER_MOVE_SPEED = 5;

class Player extends THREE.Object3D {
  _forceSystem: PhysicsForceSystem;
  _gravityForce: AcceleratingPhysicsForce;
  _activeCollisions: Array<Collision>;

  constructor() {
    super();

    this._activeCollisions = [];
    this._forceSystem = new PhysicsForceSystem({});
    this._gravityForce = new GravityPhysicsForce();
    this._forceSystem.addForce('gravity', this._gravityForce);

    this._mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.5, 0.2),
      new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
        shading: THREE.SmoothShading,
      })
    );
    this.add(this._mesh);

    this._jumping = false;
  }

  supportsCollisions(): bool {
    return true;
  }

  getForce(): ?THREE.Vector3 {
    return null;
  }

  getBoundingBox(delta: number): AABB {
    this._forceSystem.pushCheckpoint();

    // var positionOffset = new THREE.Vector3();
    var positionOffset = this._forceSystem.run(delta);

    const box = AABB.fromCenterOfGravity(
      this._mesh.localToWorld(positionOffset), // new THREE.Vector3()),
      0.2,
      0.5,
      0.2
    );

    this._forceSystem.popCheckpoint();
    return box;
  }

  preUpdate(delta: number): void {
    var movementForce = null;
    if (KeyboardInput.right) {
      movementForce = new ConstantPhysicsForce(
        new THREE.Vector3(PLAYER_MOVE_SPEED, 0, 0)
      );
    } else if (KeyboardInput.left) {
      movementForce = new ConstantPhysicsForce(
        new THREE.Vector3(-PLAYER_MOVE_SPEED, 0, 0)
      );
    }

    if (movementForce) {
      this._forceSystem.addForce('movement', movementForce);
    } else {
      this._forceSystem.removeForce('movement');
    }
  }

  processCollision(
    collidingObject: THREE.Object3D,
    collisions: Array<Collision>
  ): void {
    const bestCollision = Collisions.getBestCollision(
      collisions,
      new THREE.Vector3(0, 1, 0)
    );
    if (!bestCollision) {
      return;
    }

    if (
      this._forceSystem.hasForce('jump') &&
      (
        this._forceSystem
          .getForce('jump')
          .isAnyNormalForce([bestCollision.getResultantDirection()]) ||
        this._gravityForce.isAnyNormalForce([bestCollision.getResultantDirection()])
      )
    ) {
      this._forceSystem.removeForce('jump');
    } else if (!this._forceSystem.hasForce('jump') && KeyboardInput.action) {
      this._forceSystem.addForce(
        'jump',
        new ConstantPhysicsForce(
          new THREE.Vector3(0, -0.6 * PhysicsConstants.GRAVITY, 0)
        )
      );
    }

    // Something is trying to push the player off
    if (Math.abs(bestCollision.getResultantDirection().z) > 0) {
      this._activeCollisions.push(bestCollision);
    } else {
      this._forceSystem.addNewtonianForce(bestCollision.getResultantDirection());
    }

  }

  postUpdate(delta: number): void {
    this._forceSystem.removeAllNewtonianForces();
    this._activeCollisions = [];
  }

  update(delta: number): void {
    var positionOffset = this._forceSystem.run(delta);
    this.position.copy(this.position.clone().add(positionOffset));

    var self = this;
    this._activeCollisions.forEach(function (collision) {
      self.position.add(collision.getOffsetDirection());
    });
  }

}
module.exports = Player;
