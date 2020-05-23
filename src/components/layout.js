import React from 'react';
import { Link } from 'gatsby';
import BgGame from './BgGame/BgGame';
import './layout.scss';
import { cx } from '../utils/ui';

const Layout = ({ location, title, children, largeGame = false }) => {
  return (
    <div className="app">
      <header>
        <div className={cx('bgame-wrapper', largeGame && 'bgame-wrapper_large')}>
          <BgGame large={largeGame} />
        </div>

        <div className="title-wrapper">
          <h1>
            <Link
              style={{
                boxShadow: `none`,
                textDecoration: `none`,
                color: `inherit`,
              }}
              to={`/`}
            >
              {title}
            </Link>
          </h1>
          <div className="square" />
        </div>

        <div className="menu">
          <a href="https://soundcloud.com/djagya" target="_blank">
            SC
          </a>
          <a href="https://t.me/listening_now" target="_blank">
            TG
          </a>
        </div>

        <hr className="separator" />
      </header>
      <main>{children}</main>
      <footer></footer>
    </div>
  );
};

export default Layout;
