import React, { useCallback, useEffect, useState } from 'react';
import SIGNS from './signs';
import './bgGame.scss';
import useAnimationHook from './useAnimationHook';
import {
  applyTheme,
  flatList,
  getMatches,
  getRandomThemeSequences,
  randomEl,
  randomSigns,
  SIZE,
  THEMES,
} from './utils';
import { GameUtils } from './devUtils';
import { cx } from '../../utils/ui';

const SEQ_LEN = 3;
const GAMES_TO_LOSE = 15;
const matchMap = getRandomThemeSequences(SEQ_LEN);

/**
 * A mini game to switch the page background when entered a sequence of symbols matching an encoded body theme.
 * Where a theme is encoded like so: [moon, salt, silver].
 *
 * States:
 * "init" - a random sign is displayed, start game on click
 * "playing" - sets of random signs (with at least one from not yet inputted themes symbols) are displayed until SEQ_LEN symbols are clicked.
 * "finished" - an animation is running, switch to "init" when finished
 * "resetting" - gradually reset the game via animations
 */
export default function BgGame({ large = false, debug = false }) {
  const [state, setState] = useState('init');
  const [inputSeq, setInputSeq] = useState([]);
  const [closestMatch, setClosestMatch] = useState(null);
  const [activeItems, setActiveItems] = useState([0, 3]);
  // Game - one click, at some point player loses.
  const [gamesCount, setGamesCount] = useState(0);
  const [displaySeq, setDisplaySeq] = useState(randomSigns(SEQ_LEN, flatList(matchMap)));

  const hasWon = () => closestMatch && closestMatch.len === SEQ_LEN;
  const className = state === 'finished' ? (hasWon() ? '_y' : '_n') : null;

  useAnimationHook({
    state,
    size: SEQ_LEN,
    triggerState: 'finished',
    onUpdate: useCallback((v) => setActiveItems(v), [setActiveItems]),
    onEnd: useCallback(() => {
      setState('resetting');
      setTimeout(() => setState('init'), 1000);
    }, [setState]),
  });

  useEffect(() => {
    // Generate a display sequence on game start and on input sequence change.
    if (state === 'init') {
      setActiveItems([]);
      setInputSeq([]);
      setGamesCount(0);
      setClosestMatch(null);
    }
    // Allow to enter twice more than the themes sequence size to increase the chances.
    if (state === 'playing' && gamesCount >= GAMES_TO_LOSE) {
      setState('finished');
      setClosestMatch(null);
    }
  }, [state, gamesCount]);

  /**
   * Find a closest matching theme (starts with one of the input symbols), finish the game if it fully matches.
   * Otherwise display a new sequence, which contains the next symbol of the closest match sequence.
   *
   * Match data structure: {theme, from: n, len: m, file: imgSrc}
   */
  useEffect(() => {
    // Update state if invalid due to the dev utils usage.
    if (state === 'init' && inputSeq.length) {
      setState('playing');
    }

    let themeMatch = null;
    const matches = getMatches(inputSeq, matchMap);
    if (matches.length) {
      const maxLenSeq = Math.max(...matches.map((m) => m.len));
      themeMatch = matches.find((m) => m.len === maxLenSeq);
    }
    setClosestMatch(themeMatch);

    if (themeMatch && themeMatch['len'] === SEQ_LEN) {
      setState('finished');
      applyTheme(themeMatch.theme);
    } else {
      setDisplaySeq(randomSigns(SEQ_LEN, themeMatch ? [themeMatch['next']] : flatList(matchMap)));
    }

  }, [inputSeq.toString()]);

  const handleClick = (sign) => () => {
    if (state === 'init') {
      setState('playing');
    }
    if (state === 'playing') {
      // Append and take last SEQ_LEN elements, like a FIFO queue.
      setInputSeq([...inputSeq, sign].slice(-SEQ_LEN));
      setGamesCount((count) => count + 1);
    }
  };

  // todo: maybe replace the whole sequence with EndText (with fade animation) - tidy
  return (
    <div className="game">
      <Side closestMatch={closestMatch} showMatched={large} className={className} />

      <div className="game__main">
        <SymbolsSet
          sequence={displaySeq}
          activeIndexes={activeItems}
          highlightEl={closestMatch && closestMatch.next}
          isInit={state === 'init' || state === 'resetting'}
          isAnimating={state === 'finished' || state === 'resetting'}
          className={className}
          onClick={handleClick}
        />

        {state === 'finished' && <EndText won={hasWon()} />}
      </div>

      {debug && process.env.NODE_ENV === 'development' && (
        <div className="game__debug">
          <GameUtils
            onNew={() => setState('init')}
            onLose={() => setState('finished')}
            // Input first N-1 signs, new display seq will have the last one.
            onWin={() => setInputSeq(matchMap[randomEl(THEMES)].slice(0, -1))}
          />
        </div>
      )}
    </div>
  );
}

const Side = ({ className, showMatched, closestMatch }) => (
  <div className="game__side">
    {showMatched && closestMatch && (
      <div className="game__guessed">
        {matchMap[closestMatch.theme].slice(closestMatch.from, closestMatch.from + closestMatch.len).map((sign) => (
          <div className="game__guessed__sign">
            <div className="game__guessed__sign-wrapper">
              <div className="_matched">{SIGNS[sign]()}</div>
            </div>
          </div>
        ))}
      </div>
    )}

    <MatchDots className={className} closestMatch={closestMatch} side />
  </div>
);

const SymbolsSet = ({ sequence, highlightEl, activeIndexes, isAnimating, isInit, className, onClick }) => (
  <div className={cx('game__sequence', !isInit && '_playing', isAnimating && '_animating')}>
    {sequence.map((sign, k) => (
      <SvgButton
        key={sign}
        alt={sign}
        className={cx(
          isInit && k === 0 && '_init',
          highlightEl === sign && '_choose',
          activeIndexes.indexOf(k) !== -1 && className,
        )}
        onClick={onClick(sign)}
      >
        {SIGNS[sign]()}
      </SvgButton>
    ))}
  </div>
);

const MatchDots = ({ className, closestMatch, side = false }) => (
  <div className={cx('game__dots', side && 'game__dots_side')}>
    {[...Array(SIZE).keys()].map((v) => (
      <MatchDot key={v} className={className} visible={closestMatch && v < closestMatch.len} />
    ))}
  </div>
);

const SvgButton = ({ alt, className, onClick, children }) => (
  <button title={alt || ''} className={cx('game__button', className)} onClick={onClick}>
    {children}
  </button>
);

const MatchDot = ({ className, visible = true }) => (
  <div className={cx('game__dot', className, visible && 'game__dot_on')}>
    <div className="game__dot__wrapper">
      <div className="game__dot__shade" />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="24" />
      </svg>
    </div>
  </div>
);

const EndText = ({ won }) =>
  won ? <div className="game__text _awesome">W I N N E R</div> : <div className="game__text _awful">L O S E R</div>;
