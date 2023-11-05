function* indexed<T>(array: Array<T>) {
  let i = 0
  while (i < array.length) {
    yield [array[i], i] as const
    i++
  }
}

export default indexed
