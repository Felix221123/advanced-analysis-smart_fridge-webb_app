// styles/components/Loader.ts
import styled, { keyframes } from 'styled-components'
import { OverLayEffect } from '../mixin'

// Bounce animation
const bounce = keyframes`
  0% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
  80%, 100% {
    transform: scale(0);
  }
`

// Container centers everything
export const PreloaderContainer = styled.div`
  display: grid;
  place-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
  transition: all 0.5s;
`

export const BodyOverlay = styled.div`
  ${OverLayEffect};
`
// Wrap holds the balls
export const Wrap = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 6rem;
`

// Animated ball
export const Ball = styled.div<{ index: number }>`
  width: 2.5rem;
  height: 2.5rem;
  background-color: hsla(212, 100%, 50%, 0.6);
  border-radius: 50%;
  animation: ${bounce} 1.1s ${({ index }) => `-${(index + 1) * 0.08}s`} infinite;
`