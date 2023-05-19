class ServiceError extends Error {
  name = 'GeneralError'
  statusCode = 500
  data: any

  constructor(message?: string, data?: any) {
    super(message)
    this.data = data
  }
}

class BadRequest extends ServiceError {
  name = 'BadRequest'
  statusCode = 400
}

class InternalServerError extends ServiceError {
  name = 'InternalServerError'
  statusCode = 500
}

class MethodNotAllowed extends ServiceError {
  name = 'MethodNotAllowed'
  statusCode = 405
}

class NotFound extends ServiceError {
  name = 'NotFound'
  statusCode = 404
}

export {
  BadRequest,
  InternalServerError,
  MethodNotAllowed,
  NotFound,
  ServiceError,
}
