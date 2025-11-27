// @ts-expect-error ignore the next line
import React from 'react'
import { describe, it } from 'vitest'
import App from './App'
import { render } from './utils/test-utils'

describe('App Component', () => {
  it('it should display hello world', () => {
    render(<App />)
  })
})
