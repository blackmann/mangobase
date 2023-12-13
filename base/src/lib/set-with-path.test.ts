import { describe, expect, it } from 'vitest'
import setWithPath from './set-with-path.js'

const data = {
  address: {
    city: 'Accra',
    country: 'Ghana',
  },
  name: 'mock',
}

describe('set-with-path', () => {
  it('should set value of field', () => {
    const path = ['name']
    const value = 'mock-change'

    setWithPath(data, path, value)

    expect(data.name).toBe(value)
  })

  it('should set a value in a nested object', () => {
    const path = ['address', 'city']
    const value = 'Kumasi'

    setWithPath(data, path, value)

    expect(data.address.city).toBe(value)
  })
})
