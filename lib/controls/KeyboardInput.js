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

function cancelEvent(evt) {
  if (evt.cancelDefault) {
    evt.cancelDefault();
  } else {
    evt.stopPropagation();
  }
}

const KeyboardInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  action: false,

  receivedInput: function() {
    return
      this.forward ||
      this.backward ||
      this.left ||
      this.right ||
      this.action;
  },
  reset: function() {
    this.forward = this.backward = this.left = this.right = this.action = false;
  },
};

window.addEventListener('keyup', function(evt) {
  switch (evt.keyCode) {
    case 38:
    case 87:
      KeyboardInput.forward = false;
      break;
    case 39:
    case 68:
      KeyboardInput.right = false;
      break;
    case 40:
    case 83:
      KeyboardInput.backward = false;
      break;
    case 37:
    case 65:
      KeyboardInput.left = false;
      break;
    case 32:
      KeyboardInput.action = false;
      break;
  }

  cancelEvent(evt);
});

window.addEventListener('keypress', function(evt) {
  cancelEvent(evt);
});

window.addEventListener('keydown', function(evt) {
  switch (evt.keyCode) {
    case 38:
    case 87:
      KeyboardInput.forward = true;
      break;
    case 39:
    case 68:
      KeyboardInput.right = true;
      break;
    case 40:
    case 83:
      KeyboardInput.backward = true;
      break;
    case 37:
    case 65:
      KeyboardInput.left = true;
      break;
    case 32:
      KeyboardInput.action = true;
      break;
  }

  cancelEvent(evt);
});

module.exports = KeyboardInput;
