import styled from "styled-components";
import { flexCenter } from "../mixin";





export const PanelContainer = styled.div`
    width: 100%;
    padding: 1.5rem 2.5rem;
    border-bottom: 1px solid ${props => props.theme.colors.darkShade};
    position: sticky;
    top: 0;
    z-index: ${props => props.theme.zIndex.navbar};
    background-color:${props => props.theme.colors.glassmorphism_clr};
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    
    > .panel {
        ${flexCenter('row', 'space-between')};

        > .profile {
            ${flexCenter('row', 'center')};
            gap: 1.5rem;

            > .userProfile {
                ${flexCenter('column')};
                align-items: flex-end;
            }

        }
    }
`