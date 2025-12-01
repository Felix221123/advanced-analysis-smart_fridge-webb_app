// @ts-expect-error ignore the next line
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@/utils/test-utils'
import { screen } from '@testing-library/react'
import { ItemModal } from '@/components/ItemModal'
import userEvent from "@testing-library/user-event";


describe('Item Modal Component', () => {
    it('it should display the item modal with the right context', () => {
        render(<ItemModal
            title='Add new Item'
            onClose={() => { }}
            description='add new items'
            newItem={true}
        />
        );

        const heading = screen.getByTestId("heading");

        expect(heading).toBeInTheDocument();
    });

    it('should allow typing in item name input', async () => {
        const user = userEvent.setup();

        render(<ItemModal
            title='Add new Item'
            onClose={() => { }}
            description='add new items'
            newItem={true}
        />
        );

        const itemName = screen.getByTestId("itemName");

        await user.type(itemName, "Salmon Fillets");

        expect(itemName).toHaveValue("Salmon Fillets");

    });
})