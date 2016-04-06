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

const uuid = require('uuid');

class Animation {
  _object: THREE.Object3D;
  _translation: THREE.Vector3;
  _timeSeconds: number;
  _accumulatedTime: number;
  _done: ?Function;

  constructor(
    object: THREE.Object3D,
    translation: THREE.Vector3,
    timeSeconds: number,
    done: Function
  ) {
    this._object = object;
    this._translation = translation.clone().multiplyScalar(1.0 / timeSeconds);
    this._timeSeconds = timeSeconds;
    this._accumulatedTime = 0;
    this._done = done;
  }

  getObject(): THREE.Object3D {
    return this._object;
  }

  computeChange(deltaTime: number): THREE.Vector3 {
    if (this._accumulatedTime > this._timeSeconds) {
      return new THREE.Vector3();
    }
    const timeOffset = Math.min(this._timeSeconds - this._accumulatedTime, deltaTime);
    return this._translation.clone().multiplyScalar(timeOffset);
  }

  update(deltaTime: number) {
    if (this._accumulatedTime > this._timeSeconds) {
      throw new Error('wtf');
    }
    const change = this.computeChange(deltaTime);
    this._object.position.add(change);

    this._accumulatedTime += deltaTime;
    if (this._accumulatedTime >= this._timeSeconds) {
      this._done && this._done();
      this._done = null;
    }
  }
}

class GameObject extends THREE.Object3D {
  _activeAnimations: Object;

  constructor() {
    super();

    this._activeAnimations = {};
  }

  startAnimation(object: THREE.Object3D, translation: THREE.Vector3, timeSeconds: number): void {
    const key = uuid();
    var self = this;
    this._activeAnimations[key] = new Animation(
      object,
      translation,
      timeSeconds,
      function() {
        delete self._activeAnimations[key];
      }
    );
  }

  accumulateAnimationChanges(deltaTime: number, object: THREE.Object3D): THREE.Vector3 {
    var change = new THREE.Vector3();
    for (var key in this._activeAnimations) {
      var animation = this._activeAnimations[key];
      if (animation.getObject() == object) {
        change.add(animation.computeChange(deltaTime));
      }
    }
    return change;
  }

  update(deltaTime: number) {
    for (var key in this._activeAnimations) {
      this._activeAnimations[key].update(deltaTime);
    }
  }
}
module.exports = GameObject;
