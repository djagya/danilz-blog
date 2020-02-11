import { useCallback, useEffect, useRef, useState } from 'react';

const ANIM_SPEED = 250;

/**
 * Animate icons when a game state switches to the one of the specified trigger states.
 */
export default function useAnimateHook({ state, size, triggerStates = [], baseSpeed = ANIM_SPEED, onUpdate, onEnd }) {
  const isRunning = useRef(false);
  const refs = useRef({t: [], i: []}); // timers and intervals

  const all = [...Array(size).keys()];

  const blinkAll = useCallback((times = 2, speed = baseSpeed) =>
    new Promise((resolve) => {
      console.log('Blinking all');

      onUpdate(all);
      const int = setInterval(() => onUpdate((v) => (v.length ? [] : all)), speed);
      const time = setTimeout(() => {
        clearInterval(int);
        resolve();
      }, speed * times * 2); // 2 call per cycle

      refs.current.t.push(time);
      refs.current.i.push(int);
    }), [baseSpeed, onUpdate]);

  useEffect(() => {
    if (isRunning.current || triggerStates.indexOf(state) === -1) {
      return;
    }

    isRunning.current = true;

    const all = [...Array(size).keys()];


    const blinkAll = (times = 2, speed = baseSpeed) =>
      new Promise((resolve) => {
        console.log('Blinking all');
        onUpdate(all);
        const int = setInterval(() => onUpdate((v) => (v.length ? [] : all)), speed);
        const time = setTimeout(() => {
          clearInterval(int);
          resolve();
        }, speed * times * 2); // 2 call per cycle
        timers.push(time);
        intervals.push(int);
      });

    const blinkEach = (times = 5, speed = baseSpeed) =>
      new Promise((resolve) => {
        console.log('Blinking each');
        onUpdate([0]);
        const int = setInterval(() => onUpdate((n) => [(n + 1) % size]), speed);
        const time = setTimeout(() => {
          clearInterval(int);
          resolve();
        }, speed * times);
        timers.push(time);
        intervals.push(int);
      });

    blinkAll(2, baseSpeed * 2)
      .then(() => blinkEach(9))
      .then(() => blinkAll(2, baseSpeed * 2))
      .then(() => {
        onEnd();
        isRunning.current = false;
      });

    return () => {
      timers.forEach((_) => clearTimeout(_));
      intervals.forEach((_) => clearInterval(_));
      timers = [];
      intervals = [];
      isRunning.current = false;
    };
  }, [state, size, triggerStates, baseSpeed]);
}
