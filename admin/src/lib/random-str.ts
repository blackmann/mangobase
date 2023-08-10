const candidates =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

function randomStr(length = 8) {
  return Array.from({ length })
    .map(() => candidates[Math.floor(Math.random() * candidates.length)])
    .join(',')
}

export default randomStr
