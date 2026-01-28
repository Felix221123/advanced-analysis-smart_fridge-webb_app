import styled from "styled-components";
import {
    flexCenter,
    fontSize18px,
    fontSize24px,
} from "@/styles/mixin";



export const MessageSuccessModal = styled.div`
    width: 30%;
    height: auto;
    border-radius: 2.5rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: ${props => props.theme.zIndex.modal};
    background-color: ${props => props.theme.colors.whiteClr};
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    
    overflow: hidden;

    @media( max-width: 1300px){
      width: 80%;
    }

    > .progressBar {
      position: absolute;
      top: 0;
      left: 0;
      height: 6px;
      width: 0%;
      background: ${({ theme }) => theme.colors.darkShade};
      animation: loading 8s linear forwards;
    }

    @keyframes loading {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    
    > .container {
        ${flexCenter('column', 'center')};
        gap: 1rem;
        padding: 2rem 1.5rem;

        > .messageHeading * {
            ${fontSize24px} !important;
            font-family: ${props => props.theme.fonts.poppinsFont};

            @media( max-width: 767px){
              ${fontSize18px};
            }
        }
    }
`