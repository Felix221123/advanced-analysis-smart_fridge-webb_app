// modal styles
import styled from 'styled-components'
import { flex, flexCenter } from '../mixin'

export const ModalContainer = styled.div`
  width: 50%;
  height: auto;
  background-color: ${props => props.theme.colors.whiteClr};
  border-radius: 2rem;
  padding: 4rem 4rem;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: ${props => props.theme.zIndex.modal};
`

export const UserModalContainer = styled.div`
    ${flexCenter('column', 'center')};
    gap: 1.5rem;
    width: 100%;

    > .container {
        > .heading {
            ${flexCenter('row', 'space-between')};
            gap: 1.5rem;
        }
    }

    > .form_container {
      width: 100%;

      > form {
      ${flex('column')};
      align-items: flex-start;
      gap: 1rem;
      width: 100%;

      > .form-group {
        ${flexCenter('column', 'space-between')};
        align-items: flex-start;
        gap: 0.5rem;
        width: inherit;
      }

      > .form_buttons {
        ${flexCenter('row', 'space-between')};
        gap: 1.5rem;
        width: inherit;
      }
    }
`


export const ItemModalContainer = styled.div`
    ${flexCenter('column', 'center')};
    gap: 1.5rem;
    width: 100%;

    > .container {
        > .heading {
            ${flexCenter('row', 'space-between')};
            gap: 1.5rem;
        }
    }

    > .form_container {
      width: 100%;

      > form {
      ${flex('column')};
      align-items: flex-start;
      gap: 1rem;
      width: 100%;

      > .form-group {
        ${flexCenter('row', 'center')};
        gap: 2rem;
        width: inherit;

        > .container {
          ${flexCenter('column', 'space-between')};
          align-items: flex-start;
          gap: 0.5rem;
          width: inherit;
        }
      }

      > .form_buttons {
        ${flexCenter('row', 'space-between')};
        gap: 1.5rem;
        width: inherit;
      }
    }
`

