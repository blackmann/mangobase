import React from 'preact/compat'
import randomStr from './random-str'
import { signal } from '@preact/signals'

interface Snack {
  id: string
  type: 'success' | 'error' | 'neutral' | 'custom'
  content: string | React.ReactNode
  duration: number
}

const snacks = signal<Snack[]>([])

function addSnack(snack: Omit<Snack, 'id'>) {
  const id = randomStr(6)
  snacks.value = [...snacks.value, { ...snack, id }]

  setTimeout(() => {
    removeSnack(id)
  }, snack.duration)

  return id
}

function removeSnack(id: string) {
  snacks.value = snacks.value.filter((snack) => snack.id !== id)
}

export { addSnack, removeSnack, snacks }
