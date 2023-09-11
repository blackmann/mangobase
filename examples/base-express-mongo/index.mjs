import { App } from 'mangobase'
import { MongoDb } from '@mangobase/mongodb'
import { expressServer } from '@mangobase/express'

const app = new App({
  db: new MongoDb('mongodb://127.0.0.1:27017/mangobase-demo'),
})

app.hooksRegistry.register({
  id: 'throttle',
  name: 'Throttle',
  description: 'Adds artificial latency to requests',
  configSchema: {
    delay: { type: 'number', required: true, defaultValue: 200 },
    prod_only: { type: 'boolean', defaultValue: true },
    except_email: { type: 'string' },
  },
  async run(ctx, config) {
    // add delay
    return ctx
  },
})

process.env.SECRET_KEY = 'test-key'
const PORT = process.env.PORT || 3000

app.serve(expressServer).listen(PORT, () => {
  console.log(`App started`)
  console.log(`API base url: http://localhost:${PORT}/api/`)
  console.log(`Admin: http://localhost:${PORT}/_/`)
})
