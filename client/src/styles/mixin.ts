// mixins object
import { css } from 'styled-components'


export const flexCenter = (direction: string, justify?: string) => css`
  display: flex;
  justify-content: ${justify};
  align-items: center;
  flex-direction: ${direction};
`

export const flex = (direction: string) => css`
  display: flex;
  flex-direction: ${direction};
`

export const fontSize12px = css`
  font-size: clamp(0.75rem, 0.755vw, 0.76rem);
`

export const fontSize13px = () => css`
  font-size: clamp(0.8125rem, 0.82vw, 0.825rem);
`;

export const fontSize18px = () => css`
  font-size: clamp(1.125rem, 1.13vw, 1.13rem);
`;

export const fontSize15px = () => css`
  font-size: clamp(0.9375rem, 0.94vw, 0.94rem);
`;

export const fontSize16px = () => css`
  font-size: clamp(1rem, 1.05vw, 1.05rem);
`;

export const fontSize14px = () => css`
  font-size: clamp(0.875rem, 0.88vw, 0.89rem);
`;

export const fontSize20px = () => css`
  font-size: clamp(1.25rem, 1.25vw, 1.26rem);
`;

export const fontSize28px = () => css`
  font-size: clamp(1.75rem, 1.78vw, 1.79rem);
`;

export const fontSize24px = () => css`
  font-size: clamp(1.5rem, 1.52vw, 1.55rem);
`;

export const fontSize32px = () => css`
  font-size: clamp(2rem, 2.05vw, 2.05rem);
`;

export const fontSize36px = () => css`
  font-size: clamp(2.25rem, 2.25vw, 2.26rem);
`;

export const fontSize40px = () => css`
  font-size: clamp(2.5rem, 2.55vw, 2.6rem);
`;

export const fontSize50px = () => css`
  font-size: clamp(3.125rem, 3.125vw, 3.13rem);
`;

export const fontSize56px = () => css`
  font-size: clamp(3.5rem, 3.55vw, 3.56rem);
`;

export const fontSize60px = () => css`
  font-size: clamp(3.75rem, 3.76vw, 3.78rem);
`;

export const OverLayEffect = css`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
  cursor: pointer;
  transition: all 0.5s;
`

export const hiddenElementLessThan767px = css`
  @media (max-width:767px) {
      display: none;
  }
`

export const hiddenElementMoreThan768px = css`
  @media (min-width:768px) {
      display: none;
  }
`

export const hiddenElementMoreThan1440px = css`
  @media (min-width:1440px) {
      display: none;
  }
`

export const SizeofOriginalContentsForDevicesMoreThan1440px = css`
  @media (min-width:1440px) {
    width: 90rem;
    margin-inline: auto;
}
`

export const backgroundImage = (imageUrl: string) => css`
  background-image: url(${imageUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

export const transitionHovers = css`
  &:hover{
    transition:all 0.5s;
  }
`

export const ButtonStyle = (pd: string, br: string, ftWeight: string) => css`
  padding: ${pd};
  border-radius: ${br};
  font-weight: ${ftWeight};
  cursor: pointer;
  border: none;
  width: 15rem;

  &:hover , &:active , &:focus {
    ${transitionHovers};
  }
`;


export const fontStyles = (ftFamily: string, ftWeight: string, textClr: string, lineHeight?: string, ltSpacing?: string) => css`
  font-weight: ${ftWeight};
  font-family: ${ftFamily};
  color: ${textClr};
  line-height: ${lineHeight};
  letter-spacing: ${ltSpacing};
`