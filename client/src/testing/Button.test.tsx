// @ts-expect-error ignore the next line
import React from 'react'
import { describe, it,expect } from 'vitest'
import { render } from '@/utils/test-utils'
import { AppButton, AuthButton } from '@/components/BaseButton'
import { screen } from '@testing-library/react'


describe('Authentication Button Components', () => {
    it('it should display the button', () => {
        render(<AuthButton text='Login' onClick={() => { }} />);

        const authButton = screen.getByTestId("auth-button");

        expect(authButton).toHaveTextContent("Login");
    })
})


describe('App Button Components', () => {
    it('it should display the button', () => {
        render(<AppButton text='Order' onClick={() => { }} />);

        const authButton = screen.getByTestId("app-button");

        expect(authButton).toHaveTextContent("Order");
    })
})
