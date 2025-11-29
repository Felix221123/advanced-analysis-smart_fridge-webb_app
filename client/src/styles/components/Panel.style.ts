import styled from "styled-components";
import { flexCenter } from "../mixin";





export const PanelContainer = styled.div`
    width: 100%;
    height: 100%;
    padding: 1.5rem 2.5rem;
    border-bottom: 1px solid ${props => props.theme.colors.darkShade};
    position: static;
    top: 0;
    
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