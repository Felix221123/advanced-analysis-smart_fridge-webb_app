import styled from "styled-components";
import { flexCenter, flex } from "../mixin";

export const NavigationTab = styled.div`
    width: fit-content;
    height: auto;
    background: ${props => props.theme.colors.lightGreyish};
    border-radius: 2rem;
    margin-top: 1.5rem;
    margin-left:2.5rem;
    padding: 0.5rem;
    ${flex("row")};
    gap: 1.5rem;
`;

export const NavItem = styled.div`
    ${flexCenter("row", "center")};
    gap: 0.5rem;
    padding: 0.55rem 1rem;
    border-radius: 1.5rem;
    font-size: 0.95rem;
    font-weight: 500;
    color: #1f1f1f;
    cursor: pointer;
    position: relative;

    transition: all 0.25s ease;

    &:hover {
        background: #ececf3;
    }

    &.active {
        background: white;
        box-shadow: 0 0 4px rgba(0,0,0,0.08);
    }

    span {
        display: flex;
        align-items: center;
    }
`;

export const NavBadge = styled.div`

    background: #c5292a;
    color: white;

    padding: 0.15rem 0.45rem;
    font-size: 0.7rem;
    border-radius: 1rem;

    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: 600;
`;
