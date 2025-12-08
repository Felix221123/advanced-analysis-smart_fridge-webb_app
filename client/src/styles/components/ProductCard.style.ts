import styled from "styled-components";
import { flex, flexCenter, fontSize14px, fontSize20px } from "../mixin";



export const ProductCardContainer = styled.div`
    width: 100%;
    padding: 1rem 2rem;
    background: ${(props) => props.theme.colors.whiteClr};
    border: 1px solid ${(props) => props.theme.colors.lightGreyish};
    border-radius: 1rem;
    ${flex("column")};
    gap: 1rem;
`

export const CardHeader = styled.div`
    width: 100%;
    ${flexCenter("row", "space-between")};

    > .itemNameContainer{
        ${flex('row')};
        gap: 1.5rem;

        > .item_name{
            ${fontSize20px()};
        }

        .status-area {
            ${flex("row")};
            gap: 0.5rem;
        }
    }
`;

export const StatusPill = styled.span`
    padding: 0.3rem 0.7rem;
    border-radius: 0.5rem;
    background: ${(props) => props.theme.colors.accentOrange};
    color: ${(props) => props.theme.colors.whiteClr};
    font-weight: 600;
    ${fontSize14px()};
`;

export const RolePill = styled.span<{ $role?: string }>`
    padding: 0.3rem 0.7rem;
    border-radius: 0.5rem;
    font-weight: 600;
    color: ${props => props.theme.colors.whiteClr};
    ${fontSize14px()};
    text-transform: uppercase;
    background-color: ${({ $role, theme }) =>
        $role === 'HEAD_CHEF'
            ? theme.colors.pastelPurple
            : $role === 'CHEF'
                ? theme.colors.accentBlue300
                : $role === 'DELIVERY_PERSON'
                    ? 'green'
                    : $role === 'ADMIN'
                        ? theme.colors.greyishBlack
                        : theme.colors.accentOrange
    };
`;

export const StatusPillStockContainerExpiring = styled.span`
    padding: 0.3rem 0.7rem;
    border-radius: 0.5rem;
    background: red;
    color: ${(props) => props.theme.colors.whiteClr};
    font-weight: 600;
    ${fontSize14px()};
`;

export const InfoRow = styled.div`
    width: 100%;
    ${flex("row")};
    align-items: center;
    gap: 0.7rem;
    flex-wrap: wrap;

    &.added-by {
        color: ${(props) => props.theme.colors.neutralGrey600};
        font-size: 0.85rem;
        margin-top: -0.5rem;
    }
`;

export const InfoLabel = styled.span`
    font-weight: 400;
    color: ${(props) => props.theme.colors.greyish};
`;

export const ButtonGroup = styled.div`
    ${flexCenter("row", "center")};
    gap: 0.7rem;
`;