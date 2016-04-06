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

const ColorCube = require('./objects/ColorCube');
const Colors = require('./Colors');
const EventEmitter = require('event-emitter');
const GameColorBoardConstants = require('./game/GameColorBoardConstants');
const GameState = require('./game/GameState');
const Player = require('./objects/Player');
const TextureManager = require('./TextureManager');

const STARTING_HEIGHT = .75;
const SCORE_OFFSET = Math.floor(STARTING_HEIGHT * 10.0);
const LOSE_DISTANCE = -7;
const CAMERA_CREEP_DELAY = 10;
const CAMERA_CREEP_SPEED = 0.2;

class GameScene extends THREE.Scene {
  _rigToPlayerInitialOffset: THREE.Vector3;
  _cameraCreep: number;
  _eventEmitter: EventEmitter;
  _playerPosition: number;
  _maxPlayerHeight: number;

  _light1: THREE.Light;
  _light2: THREE.Light;

  _sceneBox: THREE.Object3D;

  constructor(webGLRenderer: THREE.WebGLRenderer, colorBoard: THREE.Object3D) {
    super();

    this._eventEmitter = new EventEmitter();
    this._renderer = webGLRenderer;
    this._maxPlayerHeight = 0;

    this.initialize();
    this.resetWithColorBoard(colorBoard);
  }

  resetWithColorBoard(colorBoard: THREE.Object3D): void {
    if (this._colorBoard) {
      this.remove(this._colorBoard);
      this._colorBoard = null;
    }

    this._maxPlayerHeight = 0;
    this._playerPosition = -1;
    this._colorBoard = colorBoard;
    this._cameraCreep = -CAMERA_CREEP_DELAY;

    this._resetCamera();
    this._resetPlayer();

    this.add(this._colorBoard);
  }

  addGameStateListener(listener: Function) {
    return this._eventEmitter.on('gameStateChange', listener);
  }

  getPlayer(): THREE.Object3D {
    return this._player;
  }

  getGameBoard(): THREE.Object3D {
    return this._colorBoard;
  }

  _resetCamera(): void {
    this._camera.position.copy(new THREE.Vector3(0, 2, 6.5));
    this._camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  initialize() {
    this._camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    this._light1 = new THREE.SpotLight( 0xffffff, 1, 20);
    this._light1.position.set( -5, 4, 13);
    this._light2 = new THREE.SpotLight( 0xffffff, 1, 20 );
    this._light2.position.set( 5, 4, 13);

    this.add( new THREE.AmbientLight( 0x505050 ) );

    var rig = new THREE.Object3D();
    rig.add(this._light1);
    rig.add(this._light2);
    rig.add(this._camera);
    this._rig = rig;

    this.add(rig);

    this._sceneBox = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshBasicMaterial({
        shading: THREE.FlatShading,
        map: TextureManager.getSpaceTexture(),
      })
    );
    this._sceneBox.position.copy(new THREE.Vector3(0, 0, -2.5));
    rig.add(this._sceneBox);
  }

  _resetPlayer(): void {
    if (this._player) {
      this.remove(this._player);
    }

    this._player = new Player();
    this.add(this._player);

    this._rig.position.copy(new THREE.Vector3(0, 0, 0));
    this._player.position.copy(new THREE.Vector3(
      -GameColorBoardConstants.GAME_BOARD_WIDTH * GameColorBoardConstants.BLOCK_SIZE / 2 + 2.75 * GameColorBoardConstants.BLOCK_SIZE,
      .75,
      1.5
    ));
    this._rigToPlayerInitialOffset =
      this._player.position.clone().add(this._rig.position.clone().multiplyScalar(-1));

    this._light1.target = this._player;
    this._light2.target = this._player;
  }

  update(delta: number) {
    var currentScore = Math.floor(this._player.position.y * 10.0) - SCORE_OFFSET;
    this._playerPosition = Math.max(this._playerPosition, this._player.position.y);
    if (currentScore > this._maxPlayerHeight) {
      this._maxPlayerHeight = currentScore;
      this._eventEmitter.emit('gameStateChange', GameState.NEW_HIGH_SCORE, this._maxPlayerHeight);
    }

    this._creepCamera(delta);

    var rigToPlayerOffset =
      this._player.position.clone().add(this._rig.position.clone().multiplyScalar(-1));

    var offset = rigToPlayerOffset.y - this._rigToPlayerInitialOffset.y;
    if (offset > 0) {
      this._rig.position.y += offset;
    } else if (offset < LOSE_DISTANCE) {
      this._eventEmitter.emit('gameStateChange', GameState.LOSE);
    }
  }

  _creepCamera(delta: number) {
    this._cameraCreep += delta;
    if (this._cameraCreep > 0) {
      this._rig.position.copy(
        new THREE.Vector3(0, this._cameraCreep * CAMERA_CREEP_SPEED, 0)
      );
    } else {
      this._rig.position.copy(new THREE.Vector3(0, 0, 0));
    }
  }

  render() {
    this._renderer.render(this, this._camera);
  }

  setScreenSize(width: number, height: number): void {
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  }
}
module.exports = GameScene;
