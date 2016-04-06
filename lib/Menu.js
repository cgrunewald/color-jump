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

class Menu {
  constructor(game) {
    this._game = game;
  }

  _buildMenu(title: string, onBack: ?Function, items: Array<Object>): void {
    jQuery('#overlay').css({display: 'flex'});
    const menuItems = jQuery('#menu-items');
    menuItems.empty();

    if (onBack) {
      jQuery('#menu-back').css({display: 'block'});
      jQuery('#menu-back').on('click', onBack);
    } else {
      jQuery('#menu-back').css({display: 'none'});
    }

    for (var ii = 0; ii < items.length; ii++) {
      var item = items[ii];
      var element = jQuery('<li>' + item.name + '</li>');
      if (item.onClick) {
        element.on('click', item.onClick);
      }

      menuItems.append(element);
    }
  }

  updateColorQueue(removed: number, colors: Array<number>): void {
    const colorQueueElement = jQuery('#nextColors');
    colorQueueElement.empty();

    if (colors.length !== 0) {
      colors.forEach(function (color) {
        var element = jQuery('<span class="block"></span>');
        var colorString = color.toString(16);
        while(colorString.length < 6) {
          colorString = '0' + colorString;
        }
        element.css({backgroundColor: '#' + colorString});

        colorQueueElement.append(element);
      });
    }
  }

  updateHighScore(score: number): void {
    jQuery('#score').text(score.toLocaleString());
  }

  setupStartMenu() {
    var self = this;
    this._buildMenu(
      'Main Menu',
      null,
      [
        {
          name: 'Start',
          onClick: function (evt) {
            jQuery('#overlay').css({display: 'none'});
            self._game.start();
          },
        },
        {
          name: 'Controls',
        },
      ]
    );
  }

  setupGameOverMenu() {
    this.updateHighScore(0);
    this.updateColorQueue(0, []);

    var self = this;
    this._buildMenu(
      'Main Menu',
      null,
      [
        {
          name: 'New Game',
          onClick: function (evt) {
            jQuery('#overlay').css({display: 'none'});
            self._game.reset();
            self._game.start();
          },
        },
      ]
    );
  }

}
module.exports = Menu;
