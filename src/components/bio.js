/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import Image from 'gatsby-image';

import { rhythm } from '../utils/typography';

const Bio = ({style}) => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author
          social {
            twitter
          }
        }
      }
    }
  `);

  const { author, social } = data.site.siteMetadata;
  return (
    <div style={style}>
      <div style={{ display: 'flex' }}>
        <Image
          fixed={data.avatar.childImageSharp.fixed}
          alt={author}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            minWidth: 50,
            borderRadius: `100%`,
          }}
          imgStyle={{
            borderRadius: `50%`,
          }}
        />
        <p style={{marginBottom: rhythm(1/2)}}>
          Попытка документировать результаты узнавания и разбирания – для себя, для других.
        </p>
      </div>
      <div style={{color: '#9e9e9e', fontSize: rhythm(0.5)}}>
        <a href={`https://soundcloud.com/${social.soundcloud}`}>
          My SoundCloud
        </a>{' '}/{' '}
        <a href="https://t.me/listening_now">
          'Listening now' on Telegram
        </a>{' '}/{' '}
      </div>
    </div>
  );
};

export default Bio;
