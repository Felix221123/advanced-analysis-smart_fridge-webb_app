// src/testing/test-utils.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import theme from '@/styles/theme';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </MemoryRouter>
    );
};

const customRender = (ui: React.ReactElement, options = {}) =>
    render(ui, { wrapper: AllTheProviders, ...options });


export { customRender as render };