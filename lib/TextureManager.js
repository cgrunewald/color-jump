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

class TextureManager {
  static _rockTexture: ?THREE.Texture;
  static _spaceTexture: ?THREE.Texture;

  static getSpaceTexture(): THREE.Texture {
    if (!TextureManager._spaceTexture) {
      var textureLoader = new THREE.TextureLoader();
      var tex = textureLoader.load("images/space.jpg");
      TextureManager._spaceTexture = tex;
    }
    return TextureManager._spaceTexture;
  }

  static getRockTexture(): THREE.Texture {
    if (!TextureManager._rockTexture) {
      var textureLoader = new THREE.TextureLoader();
      var tex = textureLoader.load("images/stone.jpg");
      tex.mapping = THREE.CubeReflectionMapping;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      TextureManager._rockTexture = tex;
    }
    return TextureManager._rockTexture;
  }
}
module.exports = TextureManager;
