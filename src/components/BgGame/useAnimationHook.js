import { useEffect, useRef } from 'react';

const ANIM_SPEED = 250;

/**
 * Animate icons when a game state switches to the one of the specified trigger states.
 */
export default function useAnimationHook({ state, size, triggerStates = [], baseSpeed = ANIM_SPEED, onUpdate, onEnd }) {
  // timers and intervals
  const workerIds = useRef([]);

  const statesDep = triggerStates.toString();
  useEffect(() => {
    if (triggerStates.indexOf(state) === -1) {
      return;
    }

    const sequence = [
      blinkAll(2, baseSpeed * 2),
      blinkEach(10, baseSpeed * 2, true),
      blinkAll(2, baseSpeed),
      blinkEach(4, baseSpeed / 2),
    ];

    const finalPromise = sequence.reduce(
      (promise, nextAnimation) => promise.then(() => nextAnimation(size, onUpdate, workerIds)),
      Promise.resolve(),
    );
    finalPromise.then(onEnd);

    return () => {
      // Stop all with the same function (allowed but confusing), remove from the list.
      workerIds.current = workerIds.current.filter((_) => clearTimeout(_));
    };
  }, [state, size, statesDep, baseSpeed, onUpdate, onEnd]);
}

/**
 * Blink elements one by one from left to right in cycles.
 */
const blinkEach = (times = 5, speed = ANIM_SPEED, cycle = false) => (size, onUpdate, workerIds) =>
  new Promise((resolve) => {
    onUpdate([0]);

    let step = +1;
    let atStart = false; // last N position
    let atEnd = false; // last N position
    // Bump from array bounds, change the direction. Or use the previous step.
    const getNext = (n) => {
      if (!cycle) {
        return (n + 1) % size;
      }
      // last N was null - turned off - begin a new cycle to the other direction
      if (n === null) {
        step = atStart ? +1 : -1;
        return atStart ? 0 : size - 1;
      }
      atStart = n === 0;
      atEnd = n === size - 1;
      // when came from opposite side and turned off - a cycle has ended, turn off the last element
      return (atStart && step === -1) || (atEnd && step === +1) ? null : n + step;
    };
    const int = setInterval(() => {
      onUpdate((n) => [getNext(n[0])]);
    }, speed);
    const time = setTimeout(() => clearInterval(int) || resolve(), speed * times);

    workerIds.current.push(time, int);
  });

/**
 * Blink all elements simultaneously.
 */
const blinkAll = (times = 2, speed = ANIM_SPEED) => (size, onUpdate, workerIds) =>
  new Promise((resolve) => {
    const all = [...Array(size).keys()];
    onUpdate(all);

    const int = setInterval(() => onUpdate((v) => (v.length ? [] : all)), speed);
    const time = setTimeout(() => clearInterval(int) || resolve(), speed * times * 2); // 2 call per cycle

    workerIds.current.push(time, int);
  });
