// @ts-expect-error ignore the next line
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@/utils/test-utils'
import { screen } from '@testing-library/react'
import { UserModal } from '@/components/UserModal'
import userEvent from "@testing-library/user-event";



describe('Item Modal Component', () => {
    it('it should display the item modal with the right context', () => {
        render(<UserModal
            title='Add new User'
            onClose={() => { }}
            description='add new user'
            newUser={true}
        />
        );

        const heading = screen.getByTestId("heading");

        expect(heading).toBeInTheDocument();
    });

    it('should allow typing in user name in the input', async () => {
        const user = userEvent.setup();

        render(<UserModal
            title='Add new User'
            onClose={() => { }}
            description='add new user'
            newUser={true}
        />
        );

        const itemName = screen.getByPlaceholderText("Full Name");

        await user.type(itemName, "Felix Baah");

        expect(itemName).toHaveValue("Felix Baah");

    });

    it('should allow typing in user email in the input', async () => {
        const user = userEvent.setup();

        render(<UserModal
            title='Add new User'
            onClose={() => { }}
            description='add new user'
            newUser={true}
        />
        );

        const itemName = screen.getByPlaceholderText("Email");

        await user.type(itemName, "felix@gmail.com");

        expect(itemName).toHaveValue("felix@gmail.com");

    });
})