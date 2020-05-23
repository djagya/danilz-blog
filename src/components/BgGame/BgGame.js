import React, { useCallback, useEffect, useState } from 'react';
import Loadable from '@loadable/component';
import SIGNS from './signs';
import './bgGame.scss';
import useAnimationHook from './useAnimationHook';
import {
  applyTheme,
  flatList,
  getRandomThemeSequences,
  getThemeMatch,
  randomEl,
  randomSigns,
  SIZE,
  THEMES,
} from './utils';
import { GameUtils } from './devUtils';
import { cx } from '../../utils/ui';

const STATE_INIT = 'init';
const STATE_PLAY = 'playing';
const STATE_FINISH = 'finished';
const SEQ_LEN = 3;
const GAMES_TO_LOSE = 10;

const matchMap = getRandomThemeSequences(SEQ_LEN);
const isDev = process.env.NODE_ENV === 'development';

const PointsPlot = Loadable(() => import('./PointsPlot'));

/**
 * A mini game to switch the page background when entered a sequence of symbols matching an encoded body theme.
 * Where a theme is encoded like so: [moon, salt, silver].
 *
 * todo: MAAAYBE select a random sequence to guess per game.
 * todo: Lazy load of the whole game on first click.
 *
 * States:
 * "init" - a random sign is displayed, start game on click
 * "playing" - sets of random signs (with at least one from not yet inputted themes symbols) are displayed until SEQ_LEN symbols are clicked.
 * "finished" - an animation is running, switch to "init" when finished
 */
export default function BgGame({ large = false, debug = false }) {
  const [state, setState] = useState(STATE_INIT);
  const [inputSeq, setInputSeq] = useState([]);
  const [closestMatch, setClosestMatch] = useState(null);
  const [activeItems, setActiveItems] = useState([0, 3]);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [displaySeq, setT] = useState(randomSigns(SEQ_LEN, flatList(matchMap)));

  const setDisplaySeq = (v) => {
    console.log('setting', v);
    setT(v);
  };

  const [gamesHistory, setGamesHistory] = useState([
    // { won: false, points: 0, n: 0 }, // initial game
  ]);

  // DEBUG
  // useEffect(() => {
  //   const t = setTimeout(() => {
  //     console.log('current history', gamesHistory);
  //     logGame(Math.random() > 0.5);
  //   }, 3000);
  //   return () => clearTimeout(t);
  // }, [gamesHistory]);

  const isPlotShown = gamesHistory.filter((game) => game.won).length >= 2;
  const isGameExpanded = isPlotShown || [STATE_PLAY, STATE_FINISH].includes(state);
  const hasWon = () => closestMatch && closestMatch.len === SEQ_LEN;
  const className = state === STATE_FINISH ? (hasWon() ? '_y' : '_n') : null;

  function resetGame() {
    setActiveItems([]);
    setInputSeq([]);
    setAttemptsCount(0);
    setClosestMatch(null);
    setDisplaySeq(randomSigns(SEQ_LEN, flatList(matchMap)));
    setState(STATE_INIT);
  }

  useEffect(() => {
    // Allow to enter twice more than the themes sequence size to increase the chances.
    if (state === STATE_PLAY && attemptsCount >= GAMES_TO_LOSE) {
      // Lost.
      setState(STATE_FINISH);
      setClosestMatch(null);
      logGame(false);
    }
  }, [state, attemptsCount]);

  /**
   * Find a closest matching theme (starts with one of the input symbols), finish the game if it fully matches.
   * Otherwise display a new sequence, which contains the next symbol of the closest match sequence.
   *
   * Match data structure: {theme, from: n, len: m, file: imgSrc}
   */
  useEffect(() => {
    const themeMatch = getThemeMatch(inputSeq, matchMap);
    const isWin = themeMatch && themeMatch['len'] === SEQ_LEN;

    setClosestMatch(themeMatch);
    setDisplaySeq(randomSigns(SEQ_LEN, themeMatch && themeMatch.next ? [themeMatch.next] : flatList(matchMap)));

    if (isWin) {
      setState(STATE_FINISH);
      applyTheme(themeMatch.theme);
      logGame(true);
    }
  }, [inputSeq.toString()]);

  useAnimationHook({
    state,
    size: SEQ_LEN,
    triggerState: STATE_FINISH,
    onUpdate: useCallback((v) => setActiveItems(v), [setActiveItems]),
    onEnd: useCallback(() => resetGame(), [setState]),
  });

  // todo: maybe replace the whole sequence with EndText (with fade animation) - tidy
  return (
    <div className="game">
      <Side closestMatch={closestMatch} showMatched={large} className={className} />

      <div className="game__main">
        <SymbolsSet
          sequence={displaySeq}
          activeIndexes={activeItems}
          highlightEl={isDev && closestMatch && closestMatch.next}
          expanded={isGameExpanded}
          isAnimating={[STATE_FINISH].includes(state)}
          className={className}
          onClickCreator={createClickHandler}
        />
        {isPlotShown && <PointsPlot gamesHistory={gamesHistory} />}
        {state === STATE_FINISH && <EndText won={hasWon()} />}
      </div>

      {debug && isDev && (
        <div className="game__debug">
          <GameUtils
            onNew={() => resetGame()}
            onLose={() => setState(STATE_FINISH)}
            // Input first N-1 signs, new display seq will have the last one.
            onWin={() => setInputSeq(matchMap[randomEl(THEMES)].slice(0, -1))}
          />
        </div>
      )}
    </div>
  );

  function createClickHandler(sign) {
    return () => {
      if (state === STATE_INIT) {
        setState(STATE_PLAY);
        return;
      }
      if (state === STATE_PLAY) {
        // Append and take last SEQ_LEN elements, like a FIFO queue.
        const seq = [...inputSeq, sign].slice(-SEQ_LEN);
        setInputSeq(seq);
        const themeMatch = getThemeMatch(seq, matchMap);
        // Don't count last games if guessed a sign - to allow the player to use that last chance to guess a whole seq.
        if (
          themeMatch &&
          (!closestMatch || closestMatch.theme === themeMatch?.theme) &&
          attemptsCount + 1 >= GAMES_TO_LOSE
        ) {
          return;
        }
        setAttemptsCount((count) => count + 1);
      }
    };
  }

  function logGame(won) {
    setGamesHistory((gamesHistory) => {
      const lastGame = gamesHistory[gamesHistory.length - 1];

      return [
        ...gamesHistory,
        {
          won,
          // Inc/dec most recent points - from the last game
          points: (lastGame?.points || 0) + (won ? 1 : -1),
          n: (lastGame?.n || 0) + 1,
        },
      ];
    });
  }
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

const SymbolsSet = ({ sequence, highlightEl, activeIndexes, isAnimating, expanded, className, onClickCreator }) => (
  <div className={cx('game__sequence', expanded && '_playing', isAnimating && '_animating')}>
    {sequence.map((sign, k) => (
      <SvgButton
        key={sign + k}
        alt={sign}
        className={cx(
          !expanded && k === 0 && '_init', // one initial symbol to start the game
          highlightEl === sign && '_choose', // debug class to show next correct button
          activeIndexes.indexOf(k) !== -1 && className,
        )}
        onClick={onClickCreator(sign)}
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
