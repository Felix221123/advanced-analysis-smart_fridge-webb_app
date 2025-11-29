// @ts-expect-error ignore the next line
import React from 'react'
import { describe, it,expect } from 'vitest'
import { render } from '@/utils/test-utils'
import { screen } from '@testing-library/react'
import { Header } from '@/components/Header'
import { SubHeader } from '@/components/SubHeader'
import { MiniSubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'

describe('Text Header Components', () => {
    it('it should display the header', () => {
        render(<Header text='Welcome back'/>);

        const header = screen.getByTestId("header");

        expect(header).toHaveTextContent("Welcome back");
    })
})


describe('Text Sub Header Components', () => {
    it('it should display the sub header', () => {
        render(<SubHeader text='Head Chef Dashboard' />);

        const sub_header = screen.getByTestId("sub-header");

        expect(sub_header).toHaveTextContent("Head Chef Dashboard");
    })
})


describe('Text Mini Sub Header Components', () => {
    it('it should display the mini sub header', () => {
        render(<MiniSubHeader text='Admin' />);

        const mini_sub_header = screen.getByTestId("mini-subheader");

        expect(mini_sub_header).toHaveTextContent("Admin");
    })
})


describe('Text Paragraph Components', () => {
    it('it should display the paragraph', () => {
        render(<Paragraph text='Order Quantity' />);

        const paragraph = screen.getByTestId("paragraph");

        expect(paragraph).toHaveTextContent("Order Quantity");
    })
})
