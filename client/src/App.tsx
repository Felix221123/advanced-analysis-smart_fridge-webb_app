// @ts-expect-error ignore the next line
import React from 'react'
import { ThemeProvider } from 'styled-components'
import theme from './styles/theme'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { AppRoute } from './routes/AppRoute'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <AppRoute />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
