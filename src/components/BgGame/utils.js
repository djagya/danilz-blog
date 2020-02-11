import SIGNS from './signs';

export const SIZE = 3;
export const THEMES = ['', '_bg-green-line', '_bg-green-leaf'];

export const randomEl = (array) => array[Math.round(Math.random() * (array.length - 1))];
export const diff = (a = [], b = []) => a.filter((_) => b.indexOf(_) === -1);
export const unique = (a = []) => a.filter((v, k, s) => s.indexOf(v) === k);
export const mustAppear = (map, entered) => diff(unique(Object.keys(map).flatMap((_) => map[_])), entered);
export const maxMatchesCount = (map, seq) => Math.max(...Object.keys(map).map((theme) => SIZE - diff(map[theme], seq).length));

export function randomSigns(length = 3, mustHave = []) {
  let t = 0;
  while (true) {
    const seq = [];
    while (seq.length < SIZE) {
      const el = randomEl(Object.keys(SIGNS));
      if (seq.indexOf(el) === -1) {
        seq.push(el);
      }
    }

    if (mustHave.length === 0 || diff(seq, mustHave).length < SIZE) {
      return seq;
    }
    if (t > 10) {
      throw new Error();
    }
  }
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
