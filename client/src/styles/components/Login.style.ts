import styled from "styled-components";
import { flex, flexCenter } from "../mixin";





export const LoginPage = styled.div`
    width: 100%;
    height: 100%;
    margin: 5rem auto;

    > .container {
        ${flexCenter('row', 'center')};
        gap: 2rem;

        > .rightSection {
            ${flex('column')};
            gap: 2rem;

            > form {
                ${flexCenter('column', 'center')};
                gap: 1.5rem;
            }
        }
    }
`