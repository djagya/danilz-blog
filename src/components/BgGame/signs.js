import React from 'react';

export default {
  gold: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="18" fill="none" strokeWidth="3" />
      <circle cx="25" cy="25" r="4" />
    </svg>
  ),
  // base matter or body
  salt: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="18" fill="none" strokeWidth="3" />
      <path strokeWidth="3" fill="none" d="m7,25 h 35" />
    </svg>
  ),
  // mind
  mercury: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <circle cx="25" cy="24" r="11" fill="none" strokeWidth="3" />
      <path d="M25,35v12M20,42h10M16,4.5a9.3,9.3 0 0 0 18.5,0" fill="none" strokeWidth="3" />
    </svg>
  ),
  // silver
  moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127 127">
      <path fill="none" strokeWidth="5" strokeLinejoin="round" d="m20,28 a 52,52 0 1,1 0,78 a 41,41 0 1,0 0-78 l 2-2" />
    </svg>
  ),
  silver: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <circle cx="25" cy="27" r="13" fill="none" strokeWidth="3" />

      <circle cx="25" cy="8" r="5" fill="none" strokeWidth="2" />
      <circle cx="8" cy="36" r="5" fill="none" strokeWidth="2" />
      <circle cx="42" cy="36" r="5" fill="none" strokeWidth="2" />
    </svg>
  ),
  vinegar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <circle cx="16" cy="18" r="3" />
      <circle cx="16" cy="32" r="3" />
      <circle cx="34" cy="18" r="3"  />
      <circle cx="34" cy="32" r="3"  />
      <path strokeWidth="3" d="m25,5 v40" />
      <path strokeWidth="3" d="m5,25 h40" />
      {/* Left, right */}
      <path strokeWidth="0.5" d="m5.25,25 v-10 Q 6,23 15,24 z" />
      <path strokeWidth="0.5" d="m5.25,25 v10 Q 6,27 15,26 z" />
      <path strokeWidth="0.5" d="m44.75,25 v-10 Q 44,23 35,24 z" />
      <path strokeWidth="0.5" d="m44.75,25 v10 Q 44,27 35,26 z" />
      {/* Top, bottom */}
      <path strokeWidth="0.5" d="m25,5.25 h10 Q 23,6 24,35 z" />
      <path strokeWidth="0.5" d="m25,5.25 h-10 Q 27,6 26,35 z" />
      <path strokeWidth="0.5" d="m25,44.75 h10 Q 23,44 24,15 z" />
      <path strokeWidth="0.5" d="m25,44.75 h-10 Q 27,44 26,15 z" />
    </svg>
  ),
  sulfuricAcid1: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="18" fill="none" strokeWidth="3" />
      <path strokeWidth="3" fill="none" d="m25,7 v 35" />
      <path strokeWidth="3" fill="none" d="m25,25 h -18" />
    </svg>
  ),
  sulfuricAcid2: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="18" fill="none" strokeWidth="3" />
      <path strokeWidth="3" fill="none" d="m25,7 v 35" />
      <path strokeWidth="3" fill="none" d="m25,25 h 18" />
    </svg>
  ),
  wax: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="8" fill="none" strokeWidth="3" />
      <path strokeWidth="3" fill="none" d="m25,25 m-8,0 h-12" />
      <path strokeWidth="3" fill="none" d="m25,25 m8,0 h12" />
      <path strokeWidth="3" fill="none" d="m25,25 m0,-8 v-12" />
      <path strokeWidth="3" fill="none" d="m25,25 m0,8 v12" />
    </svg>
  ),
  oil: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <circle cx="25" cy="13" r="7" fill="none" strokeWidth="2" />
      <circle cx="13" cy="34" r="7" fill="none" strokeWidth="2" />
      <circle cx="37" cy="34" r="7" fill="none" strokeWidth="2" />
    </svg>
  ),
};
