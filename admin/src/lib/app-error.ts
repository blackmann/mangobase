class AppError extends Error {
  data: any

  constructor(message: string, data: any) {
    super(message)
    this.data = data
  }
}

export default AppError
