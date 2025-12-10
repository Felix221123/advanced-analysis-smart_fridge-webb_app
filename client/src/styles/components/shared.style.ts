import styled from "styled-components";
import { flex, flexCenter, SizeofOriginalContentsForDevicesMoreThan1440px } from "../mixin";

export const PageContainer = styled.div`
    ${SizeofOriginalContentsForDevicesMoreThan1440px};
    padding: 0rem 2rem;
`


export const TabContainer = styled.div<{ $container?: string }>`
    width: 100%;
    height: auto;
    margin-inline:auto;
    margin-top: 1.5rem;
    margin-bottom:1rem;
    background-color: ${({ $container, theme }) =>
        $container === 'expiringSoon'
            ? theme.colors.lightOrange
            : $container === 'lowStockItems'
                ? theme.colors.lightRed
                : theme.colors.lightGreyish
    };
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

export const CountBox = styled.div<{ $container?: string }>`
    width: 100%;
    height: 12rem;
    padding: 1.5rem 3rem;
    ${flexCenter('column', 'space-between')};
    align-items: flex-start;
    border: 1px solid ${props => props.theme.colors.lightGreyish};
    border-radius: 2rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    background-color: ${({ $container, theme }) =>
        $container === 'red'
            ? theme.colors.lightRed
            : $container === 'yellow'
                ? theme.colors.lightYellow
                : $container === 'green'
                    ? theme.colors.lightGreen
                    : theme.colors.whiteClr
    };

    > .bottomBox {
        ${flex('column')};
    }
`

export const CountContainerBox = styled.div`
    ${flex('row')};
    align-items: center;
    gap: 1.5rem;
`

export const StockBox = styled.div` 
    padding: 2.5rem 1.5rem;
    ${flex('column')};
    gap: 1rem;

    > .heading {
        ${flexCenter('row', 'space-between')};

        > .tabHeader{
            ${flex('column')};
            gap: 0.25rem;

            > .headerIcon{
                ${flex('row')};
                gap: 0.25rem;
            }
        }
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

    > .itemsContainer {
        ${flex("row")};
        gap: 1.5rem;
        align-items:center;
    }
`