import React, { useCallback, useEffect, useState } from 'react';
import SIGNS from './signs';
import './bgGame.scss';
import useAnimateHook from './useAnimateHook';
import { applyTheme, diff, mustAppear, randomEl, randomSigns, SIZE, THEMES } from './utils';

const matchMap = THEMES.reduce((map, theme) => {
  return { ...map, [theme]: randomSigns(SIZE) };
}, {});

/**
 * A mini bgame to switch the page background when entered a sequence of symbols matching an encoded body theme.
 * Where a theme is encoded like so: [moon, salt, silver].
 *
 * States:
 * "init" - a random sign is displayed, start bgame on click
 * "playing" - sets of random signs (with at least one from not yet inputted themes symbols) are displayed until SIZE symbols are clicked.
 * "win"/"lose" - an animation is running, switch to "init" when finished
 */
export default function BgGame() {
  const [state, setState] = useState('init');
  const [inputSeq, setInputSeq] = useState([]);
  const [firstSign, setFirstSign] = useState(randomEl(Object.keys(SIGNS)));
  const [displaySeq, setDisplaySeq] = useState(randomSigns(SIZE, mustAppear(matchMap)));
  const [activeItems, setActiveItems] = useState([]);

  useAnimateHook({
    state,
    size: SIZE,
    triggerStates: ['win', 'lose'],
    onUpdate: setActiveItems,
    onEnd: useCallback(() => setState('init'), []),
  });

  // Debug.
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Starting the game with sequences:');
      Object.keys(matchMap).forEach((_) => console.log(`Theme "${_}"`, matchMap[_]));

      setTimeout(() => {
        setState('win');
      }, 2000);
    }
  }, []);

  useEffect(() => {
    // Generate a display sequence on game start and on input sequence change.
    if (state === 'init') {
      setActiveItems([]);
      setInputSeq([]);
      setFirstSign(randomEl(Object.keys(SIGNS)));
    }
  }, [state]);

  /**
   * Determine win/lose on entering all signs.
   */
  useEffect(() => {
    // Find a theme which assigned signs would not differ from the entered sequence.
    // input: [moon, silver, gold], map: {theme1: [sulfur, salt, gold], theme2: [moon, silver, gold]}
    // "theme2" would be the match.
    const match = Object.keys(matchMap).find((theme) => diff(matchMap[theme], inputSeq).length === 0);
    if (match) {
      setState('win');
      applyTheme(match);
      return;
    }

    // Allow to enter twice more than the themes sequence size to increase the chances.
    if (inputSeq.length >= SIZE * 2) {
      setState('lose');
    } else {
      // Display a new set of icons, it includes at least one icon required for a theme sequence.
      setDisplaySeq(randomSigns(SIZE, mustAppear(matchMap, inputSeq)));
    }
  }, [inputSeq]);

  const className = { win: '_y', lose: '_n' }[state];

  return (
    <div className="bgame">
      {state === 'init' && (
        <SvgButton alt={firstSign} onClick={() => setState('playing')}>
          {SIGNS[firstSign]()}
        </SvgButton>
      )}

      {state !== 'init' && (
        <SymbolsSet
          sequence={displaySeq}
          activeIndexes={activeItems}
          className={className}
          onClick={(sign) => () => state === 'playing' && setInputSeq([...inputSeq, sign])}
        />
      )}
    </div>
  );
}

/**
 * 1) Display current icons sequence.
 * 2) Display N of dots, where N = max matches across all theme sequences.
 */
const SymbolsSet = ({ sequence, activeIndexes, className, onClick }) => (
  <>
    {sequence.map((sign, k) => (
      <SvgButton key={sign} alt={sign} className={activeIndexes.indexOf(k) !== -1 && className} onClick={onClick(sign)}>
        {SIGNS[sign]()}
      </SvgButton>
    ))}

    <div className="bgame__dots">
      {/*{[...Array(maxMatchesCount(matchMap, inputSeq)).keys()].map((v, k) => (*/}
      {[...Array(3).keys()].map((v, k) => (
        <MatchDot key={v} className={activeIndexes.indexOf(k) !== -1 && className} />
      ))}
    </div>
  </>
);

const SvgButton = ({ alt, className, onClick, children }) => (
  <button title={alt || ''} className={`bgame__button ${className || ''}`} onClick={onClick}>
    {children}
  </button>
);

const MatchDot = ({ className }) => (
  <div className={`bgame__dot ${className || ''}`}>
    <div className="bgame__dot__wrapper">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="25" />
      </svg>
    </div>
  </div>
);
