function setWithPath(obj: Record<string, any>, path: string[], value: any) {
  let current = obj
  let i = 0
  for (; i < path.length - 1; i++) {
    current = current[path[i]]
  }

  current[path[i]] = value
}

export default setWithPath
