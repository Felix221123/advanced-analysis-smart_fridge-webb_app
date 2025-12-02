import styled from "styled-components";
import { flex, flexCenter } from "../mixin";




export const TabContainer = styled.div`
    width: 94%;
    height: auto;
    margin-inline:auto;
    margin-top: 1.5rem;
    background-color: ${props => props.theme.colors.lightGreyish};
    border-radius: 1.5rem;
`

export const InventoryContainer = styled.div`
    padding: 2.5rem 1.5rem;
    ${flex('column')};
    gap: 1rem;

    > .heading {
        ${flexCenter('row', 'space-between')};

        > .tabHeader{
            ${flex('column')};
            gap: 0.25rem;
        }
    }

    > .itemSearch {
        width: inherit;
        display: grid;
        grid-template-columns: 0.8fr 0.2fr;
        align-items: center;
        gap: 2.5rem;
    }

    > .stocksContainer {
        ${flex("column")};
        width: inherit !important;
        height: 25rem !important;
        overflow-y: auto;
        white-space: nowrap;


        &::-webkit-scrollbar {
            width: 0.25rem !important;
        }

        &::-webkit-scrollbar-track {
            background: ${props => props.theme.colors.lightGreyish} !important;
            border-radius: 5rem !important;
        }

        &::-webkit-scrollbar-thumb {
            background-color: ${props => props.theme.colors.greyishBlack} !important;
            border-radius: 5rem !important;
        }

        > .scrollable {
            width: 100%;
            ${flexCenter("column", "flex-start")};
            gap: 0.5rem;
            align-items: flex-start;
        }
    }
`