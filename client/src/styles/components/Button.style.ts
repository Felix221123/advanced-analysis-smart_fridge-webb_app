import styled, { css } from "styled-components";
import { flexCenter, fontSize16px, ButtonStyle } from "../mixin";

export type Variant = "primary" | "secondary" | "outline" | "success";

export const variantStyles = {
  primary: css`
    background-color: ${props => props.theme.colors.darkShade};
    color: ${props => props.theme.colors.whiteClr};
  `,

  secondary: css`
    background-color: ${props => props.theme.colors.lightGreyish};
    color: ${props => props.theme.colors.darkShade};
  `,

  outline: css`
    background-color: transparent;
    border: 1px solid ${props => props.theme.colors.greyishBlack};
    color: ${props => props.theme.colors.darkShade};

    &:hover {
      background-color: ${props => props.theme.colors.lightGreyish};
      opacity: 0.75;
      transition:all 0.3s ease;
    }
  `,

  success: css`
    background-color: green;
    color: white;
  `
};


interface StyleProps {
  variant: "primary" | "secondary" | "outline" | "success";
  fullWidth?: boolean;
}



export const ButtonCompStyle = styled.button`
  ${ButtonStyle("0.75rem 2.5rem", "5rem", "500")};
  background-color: ${props => props.theme.colors.darkShade};
  color: ${props => props.theme.colors.whiteClr};
  ${flexCenter("column", "center")};
  ${fontSize16px};
  width: 100%;

  &:hover {
    opacity: 0.85;
  }
`;


export const BaseButton = styled.button<StyleProps>`
  ${ButtonStyle("0.75rem 1.5rem", "0.75rem", "500")};
  ${flexCenter("row", "center")};
  ${fontSize16px};
  gap: 0.5rem;
  border: none;
  cursor: pointer;

  ${({ fullWidth }) => fullWidth && "width: 100%;"};
  ${({ variant }) => variantStyles[variant]};

  &:hover {
    opacity: 0.85;
    transition: 0.3s ease;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;