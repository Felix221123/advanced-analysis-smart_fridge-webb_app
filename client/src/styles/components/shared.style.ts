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
            : $container === 'lowStockItems' || $container === 'expired'
                ? theme.colors.lightRed
                : $container === 'complianceItems'
                    ? theme.colors.lightGreen
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

    > .buttonContainer {
        ${flex("row")};
        gap: 1.5rem;
        align-items:center;
    }
`

export const DeliveryPersonOuterContainer = styled.div`
    ${flexCenter('column', 'center')};
    margin-bottom: 2rem;
`

export const DeliveryPersonContainer = styled.div`
    width: 70%;
    margin-top: 1.5rem;
    margin-bottom:1rem;
    border: 1px solid ${props => props.theme.colors.lightGreyish};
    border-radius: 2rem;
    padding: 2rem 2rem;
    ${flex('column')};
    gap: 1rem;

    > .buttonContainer {
        ${flex("column")};
        gap: 1rem;
        align-items:center;
    }

    > .deliveryTextSection2 {
        ${flex("column")};
        gap: 1rem;
    }
    > .deliveryTextSection1 {
        ${flexCenter("row", 'flex-start')};
        gap: 1rem;
    }
`

export const DoorAccessController = styled.div<{ $doorStatus: boolean }>`
    width: 100%;
    height: 5rem;
    padding: 0.75rem 2rem;
    background-color: ${props => props.theme.colors.backgroundLight};
    ${flexCenter('row', 'space-between')};
    border-radius: 2rem;


    > .textSectionStatus{
        ${flexCenter('row', 'center')};
        gap: 1rem;

        > .statusBall {
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            background-color: ${({ $doorStatus }) =>
            $doorStatus ? 'green'
                : 'red'
            }; 
        }

        > .text {
            ${flex('column')};
        }
    }
`
