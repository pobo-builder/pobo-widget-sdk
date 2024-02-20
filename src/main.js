import FullWidthService from "./poc/FullWidthService";

console.clear();

import scrollDomAnimation from 'scroll-dom-animation';

const defaultConfig = {
    time: 0.75,
    scaleFactor: 0.1,
    delay: 2.00

}

const elementsToAnimate = [
    [
        `.rc-image-right__text,
        .rc-video-right__text,
        .rc-image-half-right__text,
        .rc-video-half-right__text,
        .rc-parameter-small-left__box,
        .rc-profit__left-half,
        .rc-interview-photo__wrap-content,
        .rc-image-right-overlay__text`,
        '->',
        defaultConfig
    ],
    [
        `.rc-image-left__text,
        .rc-video-left__text,
        .rc-image-half-left__text,
        .rc-video-half-left__text,
        .rc-parameter-small-right__box,
        .rc-profit__right-half,
        .rc-image-left-overlay__text`,
        '<-',
        defaultConfig
    ],
    [
        `.widget-typography img,
        .rc-advantages-two__ico-img,
        .rc-advantages-three__ico-img,
        .rc-advantages-four__ico-img,
        .rc-team-three__single,
        .rc-counter__box`,
        '^',
        defaultConfig
    ]
];

new FullWidthService();