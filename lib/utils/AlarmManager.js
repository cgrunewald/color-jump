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

const PriorityQueue = require('js-priority-queue');

class AlarmItem {

  constructor(elapsedTime: number, updateFunction: Function) {
    this._elapsedTime = elapsedTime;
    this._updateFunction = updateFunction;
  }

  run(): void {
    this._updateFunction();
  }

  getElapsedTime(): number {
    return this._elapsedTime;
  }
}

class AlarmManager {
  _running: bool;

  constructor() {
    this._running = true;
    this._elapsedTimeInSeconds = 0;
    this._alarmQueue = new PriorityQueue({
      comparator: function(a: AlarmItem, b: AlarmItem): number {
        return a.getElapsedTime() - b.getElapsedTime();
      },
    })
  }

  cancelAllAlarms(): void {
    this._alarmQueue.clear();
  }

  getElapsedTime(): number {
    return this._elapsedTimeInSeconds;
  }

  setAlarm(secondsToWait: number, updateFunction: Function): void {
    const alarmItem = new AlarmItem(
      this.getElapsedTime() + secondsToWait,
      updateFunction
    );
    this._alarmQueue.queue(alarmItem);
  }

  update(delta: number): void {
    if (!this._running) {
      return;
    }

    this._elapsedTimeInSeconds += delta;

    while (
      this._alarmQueue.length > 0 &&
      this._alarmQueue.peek().getElapsedTime() < this.getElapsedTime()
    ) {
      const alarmItem = this._alarmQueue.dequeue();
      alarmItem.run();
    }
  }

  setRunning(running: bool) {
    this._running = running;
  }
}
module.exports = new AlarmManager();
