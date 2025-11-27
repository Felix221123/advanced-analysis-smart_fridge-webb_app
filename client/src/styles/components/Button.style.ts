import styled from "styled-components";
import { ButtonStyle, flexCenter, fontSize16px } from "../mixin";






export const ButtonCompStyle = styled.button`
  ${ButtonStyle("0.75rem 2.5rem", "5rem", "500")};
  background-color: ${props => props.theme.colors.darkShade};
  color: ${props => props.theme.colors.whiteClr};
  ${flexCenter("column", "center")};
  ${fontSize16px};

  &:hover {
    opacity: 0.85;
  }
`;