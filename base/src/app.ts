import Context from './context'
import { Database } from './database'
import Manifest from './manifest'
import { createRouter } from 'radix3'

type Handle = (ctx: Context) => Context

interface Service {
  handle: Handle
  register: (app: App, install: (subpath: string) => void) => void
}

class Pipeline {
  private app: App
  private service: Service

  constructor(app: App, service: Service) {
    this.app = app
    this.service = service
  }

  async run(ctx: Context): Promise<Context> {
    // run app before hooks
    // run service before hooks
    // run service
    // run service after hooks
    // run app after hooks
    throw new Error('TODO: implement')
  }
}

class AnonymouseService implements Service {
  handle: Handle

  constructor(handle: Handle) {
    this.handle = handle
  }

  register(app: App, install: (subpath: string) => void) {
    install('')
  }
}

interface Options {
  database: Database
}

class App {
  private routes = createRouter()
  database: Database
  manifest: Manifest

  constructor(options: Options) {
    this.database = options.database
    this.manifest = new Manifest()
  }

  use(path: string, handle: Handle): Pipeline
  use(path: string, service: Service): Pipeline
  use(path: string, handleOrService: Service | Handle): Pipeline {
    const service: Service =
      typeof handleOrService === 'function'
        ? new AnonymouseService(handleOrService)
        : handleOrService

    const pipeline = new Pipeline(this, service)
    service.register(this, (subpath) =>
      this.register(`${path}/${subpath}`, pipeline)
    )

    return pipeline
  }

  private register(path: string, pipeline: Pipeline) {
    this.routes.insert(path, pipeline)
  }
}

export default App
export { Pipeline }
