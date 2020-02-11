import SIGNS from './signs';
import bgMain from './bg/dark-red.png';
import bgGreenLine from './bg/green-line.jpg';
import bgLeaf from './bg/leaf.jpg';

export const SIZE = 3;
export const THEMES = ['_bg-main', '_bg-green-line', '_bg-leaf'];
export const FILES = {
  '_bg-main': bgMain,
  '_bg-green-line': bgGreenLine,
  '_bg-leaf': bgLeaf,
};

console.log(FILES);

export const randomEl = (array) => array[Math.round(Math.random() * (array.length - 1))];
export const diff = (a = [], b = []) => a.filter((_) => b.indexOf(_) === -1);
export const unique = (a = []) => a.filter((v, k, s) => s.indexOf(v) === k);

export function randomSigns(length = 3, mustHave = []) {
  const seq = [];
  while (seq.length < SIZE) {
    const el = mustHave.length && Math.random() > 0.5 ? randomEl(mustHave) : randomEl(Object.keys(SIGNS));
    if (seq.indexOf(el) === -1) {
      seq.push(el);
    }
  }
  return seq;
}

export function applyTheme(theme) {
  const classList = document.querySelector('body').classList;
  classList.remove(...THEMES.filter((_) => !!_));
  classList.add(theme);
}

export function getRandomThemeSequences(length) {
  return THEMES.reduce((map, theme) => {
    return { ...map, [theme]: randomSigns(length) };
  }, {});
}

/**
 * Subsequence must start from the first element of target (theme) sequence.
 * It must go without breaks until the last input element, otherwise it's not a match.
 */
export function findSubsequence(inputSeq, matchSeq, theme) {
  const firstMatch = inputSeq.indexOf(matchSeq[0]);

  let subSeqLen = 0;
  for (let i = firstMatch; i < inputSeq.length; i++) {
    // On first break in subsequence throw that away.
    if (inputSeq[i] !== matchSeq[subSeqLen]) {
      return null;
    }
    subSeqLen += 1;
  }
  return subSeqLen ? { theme, from: firstMatch, len: subSeqLen, src: FILES[theme] } : null;
}

// Matches must follow in the exact same order as encoded sequences.
export function getMatches(inputSeq, matchMap) {
  return Object.keys(matchMap).reduce((matches, theme) => {
    const matchSequence = findSubsequence(inputSeq, matchMap[theme], theme);
    return matchSequence ? [...matches, matchSequence] : matches;
  }, []);
}

/**
 * If closesMatch exists, force one of the match missing signs to appear.
 */
export function getNewDisplaySequence(inputSeq, matchMap, closestMatch, length) {
  // Subset of signs available to appear in the next display sequence.
  const subset = closestMatch
    ? matchMap[closestMatch.theme]
    : unique(Object.keys(matchMap).flatMap((_) => matchMap[_]));

  return randomSigns(length, diff(subset, inputSeq));
}
