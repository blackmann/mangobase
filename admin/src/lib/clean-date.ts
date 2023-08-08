import dayjs from 'dayjs'

function cleanDate(date: Date | string) {
  return dayjs(date).format('DD/MM/YYYY')
}

function cleanTime(date: Date | string) {
  return dayjs(date).format('hh:mm:ss')
}

export { cleanDate, cleanTime }
