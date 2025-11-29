// src/testing/test-utils.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '@/styles/theme';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (

        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>

    );
};

const customRender = (ui: React.ReactElement, options = {}) =>
    render(ui, { wrapper: AllTheProviders, ...options });


export { customRender as render };