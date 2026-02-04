// src/testing/test-utils.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '@/styles/theme';
import { AuthProvider } from '@/context/AuthContext';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </AuthProvider>

    );
};

const customRender = (ui: React.ReactElement, options = {}) =>
    render(ui, { wrapper: AllTheProviders, ...options });


export { customRender as render };