import React, { useCallback, useEffect, useState } from 'react';
import SIGNS from './signs';
import './bgGame.scss';
import useAnimationHook from './useAnimationHook';
import { applyTheme, getMatches, getNewDisplaySequence, getRandomThemeSequences, randomEl, THEMES } from './utils';

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
 * "win"/"lose" - an animation is running, switch to "init" when finished
 */
export default function BgGame({ largeGame = true }) {
  // const [state, setState] = useState('init');
  const [state, setState] = useState('playing');
  const [inputSeq, setInputSeq] = useState([]);
  const [firstSign, setFirstSign] = useState(randomEl(Object.keys(SIGNS)));
  const [closestMatch, setClosestMatch] = useState(null);
  const [activeItems, setActiveItems] = useState([0, 3]);
  // Game - one click, at some point player loses.
  const [gamesCount, setGamesCount] = useState(0);

  const newDisplaySequence = () => getNewDisplaySequence(inputSeq, matchMap, closestMatch, SEQ_LEN);
  const [displaySeq, setDisplaySeq] = useState(newDisplaySequence());

  useAnimationHook({
    state,
    size: SEQ_LEN,
    triggerStates: ['win', 'lose'],
    onUpdate: useCallback((v) => setActiveItems(v), [setActiveItems]),
    onEnd: useCallback(() => setState('init'), [setState]),
  });

  // Debug.
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Starting the game with sequences:');
      Object.keys(matchMap).forEach((_) => console.log(`Theme "${_}"`, matchMap[_]));

      // setState('win');
      // setInterval(() => {
      //   setState('win');
      // }, 20000);
    }
  }, []);

  useEffect(() => {
    // Generate a display sequence on game start and on input sequence change.
    if (state === 'init') {
      setActiveItems([]);
      setInputSeq([]);
      setFirstSign(randomEl(Object.keys(SIGNS)));
      setGamesCount(0);
    }
  }, [state]);

  /**
   * Determine win/lose on entering all signs.
   */
  useEffect(() => {
    // Find a theme which assigned signs would not differ from the entered sequence.
    // input: [moon, silver, gold], map: {theme1: [sulfur, salt, gold], theme2: [moon, silver, gold]}
    // "theme2" would be the match.

    // match: {theme, from: n, len: m}
    const matches = getMatches(inputSeq, matchMap);
    let themeMatch;
    if (matches.length) {
      const maxLenSeq = Math.max(...matches.map((m) => m.len));
      themeMatch = matches.find((m) => m.len === maxLenSeq);
      setClosestMatch(themeMatch);

      if (themeMatch.len === SEQ_LEN) {
        // We have a winner!
        setState('win');
        applyTheme(themeMatch.theme);
        return;
      }
    }

    // Allow to enter twice more than the themes sequence size to increase the chances.
    if (gamesCount >= GAMES_TO_LOSE) {
      setState('lose');
    } else {
      // Display a new set of icons, it includes at least one icon required for a theme sequence.
      setDisplaySeq(getNewDisplaySequence(inputSeq, matchMap, themeMatch || closestMatch, SEQ_LEN));
    }
  }, [inputSeq]);

  const className = { win: '_y', lose: '_n' }[state];

  const handleClick = (sign) => () => {
    if (state === 'playing') {
      // Append and take last SEQ_LEN elements, like a FIFO queue.
      setInputSeq([...inputSeq, sign].slice(-SEQ_LEN));
      setGamesCount((count) => count + 1);
    }
  };

  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <GameUtils
          onNew={() => setDisplaySeq(newDisplaySequence())}
          onLose={() => setState('lose')}
          // Input first N-1 signs, new display seq will have the last one.
          onWin={() => setInputSeq(matchMap[randomEl(THEMES)].slice(0, -1))}
        />
      )}

      <div className={`game ${largeGame ? 'game_large' : ''}`}>
        {state === 'init' && (
          <SvgButton className="game_init" alt={firstSign} onClick={() => setState('playing')}>
            {SIGNS[firstSign]()}
          </SvgButton>
        )}

        {state !== 'init' && (
          <>
            <SymbolsSet sequence={displaySeq} activeIndexes={activeItems} className={className} onClick={handleClick} />
            <MatchDots className={className} closestMatch={closestMatch} />
          </>
        )}

        <Stats
          gamesCount={gamesCount}
          state={state}
          inputSeq={inputSeq}
          closestMatch={closestMatch}
        />

        <div className={`game__text game__text_awful ${state === 'lose' ? 'game__text_active' : ''}`}>L O S E R</div>
        <div className={`game__text game__text_awesome ${state === 'win' ? 'game__text_active' : ''}`}>W I N N E R</div>
      </div>
    </>
  );
}

const Stats = ({ gamesCount, state, inputSeq, closestMatch }) => {
  return (
    <div style={{ fontSize: '0.15em', marginTop: '0.75rem' }}>
      Games count: {gamesCount}. State: {state}.
      <br />
      Input: {inputSeq.join(', ')}. <br />
      Closest match:{' '}
      {closestMatch
        ? `${closestMatch.theme}, ${closestMatch.len} len; ${matchMap[closestMatch.theme].join(', ')}`
        : `No matches`}
      . <br />
      {closestMatch && <img src={closestMatch.src} height="50px"/>}
    </div>
  );
};

/**
 * 1) Display current icons sequence.
 * 2) Display N of dots, where N = max matches across all theme sequences.
 * todo: figure out how to render dots? what does they mean?
 */
const SymbolsSet = ({ sequence, activeIndexes, className, onClick }) => (
  <>
    {sequence.map((sign, k) => (
      <SvgButton key={sign} alt={sign} className={activeIndexes.indexOf(k) !== -1 && className} onClick={onClick(sign)}>
        {SIGNS[sign]()}
      </SvgButton>
    ))}
  </>
);

const MatchDots = ({ className, closestMatch }) => (
  <div className="game__dots">
    {closestMatch && [...Array.from(closestMatch.len).keys()].map((v) => <MatchDot key={v} className={className} />)}
  </div>
);

const SvgButton = ({ alt, className, onClick, children }) => (
  <button title={alt || ''} className={`game__button ${className || ''}`} onClick={onClick}>
    {children}
  </button>
);

const MatchDot = ({ className }) => (
  <div className={`game__dot ${className || ''}`}>
    <div className="game__dot__wrapper">
      <div className="game__dot__shade" />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="24" />
      </svg>
    </div>
  </div>
);

function GameUtils({ onNew, onLose, onWin }) {
  return (
    <div className="game__utils">
      <button
        title="New seq"
        onClick={onNew}
        style={{
          padding: 0,
          margin: 0,
          border: 0,
          background: 'transparent',
        }}
      >
        ⟳
      </button>
      <button
        title="Lose"
        onClick={onLose}
        style={{
          padding: 0,
          margin: 0,
          border: 0,
          background: 'transparent',
        }}
      >
        ×
      </button>
      <button
        title="Win"
        onClick={onWin}
        style={{
          padding: 0,
          margin: 0,
          border: 0,
          background: 'transparent',
        }}
      >
        ✓
      </button>
    </div>
  );
}
