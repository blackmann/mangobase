function onDev(path: string) {
  return `_dev/${path}`
}

function unexposed(path: string) {
  return `_x/${path}`
}

export { onDev, unexposed }
