import Typography from 'typography';
import wordpressKubrickTheme from 'typography-theme-wordpress-kubrick';
import Wordpress2016 from 'typography-theme-wordpress-2016';
import doelgerTheme from 'typography-theme-doelger';

// https://kyleamathews.github.io/typography.js/
// const theme = doelgerTheme;
const theme = wordpressKubrickTheme;

theme.baseFontSize = '14px';
theme.overrideThemeStyles = () => {
  return {
    'a.gatsby-resp-image-link': {
      boxShadow: `none`,
    },
  };
};

const typography = new Typography(theme);

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles();
}

export default typography;
export const rhythm = typography.rhythm;
export const scale = typography.scale;
