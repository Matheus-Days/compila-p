import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const openedAnimation = trigger('opened', [
  state('true', style({ overflowX: 'hidden', width: '*' })),
  state('false', style({ overflowX: 'hidden', width: '0' })),
  transition('true => false', [
    animate('300ms ease-in-out', keyframes([
      style({ width: '0', offset: 1 })
    ]))
  ]),
  transition('false => true', [
    animate('300ms ease-in-out', keyframes([
      style({ width: '*', offset: 1 })
    ]))
  ])
]);

export const slideLeftAnimation = trigger('slide-left', [
  state('true', style({ transform: 'translateX(0)' })),
  state('false', style({ transform: 'translateX(-100%)' })),
  transition('true => false', [
    animate('300ms ease-in-out', keyframes([
      style({ transform: 'translateX(-100%)', offset: 1 })
    ]))
  ]),
  transition('false => true', [
    animate('300ms ease-in-out', keyframes([
      style({ transform: 'translateX(0)', offset: 1 })
    ]))
  ])
]);

export const slideRightAnimation = trigger('slide-right', [
  state('true', style({ transform: 'translateX(0)' })),
  state('false', style({ transform: 'translateX(100%)' })),
  transition('true => false', [
    animate('300ms ease-in-out', keyframes([
      style({ transform: 'translateX(100%)', offset: 1 })
    ]))
  ]),
  transition('false => true', [
    animate('300ms ease-in-out', keyframes([
      style({ transform: 'translateX(0)', offset: 1 })
    ]))
  ])
]);

