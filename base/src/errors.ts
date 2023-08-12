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

class Conflict extends ServiceError {
  name = 'Conflict'
  statusCode = 409
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

class Unauthorized extends ServiceError {
  name = 'Unauthorized'
  statusCode = 401
}

export {
  BadRequest,
  Conflict,
  InternalServerError,
  MethodNotAllowed,
  NotFound,
  ServiceError,
  Unauthorized,
}
